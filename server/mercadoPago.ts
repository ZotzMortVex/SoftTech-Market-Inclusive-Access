import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { database } from "./db";
import { ensureOrderSchema } from "./orderStore";
import { parseSale } from "./simulatedPayments";

interface ProductRow extends RowDataPacket {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number | string;
  stockCount: number | string;
  imageUrl: string | null;
}

interface PendingOrderRow extends RowDataPacket {
  orderId: string;
  userId: string;
  preferenceId: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  orderDetails: string;
  items: string;
  status: "pending" | "approved";
  paymentId: string | null;
  userEmail?: string;
  userName?: string;
}

interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string | null;
  preference_id: string | null;
  transaction_amount: number;
  currency_id: string;
  live_mode: boolean;
  collector_id?: number;
  payer?: { email?: string };
}

interface StoredOrderItem {
  productId: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
}

const MAX_ORDER_QUANTITY = 100;
let mercadoPagoSchemaReady: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSandboxAccessToken(accessToken: string): boolean {
  return accessToken.startsWith("TEST-") || accessToken.startsWith("APP_USR-");
}

export function isMercadoPagoSandboxUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      /^sandbox\.mercadopago\.com(?:\.[a-z]{2,3})?$/.test(url.hostname)
    );
  } catch {
    return false;
  }
}

function getMercadoPagoConfig():
  | { accessToken: string; returnUrl: URL }
  | null {
  const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
  const configuredReturnUrl = process.env.MP_RETURN_URL?.trim();
  const sandboxEnabled = process.env.MP_ENVIRONMENT?.trim() === "sandbox";
  const isSandboxToken =
    accessToken !== undefined && isSandboxAccessToken(accessToken);
  if (!accessToken || !sandboxEnabled || !isSandboxToken || !configuredReturnUrl) {
    return null;
  }

  let returnUrl: URL;
  try {
    returnUrl = new URL(configuredReturnUrl);
  } catch {
    return null;
  }
  if (
    returnUrl.protocol !== "https:" ||
    returnUrl.username ||
    returnUrl.password ||
    returnUrl.pathname !== "/checkout"
  ) {
    return null;
  }

  return { accessToken, returnUrl };
}

