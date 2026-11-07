import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { SIMULATED_PAYMENT_DEMO_CREDENTIALS, SIMULATED_PAYMENT_NO_FUNDS_CREDENTIALS } from "../src/utils/simulatedPayment";
import { database } from "./db";
import { ensureOrderSchema } from "./orderStore";
import { hashPassword, verifyPassword } from "./password";

interface SubmittedSale {
  orderId: string;
  items: { productId: string; quantity: number }[];
  orderDetails: {
    shippingChannel: "sms_visual" | "email_escrito" | "dashboard";
    shippingAddress: string;
    city: string;
    recipientName: string;
    contactNumber: string;
    notes?: string;
    visualCheckConfirmed: true;
  };
  paymentCredentials?: { email: string; password: string };
}

interface WalletRow extends RowDataPacket {
  id: string;
  email: string;
  passwordHash: string;
  balance: number | string;
}

interface CatalogProductRow extends RowDataPacket {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number | string;
  stockCount: number | string;
}

interface ExistingOrderRow extends RowDataPacket {
  userId: string | null;
  orderDetails: string | null;
}

interface PaymentDetails {
  provider: "mercadopago_simulado";
  paymentId: string;
  accountEmail: string;
  subtotal: number;
  tax: number;
  amount: number;
  balanceAfter: number;
  simulated: true;
}

const SHIPPING_CHANNELS = ["sms_visual", "email_escrito", "dashboard"] as const;
const MAX_ORDER_QUANTITY = 100;
let paymentSchemaReady: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSale(
  value: unknown,
  requirePaymentCredentials = true,
): SubmittedSale | null {
  if (
    !isRecord(value) ||
    typeof value.orderId !== "string" ||
    value.orderId.trim().length === 0 ||
    value.orderId.length > 128 ||
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > 50 ||
    !isRecord(value.orderDetails)
  ) {
    return null;
  }

  const details = value.orderDetails;
  const credentials = isRecord(value.paymentCredentials)
    ? value.paymentCredentials
    : undefined;
  if (
    typeof details.shippingChannel !== "string" ||
    !SHIPPING_CHANNELS.includes(
      details.shippingChannel as (typeof SHIPPING_CHANNELS)[number],
    ) ||
    typeof details.shippingAddress !== "string" ||
    details.shippingAddress.trim().length === 0 ||
    details.shippingAddress.length > 500 ||
    typeof details.city !== "string" ||
    details.city.trim().length === 0 ||
    details.city.length > 100 ||
    typeof details.recipientName !== "string" ||
    details.recipientName.trim().length === 0 ||
    details.recipientName.length > 150 ||
    typeof details.contactNumber !== "string" ||
    details.contactNumber.trim().length === 0 ||
    details.contactNumber.length > 40 ||
    (details.notes !== undefined &&
      (typeof details.notes !== "string" || details.notes.length > 1000)) ||
    details.visualCheckConfirmed !== true ||
    (requirePaymentCredentials && !credentials) ||
    (credentials !== undefined &&
      (typeof credentials.email !== "string" ||
        credentials.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) ||
        typeof credentials.password !== "string" ||
        credentials.password.length === 0 ||
        credentials.password.length > 128))
  ) {
    return null;
  }

  const itemsByProduct = new Map<string, number>();
  for (const item of value.items) {
    if (
      !isRecord(item) ||
      typeof item.productId !== "string" ||
      item.productId.trim().length === 0 ||
      item.productId.length > 64 ||
      !Number.isInteger(item.quantity) ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > MAX_ORDER_QUANTITY
    ) {
      return null;
    }

    const productId = item.productId.trim();
    const quantity =
      (itemsByProduct.get(productId) ?? 0) + Number(item.quantity);
    if (quantity > MAX_ORDER_QUANTITY) return null;
    itemsByProduct.set(productId, quantity);
  }

  return {
    orderId: value.orderId.trim(),
    items: [...itemsByProduct].map(([productId, quantity]) => ({
      productId,
      quantity,
    })),
    orderDetails: {
      shippingChannel: details.shippingChannel as SubmittedSale["orderDetails"]["shippingChannel"],
      shippingAddress: details.shippingAddress.trim(),
      city: details.city.trim(),
      recipientName: details.recipientName.trim(),
      contactNumber: details.contactNumber.trim(),
      notes: typeof details.notes === "string" ? details.notes.trim() : undefined,
      visualCheckConfirmed: true,
    },
    ...(credentials
      ? {
          paymentCredentials: {
            email: (credentials.email as string).trim().toLowerCase(),
            password: credentials.password as string,
          },
        }
      : {}),
  };
}

