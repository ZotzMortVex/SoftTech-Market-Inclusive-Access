import type { SalesAnalytics, SimulatedOrder } from "../types";
import { apiFetch } from "./apiFetch";
import type {
  SimulatedPaymentCredentials,
  SimulatedPaymentReceipt,
} from "./simulatedPayment";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMercadoPagoSandboxUrl(value: string): boolean {
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

function isSalesAnalytics(value: unknown): value is SalesAnalytics {
  if (!isRecord(value)) return false;
  const isCategory = (entry: unknown) =>
    isRecord(entry) &&
    typeof entry.category === "string" &&
    isNumber(entry.totalSales) &&
    isNumber(entry.unitsSold) &&
    isNumber(entry.orders);
  const isProduct = (entry: unknown) =>
    isRecord(entry) &&
    typeof entry.productId === "string" &&
    typeof entry.code === "string" &&
    typeof entry.name === "string" &&
    typeof entry.category === "string" &&
    isNumber(entry.unitsSold) &&
    isNumber(entry.orders) &&
    isNumber(entry.totalSales);
  const isMonthlySales = (entry: unknown) =>
    isRecord(entry) &&
    isNumber(entry.month) &&
    isNumber(entry.totalSales) &&
    isNumber(entry.orders);
  const isAnnualSales = (entry: unknown) =>
    isRecord(entry) &&
    isNumber(entry.year) &&
    isNumber(entry.totalSales) &&
    isNumber(entry.orders);

  return (
    isNumber(value.selectedYear) &&
    (value.selectedMonth === undefined ||
      (isNumber(value.selectedMonth) &&
        value.selectedMonth >= 1 &&
        value.selectedMonth <= 12)) &&
    Array.isArray(value.years) &&
    value.years.every(isNumber) &&
    isNumber(value.totalSales) &&
    isNumber(value.totalOrders) &&
    isNumber(value.averageTicket) &&
    Array.isArray(value.categories) &&
    value.categories.every(isCategory) &&
    Array.isArray(value.topProducts) &&
    value.topProducts.every(isProduct) &&
    Array.isArray(value.topRevenueProducts) &&
    value.topRevenueProducts.every(isProduct) &&
    Array.isArray(value.monthlySales) &&
    value.monthlySales.every(isMonthlySales) &&
    Array.isArray(value.annualSales) &&
    value.annualSales.every(isAnnualSales)
  );
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (isRecord(payload)) {
    if (typeof payload.details === "string") return payload.details;
    if (typeof payload.error === "string") return payload.error;
  }
  return `${fallback} (HTTP ${response.status}).`;
}

export async function fetchSalesAnalytics(
  year?: number,
  month?: number,
  signal?: AbortSignal,
): Promise<SalesAnalytics> {
  const params = new URLSearchParams();
  if (year !== undefined) params.set("year", String(year));
  if (month !== undefined) params.set("month", String(month));
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await apiFetch(`/api/analytics/sales${query}`, { signal });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo cargar el análisis de ventas"),
    );
  }

  const result: unknown = await response.json();
  if (!isSalesAnalytics(result)) {
    throw new Error("La API devolvió un análisis con formato no válido.");
  }

  return result;
}

export async function recordCompletedSale(
  order: SimulatedOrder,
  paymentCredentials: SimulatedPaymentCredentials,
): Promise<SimulatedPaymentReceipt> {
  const response = await apiFetch("/api/payments/simulated/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.orderId,
      items: order.items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
      orderDetails: {
        shippingChannel: order.shippingChannel,
        shippingAddress: order.shippingAddress,
        city: order.city ?? "",
        recipientName: order.recipientName,
        contactNumber: order.contactNumber,
        notes: order.notes,
        visualCheckConfirmed: order.visualCheckConfirmed,
      },
      paymentCredentials,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo registrar el pedido"),
    );
  }

  const result: unknown = await response.json();
  if (
    !isRecord(result) ||
    !isRecord(result.payment) ||
    result.payment.provider !== "mercadopago_simulado" ||
    typeof result.payment.paymentId !== "string" ||
    typeof result.payment.accountEmail !== "string" ||
    typeof result.payment.subtotal !== "number" ||
    typeof result.payment.tax !== "number" ||
    typeof result.payment.amount !== "number" ||
    typeof result.payment.balanceAfter !== "number" ||
    result.payment.simulated !== true
  ) {
    throw new Error("La pasarela simulada devolvió un comprobante no válido.");
  }

  return {
    paymentId: result.payment.paymentId,
    subtotal: result.payment.subtotal,
    tax: result.payment.tax,
    amount: result.payment.amount,
    balanceAfter: result.payment.balanceAfter,
    simulated: true,
  };
}

export async function createMercadoPagoSandboxPreference(
  order: SimulatedOrder,
): Promise<string> {
  const response = await apiFetch("/api/payments/mercadopago/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.orderId,
      items: order.items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
      orderDetails: {
        shippingChannel: order.shippingChannel,
        shippingAddress: order.shippingAddress,
        city: order.city ?? "",
        recipientName: order.recipientName,
        contactNumber: order.contactNumber,
        notes: order.notes,
        visualCheckConfirmed: order.visualCheckConfirmed,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo iniciar el checkout de Mercado Pago"),
    );
  }

  const result: unknown = await response.json();
  if (
    !isRecord(result) ||
    typeof result.sandboxInitPoint !== "string" ||
    !isMercadoPagoSandboxUrl(result.sandboxInitPoint)
  ) {
    throw new Error("Mercado Pago devolvió una URL de checkout no válida.");
  }

  return result.sandboxInitPoint;
}