async function ensureMercadoPagoSchema(): Promise<void> {
  if (!mercadoPagoSchemaReady) {
    mercadoPagoSchemaReady = database
      .query(`
        CREATE TABLE IF NOT EXISTS mercadopago_pending_orders (
          order_id VARCHAR(128) NOT NULL,
          user_id VARCHAR(64) NOT NULL,
          preference_id VARCHAR(128) NOT NULL,
          subtotal DECIMAL(14, 2) NOT NULL,
          tax DECIMAL(14, 2) NOT NULL,
          total DECIMAL(14, 2) NOT NULL,
          order_details LONGTEXT NOT NULL,
          items LONGTEXT NOT NULL,
          status VARCHAR(16) NOT NULL DEFAULT 'pending',
          payment_id VARCHAR(64) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (order_id),
          UNIQUE KEY mercadopago_preference_unique (preference_id),
          INDEX mercadopago_pending_user_idx (user_id)
        ) ENGINE=InnoDB
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        mercadoPagoSchemaReady = null;
        throw error;
      });
  }

  return mercadoPagoSchemaReady;
}

function readStoredItems(value: string): StoredOrderItem[] {
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        isRecord(item) &&
        typeof item.productId === "string" &&
        typeof item.code === "string" &&
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        typeof item.quantity === "number" &&
        typeof item.price === "number" &&
        (typeof item.imageUrl === "string" || item.imageUrl === null),
    )
  ) {
    throw new Error("Stored Mercado Pago order items are invalid.");
  }
  return parsed as StoredOrderItem[];
}

function buildOrderResponse(
  pending: PendingOrderRow,
  payment: MercadoPagoPayment,
  userEmail: string,
  userName: string,
) {
  const details: unknown = JSON.parse(pending.orderDetails);
  if (!isRecord(details)) {
    throw new Error("Stored Mercado Pago order details are invalid.");
  }
  const subtotal = Number(pending.subtotal);
  const tax = Number(pending.tax);
  const total = Number(pending.total);
  const receipt = {
    provider: "mercadopago_sandbox",
    paymentId: String(payment.id),
    accountEmail:
      typeof payment.payer?.email === "string"
        ? payment.payer.email
        : userEmail,
    amount: total,
    simulated: true,
  };
  const items = readStoredItems(pending.items);

  return {
    orderId: pending.orderId,
    userId: pending.userId,
    userEmail,
    recipientName: userName,
    date: new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    status: "pendiente",
    subtotal,
    tax,
    shipping: 0,
    total,
    ...details,
    payment: receipt,
    items,
  };
}

export const mercadoPagoRouter = Router();

mercadoPagoRouter.post("/preferences", async (request, response) => {
  const userId = request.session.userId;
  if (!userId) {
    response.status(401).json({ error: "Inicia sesión para pagar tu pedido." });
    return;
  }

  const config = getMercadoPagoConfig();
  if (!config) {
    response.status(503).json({
      error:
        "Checkout Pro sandbox no está configurado. Copia el Access Token desde el entorno Prueba de tu aplicación en Mercado Pago Developers y configura una MP_RETURN_URL pública HTTPS.",
    });
    return;
  }

  const sale = parseSale(request.body, false);
  if (!sale) {
    response.status(400).json({ error: "Los datos del pedido no son válidos." });
    return;
  }

  try {
    await ensureOrderSchema();
    await ensureMercadoPagoSchema();
    const [users] = await database.execute<RowDataPacket[]>(
      "SELECT id, email, name FROM users WHERE id = ? AND role = 'user' AND active = TRUE LIMIT 1",
      [userId],
    );
    const user = users[0] as
      | { id: string; email: string; name: string }
      | undefined;
    if (!user) {
      response.status(403).json({
        error: "Solo una cuenta de cliente activa puede realizar el pago.",
      });
      return;
    }

    const [existingOrders] = await database.execute<RowDataPacket[]>(
      "SELECT order_id FROM sales_orders WHERE order_id = ? LIMIT 1",
      [sale.orderId],
    );
    if (existingOrders.length > 0) {
      response.status(409).json({ error: "El número de pedido ya está registrado." });
      return;
    }

    const productIds = sale.items.map((item) => item.productId);
    const [products] = await database.query<ProductRow[]>(
      `SELECT id, code, name, category, CAST(price AS DOUBLE) AS price,
              stock_count AS stockCount, primary_image_url AS imageUrl
       FROM products WHERE active = TRUE AND id IN (?)`,
      [productIds],
    );
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productById.size !== productIds.length) {
      response.status(400).json({
        error: "Uno o más productos del pedido ya no están disponibles.",
      });
      return;
    }
    for (const item of sale.items) {
      const product = productById.get(item.productId);
      if (!product || Number(product.stockCount) < item.quantity) {
        response.status(409).json({
          error: "La cantidad solicitada supera las unidades disponibles.",
        });
        return;
      }
    }

    const subtotal = sale.items.reduce(
      (amount, item) =>
        amount + Number(productById.get(item.productId)?.price ?? 0) * item.quantity,
      0,
    );
    const tax = Math.round(subtotal * 0.19);
    const total = subtotal + tax;
    const storedItems: StoredOrderItem[] = sale.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) throw new Error("A validated Mercado Pago product disappeared.");
      return {
        productId: product.id,
        code: product.code,
        name: product.name,
        category: product.category,
        quantity: item.quantity,
        price: Number(product.price),
        imageUrl: product.imageUrl,
      };
    });
    const orderDetails = {
      ...sale.orderDetails,
      subtotal,
      tax,
      shipping: 0,
    };

    const items = storedItems.map((item) => ({
      id: item.productId,
      title: item.name,
      quantity: item.quantity,
      currency_id: "COP",
      unit_price: item.price,
    }));
    if (tax > 0) {
      items.push({
        id: "iva-19",
        title: "IVA (19%)",
        quantity: 1,
        currency_id: "COP",
        unit_price: tax,
      });
    }

    const backUrl = new URL(config.returnUrl);
    backUrl.searchParams.set("payment_return", "1");
    const preferenceResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": sale.orderId,
        },
        body: JSON.stringify({
          items,
          external_reference: sale.orderId,
          back_urls: {
            success: backUrl.toString(),
            pending: backUrl.toString(),
            failure: backUrl.toString(),
          },
          auto_return: "approved",
        }),
      },
    );
    const preferencePayload: unknown = await preferenceResponse.json().catch(
      () => null,
    );
    if (
      !preferenceResponse.ok ||
      !isRecord(preferencePayload) ||
      typeof preferencePayload.id !== "string" ||
      typeof preferencePayload.sandbox_init_point !== "string" ||
      !isMercadoPagoSandboxUrl(preferencePayload.sandbox_init_point)
    ) {
      console.error(
        "Mercado Pago sandbox preference creation failed:",
        preferenceResponse.status,
      );
      response.status(502).json({
        error:
          "Mercado Pago no devolvió una URL de checkout de prueba válida. Verifica la respuesta del proveedor y la configuración de la aplicación.",
      });
      return;
    }

    await database.execute<ResultSetHeader>(
      `INSERT INTO mercadopago_pending_orders
        (order_id, user_id, preference_id, subtotal, tax, total,
         order_details, items, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        sale.orderId,
        userId,
        preferencePayload.id,
        subtotal,
        tax,
        total,
        JSON.stringify(orderDetails),
        JSON.stringify(storedItems),
      ],
    );
    response.status(201).json({
      orderId: sale.orderId,
      sandboxInitPoint: preferencePayload.sandbox_init_point,
    });
  } catch (error) {
    console.error("Unable to create Mercado Pago sandbox preference:", error);
    response.status(503).json({
      error: "No se pudo preparar el checkout de Mercado Pago.",
    });
  }
});

