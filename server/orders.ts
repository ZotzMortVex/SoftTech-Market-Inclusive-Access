import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "./auth";
import { database } from "./db";
import { ensureOrderSchema } from "./orderStore";

const ORDER_STATUSES = ["pendiente", "preparacion", "enviado", "entregado"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}

function normalizeOrderStatus(status: string): OrderStatus {
  if (status === "confirmado") return "pendiente";
  if (status === "despachado" || status === "en_camino") return "enviado";
  return ORDER_STATUSES.find((candidate) => candidate === status) ?? "pendiente";
}

interface OrderRow extends RowDataPacket {
  orderId: string;
  userId: string | null;
  total: number | string;
  status: string;
  orderDetails: string | null;
  date: string;
  recipientName: string | null;
  userEmail: string | null;
}

interface OrderItemRow extends RowDataPacket {
  orderId: string;
  productId: string;
  code: string;
  name: string;
  category: string;
  quantity: number | string;
  price: number | string;
  imageUrl: string | null;
}

function parseOrderDetails(value: string | null): Record<string, unknown> {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Stored order details have an invalid format.");
  }
  return parsed as Record<string, unknown>;
}

async function readOrders(userId?: string): Promise<unknown[]> {
  await ensureOrderSchema();
  const whereClause = userId ? "WHERE o.user_id = ?" : "";
  const parameters = userId ? [userId] : [];
  const [orders] = await database.execute<OrderRow[]>(
    `SELECT o.order_id AS orderId, o.user_id AS userId,
            CAST(o.total AS DOUBLE) AS total, o.status,
            o.order_details AS orderDetails,
            DATE_FORMAT(o.created_at, '%d/%m/%Y %H:%i') AS date,
            u.name AS recipientName, u.email AS userEmail
     FROM sales_orders o
     LEFT JOIN users u ON u.id = o.user_id
     ${whereClause}
     ORDER BY o.created_at DESC`,
    parameters,
  );
  if (orders.length === 0) return [];

  const orderIds = orders.map((order) => order.orderId);
  const [items] = await database.query<OrderItemRow[]>(
    `SELECT i.order_id AS orderId, i.product_id AS productId,
            i.product_code AS code, i.product_name AS name, i.category,
            i.quantity, CAST(i.unit_price AS DOUBLE) AS price,
            p.primary_image_url AS imageUrl
     FROM sales_order_items i
     LEFT JOIN products p ON p.id = i.product_id
     WHERE i.order_id IN (?)
     ORDER BY i.id`,
    [orderIds],
  );
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const item of items) {
    const orderItems = itemsByOrder.get(item.orderId) ?? [];
    orderItems.push(item);
    itemsByOrder.set(item.orderId, orderItems);
  }

  return orders.map((order) => {
    const total = Number(order.total);
    const details = parseOrderDetails(order.orderDetails);
    const status = normalizeOrderStatus(order.status);
    return {
      ...details,
      orderId: order.orderId,
      userId: order.userId,
      userEmail: order.userEmail ?? undefined,
      recipientName:
        typeof details.recipientName === "string"
          ? details.recipientName
          : order.recipientName ?? "",
      date: order.date,
      status,
      total,
      subtotal: Number(details.subtotal ?? total),
      tax: Number(details.tax ?? 0),
      shipping: Number(details.shipping ?? 0),
      shippingChannel:
        typeof details.shippingChannel === "string"
          ? details.shippingChannel
          : "dashboard",
      shippingAddress:
        typeof details.shippingAddress === "string"
          ? details.shippingAddress
          : "",
      city: typeof details.city === "string" ? details.city : "",
      contactNumber:
        typeof details.contactNumber === "string" ? details.contactNumber : "",
      notes: typeof details.notes === "string" ? details.notes : undefined,
      visualCheckConfirmed: details.visualCheckConfirmed === true,
      items: (itemsByOrder.get(order.orderId) ?? []).map((item) => ({
        productId: item.productId,
        code: item.code,
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity),
        price: Number(item.price),
        imageUrl: item.imageUrl,
      })),
    };
  });
}

export const ordersRouter = Router();

ordersRouter.get("/mine", async (request, response) => {
  const userId = request.session.userId;
  if (!userId) {
    response.status(401).json({ error: "Inicia sesión para consultar tus pedidos." });
    return;
  }

  try {
    const [users] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND role = 'user' AND active = TRUE LIMIT 1",
      [userId],
    );
    if (users.length === 0) {
      response.status(403).json({
        error: "El historial personal de pedidos solo está disponible para clientes registrados.",
      });
      return;
    }
    response.json(await readOrders(userId));
  } catch (error) {
    console.error("Unable to load the authenticated user's orders:", error);
    response.status(503).json({ error: "No se pudieron cargar tus pedidos." });
  }
});

ordersRouter.get("/", requireAdmin, async (_request, response) => {
  try {
    response.json(await readOrders());
  } catch (error) {
    console.error("Unable to load administrator orders:", error);
    response.status(503).json({ error: "No se pudieron cargar los pedidos." });
  }
});

ordersRouter.patch("/:orderId/status", requireAdmin, async (request, response) => {
  const orderId = request.params.orderId;
  const status: unknown = request.body?.status;
  if (
    !orderId ||
    orderId.length > 128 ||
    !isOrderStatus(status)
  ) {
    response.status(400).json({ error: "El número de pedido o el estado no son válidos." });
    return;
  }

  try {
    await ensureOrderSchema();
    const [result] = await database.execute<ResultSetHeader>(
      "UPDATE sales_orders SET status = ? WHERE order_id = ?",
      [status, orderId],
    );
    if (result.affectedRows === 0) {
      const [existing] = await database.execute<RowDataPacket[]>(
        "SELECT order_id FROM sales_orders WHERE order_id = ? LIMIT 1",
        [orderId],
      );
      if (existing.length === 0) {
        response.status(404).json({ error: "No se encontró el pedido solicitado." });
        return;
      }
    }
    response.json({ orderId, status });
  } catch (error) {
    console.error("Unable to update order status:", error);
    response.status(503).json({ error: "No se pudo actualizar el estado del pedido." });
  }
});