async function ensureSimulatedPaymentSchema(): Promise<void> {
  if (!paymentSchemaReady) {
    paymentSchemaReady = (async () => {
      await database.query(`
        CREATE TABLE IF NOT EXISTS simulated_payment_wallets (
          id VARCHAR(64) NOT NULL,
          email VARCHAR(254) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          balance DECIMAL(14, 2) NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY simulated_wallet_email_unique (email)
        ) ENGINE=InnoDB
      `);
      await database.query(`
        CREATE TABLE IF NOT EXISTS simulated_payment_transactions (
          payment_id CHAR(36) NOT NULL,
          order_id VARCHAR(128) NOT NULL,
          user_id CHAR(36) NOT NULL,
          wallet_email VARCHAR(254) NOT NULL,
          amount DECIMAL(14, 2) NOT NULL,
          balance_after DECIMAL(14, 2) NOT NULL,
          status VARCHAR(16) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (payment_id),
          UNIQUE KEY simulated_payment_order_unique (order_id),
          INDEX simulated_payment_user_idx (user_id)
        ) ENGINE=InnoDB
      `);

      const demoWallets = [
        {
          id: "simulated-mp-wallet-demo",
          ...SIMULATED_PAYMENT_DEMO_CREDENTIALS,
        },
        {
          id: "simulated-mp-wallet-no-funds",
          ...SIMULATED_PAYMENT_NO_FUNDS_CREDENTIALS,
        },
      ];
      for (const wallet of demoWallets) {
        await database.execute(
          `INSERT IGNORE INTO simulated_payment_wallets
            (id, email, password_hash, balance)
           VALUES (?, ?, ?, ?)`,
          [
            wallet.id,
            wallet.email,
            await hashPassword(wallet.password),
            wallet.startingBalance,
          ],
        );
      }
    })().catch((error: unknown) => {
      paymentSchemaReady = null;
      throw error;
    });
  }

  return paymentSchemaReady;
}

function readPaymentDetails(orderDetails: string | null): PaymentDetails | null {
  if (!orderDetails) return null;
  try {
    const parsed: unknown = JSON.parse(orderDetails);
    if (!isRecord(parsed) || !isRecord(parsed.payment)) return null;
    const payment = parsed.payment;
    if (
      payment.provider !== "mercadopago_simulado" ||
      typeof payment.paymentId !== "string" ||
      typeof payment.accountEmail !== "string" ||
      typeof payment.subtotal !== "number" ||
      typeof payment.tax !== "number" ||
      typeof payment.amount !== "number" ||
      typeof payment.balanceAfter !== "number" ||
      payment.simulated !== true
    ) {
      return null;
    }
    return {
      provider: "mercadopago_simulado",
      paymentId: payment.paymentId,
      accountEmail: payment.accountEmail,
      subtotal: payment.subtotal,
      tax: payment.tax,
      amount: payment.amount,
      balanceAfter: payment.balanceAfter,
      simulated: true,
    };
  } catch {
    return null;
  }
}

export const simulatedPaymentsRouter = Router();