mercadoPagoRouter.post("/confirm", async (request, response) => {
  const userId = request.session.userId;
  if (!userId) {
    response.status(401).json({ error: "Inicia sesión para confirmar el pago." });
    return;
  }
  const config = getMercadoPagoConfig();
  if (!config) {
    response.status(503).json({ error: "Checkout Pro sandbox no está configurado." });
    return;
  }
  if (
    !isRecord(request.body) ||
    typeof request.body.paymentId !== "string" ||
    !/^\d{1,32}$/.test(request.body.paymentId) ||
    typeof request.body.externalReference !== "string" ||
    request.body.externalReference.length > 128
  ) {
    response.status(400).json({ error: "La respuesta del pago no es válida." });
    return;
  }

  const paymentId = request.body.paymentId;
  const externalReference = request.body.externalReference;
  let connection: PoolConnection | undefined;
  try {
    await ensureOrderSchema();
    await ensureMercadoPagoSchema();
    const [pendingRows] = await database.execute<PendingOrderRow[]>(
      `SELECT p.order_id AS orderId, p.user_id AS userId,
              p.preference_id AS preferenceId, p.subtotal, p.tax, p.total,
              p.order_details AS orderDetails, p.items, p.status,
              p.payment_id AS paymentId, u.email AS userEmail, u.name AS userName
       FROM mercadopago_pending_orders p
       JOIN users u ON u.id = p.user_id
       WHERE p.order_id = ? AND p.user_id = ? AND u.active = TRUE
       LIMIT 1`,
      [externalReference, userId],
    );
    const pendingOrder = pendingRows[0];
    if (!pendingOrder) {
      response.status(404).json({ error: "No se encontró el checkout de este pedido." });
      return;
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      },
    );
    const paymentPayload: unknown = await paymentResponse.json().catch(() => null);
    if (
      !paymentResponse.ok ||
      !isRecord(paymentPayload) ||
      typeof paymentPayload.id !== "number" ||
      typeof paymentPayload.status !== "string" ||
      typeof paymentPayload.external_reference !== "string" ||
      typeof paymentPayload.preference_id !== "string" ||
      typeof paymentPayload.transaction_amount !== "number" ||
      typeof paymentPayload.currency_id !== "string" ||
      typeof paymentPayload.live_mode !== "boolean"
    ) {
      response.status(502).json({
        error: "No se pudo verificar el pago con Mercado Pago.",
      });
      return;
    }
    const payment = paymentPayload as unknown as MercadoPagoPayment;
    if (
      payment.status !== "approved" ||
      payment.external_reference !== pendingOrder.orderId ||
      payment.preference_id !== pendingOrder.preferenceId ||
      payment.transaction_amount !== Number(pendingOrder.total) ||
      payment.currency_id !== "COP" ||
      payment.live_mode !== false
    ) {
      response.status(409).json({
        error:
          payment.status === "pending"
            ? "Mercado Pago todavía está procesando el pago."
            : "Mercado Pago no confirmó un pago aprobado para este pedido de prueba.",
      });
      return;
    }

    connection = await database.getConnection();
    await connection.beginTransaction();
    const [lockedRows] = await connection.execute<PendingOrderRow[]>(
      `SELECT order_id AS orderId, user_id AS userId,
              preference_id AS preferenceId, subtotal, tax, total,
              order_details AS orderDetails, items, status,
              payment_id AS paymentId
       FROM mercadopago_pending_orders
       WHERE order_id = ? AND user_id = ? LIMIT 1 FOR UPDATE`,
      [externalReference, userId],
    );
    const lockedOrder = lockedRows[0];
    if (!lockedOrder) {
      await connection.rollback();
      response.status(404).json({ error: "No se encontró el checkout de este pedido." });
      return;
    }
    if (lockedOrder.status === "approved") {
      if (lockedOrder.paymentId !== paymentId) {
        await connection.rollback();
        response.status(409).json({ error: "El pedido ya fue pagado." });
        return;
      }
      await connection.commit();
      response.json({
        duplicate: true,
        order: buildOrderResponse(
          lockedOrder,
          payment,
          pendingOrder.userEmail ?? "",
          pendingOrder.userName ?? "",
        ),
      });
      return;
    }

    const details: unknown = JSON.parse(lockedOrder.orderDetails);
    const items = readStoredItems(lockedOrder.items);
    if (!isRecord(details)) {
      throw new Error("Stored Mercado Pago order details are invalid.");
    }
    const [existingOrders] = await connection.execute<RowDataPacket[]>(
      "SELECT order_id FROM sales_orders WHERE order_id = ? LIMIT 1",
      [lockedOrder.orderId],
    );
    if (existingOrders.length > 0) {
      throw new Error("Mercado Pago order reference is already registered.");
    }
    const productIds = items.map((item) => item.productId);
    const [products] = await connection.query<ProductRow[]>(
      `SELECT id, code, name, category, CAST(price AS DOUBLE) AS price,
              stock_count AS stockCount, primary_image_url AS imageUrl
       FROM products WHERE active = TRUE AND id IN (?) FOR UPDATE`,
      [productIds],
    );
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productById.size !== productIds.length) {
      await connection.rollback();
      response.status(409).json({ error: "Un producto del pedido ya no está disponible." });
      return;
    }
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product || Number(product.stockCount) < item.quantity) {
        await connection.rollback();
        response.status(409).json({
          error: "El inventario cambió mientras realizabas el pago. Contacta soporte.",
        });
        return;
      }
    }

    const paymentDetails = {
      provider: "mercadopago_sandbox",
      paymentId: String(payment.id),
      accountEmail:
        typeof payment.payer?.email === "string"
          ? payment.payer.email
          : pendingOrder.userEmail ?? "",
      amount: Number(lockedOrder.total),
      simulated: true,
    };
    const orderDetails = { ...details, payment: paymentDetails };
    await connection.execute<ResultSetHeader>(
      `INSERT INTO sales_orders (order_id, user_id, total, status, order_details)
       VALUES (?, ?, ?, 'pendiente', ?)`,
      [
        lockedOrder.orderId,
        userId,
        Number(lockedOrder.total),
        JSON.stringify(orderDetails),
      ],
    );

    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) throw new Error("Validated product disappeared during payment.");
      const remainingStock = Number(product.stockCount) - item.quantity;
      const [stockUpdate] = await connection.execute<ResultSetHeader>(
        `UPDATE products
         SET stock_count = ?, in_stock = ?
         WHERE id = ? AND active = TRUE AND stock_count >= ?`,
        [remainingStock, remainingStock > 0, product.id, item.quantity],
      );
      if (stockUpdate.affectedRows !== 1) {
        throw new Error("Product stock changed during Mercado Pago confirmation.");
      }
      await connection.execute<ResultSetHeader>(
        `INSERT INTO sales_order_items
          (order_id, product_id, product_code, product_name, category, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          lockedOrder.orderId,
          product.id,
          product.code,
          product.name,
          product.category,
          item.quantity,
          product.price,
        ],
      );
    }

    await connection.execute<ResultSetHeader>(
      `UPDATE mercadopago_pending_orders
       SET status = 'approved', payment_id = ?
       WHERE order_id = ? AND status = 'pending'`,
      [paymentId, lockedOrder.orderId],
    );
    await connection.commit();

    const confirmedPending = {
      ...lockedOrder,
      status: "approved" as const,
      paymentId,
    };
    response.status(200).json({
      duplicate: false,
      order: buildOrderResponse(
        confirmedPending,
        payment,
        pendingOrder.userEmail ?? "",
        pendingOrder.userName ?? "",
      ),
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Unable to roll back Mercado Pago payment:", rollbackError);
      }
    }
    console.error("Unable to verify Mercado Pago sandbox payment:", error);
    response.status(503).json({
      error: "No se pudo completar la verificación del pago.",
    });
  } finally {
    connection?.release();
  }
});