simulatedPaymentsRouter.post("/simulated/charge", async (request, response) => {
  const userId = request.session.userId;
  if (!userId) {
    response.status(401).json({ error: "Inicia sesión para pagar tu pedido." });
    return;
  }

  const sale = parseSale(request.body);
  if (!sale?.paymentCredentials) {
    response.status(400).json({ error: "Los datos del pago simulado no son válidos." });
    return;
  }

  let connection: PoolConnection | undefined;
  try {
    await ensureOrderSchema();
    await ensureSimulatedPaymentSchema();
    const [activeUsers] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND role = 'user' AND active = TRUE LIMIT 1",
      [userId],
    );
    if (activeUsers.length === 0) {
      response.status(403).json({
        error: "Solo una cuenta de cliente activa puede realizar el pago simulado.",
      });
      return;
    }

    connection = await database.getConnection();
    await connection.beginTransaction();

    const [existingOrders] = await connection.execute<ExistingOrderRow[]>(
      "SELECT user_id AS userId, order_details AS orderDetails FROM sales_orders WHERE order_id = ? LIMIT 1",
      [sale.orderId],
    );
    if (existingOrders.length > 0) {
      const existing = existingOrders[0];
      const payment = readPaymentDetails(existing.orderDetails);
      if (existing.userId !== userId || !payment) {
        await connection.rollback();
        response.status(409).json({ error: "El número de pedido ya está registrado." });
        return;
      }
      await connection.commit();
      response.status(200).json({ recorded: true, duplicate: true, payment });
      return;
    }

    const productIds = [...new Set(sale.items.map((item) => item.productId))];
    const [products] = await connection.query<CatalogProductRow[]>(
      `SELECT id, code, name, category, CAST(price AS DOUBLE) AS price,
              stock_count AS stockCount
       FROM products WHERE active = TRUE AND id IN (?) FOR UPDATE`,
      [productIds],
    );
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productById.size !== productIds.length) {
      await connection.rollback();
      response.status(400).json({
        error: "Uno o más productos del pedido ya no están disponibles.",
      });
      return;
    }

    for (const item of sale.items) {
      const product = productById.get(item.productId);
      if (!product || Number(product.stockCount) < item.quantity) {
        await connection.rollback();
        response.status(409).json({
          error: "La cantidad solicitada supera las unidades disponibles.",
        });
        return;
      }
    }

    const subtotal = sale.items.reduce((amount, item) => {
      const product = productById.get(item.productId);
      return amount + Number(product?.price ?? 0) * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.19);
    const total = subtotal + tax;

    const [wallets] = await connection.execute<WalletRow[]>(
      `SELECT id, email, password_hash AS passwordHash,
              CAST(balance AS DOUBLE) AS balance
       FROM simulated_payment_wallets
       WHERE email = ? AND active = TRUE
       LIMIT 1 FOR UPDATE`,
      [sale.paymentCredentials.email],
    );
    const wallet = wallets[0];
    if (!wallet || !(await verifyPassword(sale.paymentCredentials.password, wallet.passwordHash))) {
      await connection.rollback();
      response.status(422).json({
        error: "La cuenta o contraseña de la billetera simulada no son correctas.",
      });
      return;
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < total) {
      await connection.rollback();
      response.status(402).json({
        error: "Saldo virtual insuficiente. Usa la cuenta demo con saldo disponible.",
      });
      return;
    }

    const paymentId = randomUUID();
    const balanceAfter = currentBalance - total;
    const payment: PaymentDetails = {
      provider: "mercadopago_simulado",
      paymentId,
      accountEmail: wallet.email,
      subtotal,
      tax,
      amount: total,
      balanceAfter,
      simulated: true,
    };

    const [walletUpdate] = await connection.execute<ResultSetHeader>(
      `UPDATE simulated_payment_wallets
       SET balance = ?
       WHERE id = ? AND balance >= ?`,
      [balanceAfter, wallet.id, total],
    );
    if (walletUpdate.affectedRows !== 1) {
      throw new Error("The simulated wallet balance changed during payment.");
    }

    const orderDetails = {
      ...sale.orderDetails,
      subtotal,
      tax,
      shipping: 0,
      payment,
    };
    await connection.execute<ResultSetHeader>(
      `INSERT INTO sales_orders (order_id, user_id, total, status, order_details)
       VALUES (?, ?, ?, 'pendiente', ?)`,
      [sale.orderId, userId, total, JSON.stringify(orderDetails)],
    );
    await connection.execute<ResultSetHeader>(
      `INSERT INTO simulated_payment_transactions
        (payment_id, order_id, user_id, wallet_email, amount, balance_after, status)
       VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
      [paymentId, sale.orderId, userId, wallet.email, total, balanceAfter],
    );

    for (const item of sale.items) {
      const product = productById.get(item.productId);
      if (!product) {
        throw new Error("A catalog product disappeared while recording a simulated payment.");
      }

      const remainingStock = Number(product.stockCount) - item.quantity;
      const [stockUpdate] = await connection.execute<ResultSetHeader>(
        `UPDATE products
         SET stock_count = ?, in_stock = ?
         WHERE id = ? AND active = TRUE AND stock_count >= ?`,
        [remainingStock, remainingStock > 0, product.id, item.quantity],
      );
      if (stockUpdate.affectedRows !== 1) {
        throw new Error("Product stock changed while recording a simulated payment.");
      }
      await connection.execute<ResultSetHeader>(
        `INSERT INTO sales_order_items
          (order_id, product_id, product_code, product_name, category, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sale.orderId,
          product.id,
          product.code,
          product.name,
          product.category,
          item.quantity,
          product.price,
        ],
      );
    }

    await connection.commit();
    response.status(201).json({ recorded: true, duplicate: false, payment });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => undefined);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      try {
        const [duplicates] = await database.execute<ExistingOrderRow[]>(
          "SELECT user_id AS userId, order_details AS orderDetails FROM sales_orders WHERE order_id = ? LIMIT 1",
          [sale.orderId],
        );
        const existing = duplicates[0];
        const payment = readPaymentDetails(existing?.orderDetails ?? null);
        if (existing?.userId === userId && payment) {
          response.status(200).json({ recorded: true, duplicate: true, payment });
        } else {
          response.status(409).json({
            error: "El número de pedido ya está registrado.",
          });
        }
      } catch (lookupError) {
        console.error("Unable to verify duplicate simulated payment:", lookupError);
        response.status(503).json({
          error: "No se pudo confirmar si el pago simulado quedó registrado.",
        });
      }
      return;
    }

    console.error("Unable to process simulated payment:", error);
    response.status(503).json({
      error: "No se pudo procesar el pago simulado. No se debitó saldo virtual.",
    });
  } finally {
    connection?.release();
  }
});
