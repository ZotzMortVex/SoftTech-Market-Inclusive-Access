import type { CartItem, SimulatedOrder } from "../types";
import { apiFetch } from "./apiFetch";

type ProductCategory = CartItem["product"]["category"];

const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "Laptops",
  "Monitores",
  "Periféricos",
  "Audio Visual",
  "Accesorios",
];

interface ApiOrderItem {
  productId: string;
  code: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  price: number;
  imageUrl: string | null;
}

interface ApiOrder {
  orderId: string;
  userId: string | null;
  userEmail?: string;
  recipientName: string;
  date: string;
  status: SimulatedOrder["status"];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingChannel: SimulatedOrder["shippingChannel"];
  shippingAddress: string;
  city: string;
  contactNumber: string;
  notes?: string;
  visualCheckConfirmed: boolean;
  payment?: {
    provider: "mercadopago_simulado" | "mercadopago_sandbox";
    paymentId: string;
    accountEmail: string;
    amount: number;
    balanceAfter?: number;
    simulated: true;
  };
  items: ApiOrderItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    typeof value === "string" &&
    PRODUCT_CATEGORIES.some((category) => category === value)
  );
}

function isApiOrder(value: unknown): value is ApiOrder {
  const isPayment = !isRecord(value)
    ? false
    : value.payment === undefined ||
      (isRecord(value.payment) &&
        (value.payment.provider === "mercadopago_simulado" ||
          value.payment.provider === "mercadopago_sandbox") &&
        typeof value.payment.paymentId === "string" &&
        typeof value.payment.accountEmail === "string" &&
        isNumber(value.payment.amount) &&
        (value.payment.balanceAfter === undefined ||
          isNumber(value.payment.balanceAfter)) &&
        value.payment.simulated === true);

  return (
    isRecord(value) &&
    isPayment &&
    typeof value.orderId === "string" &&
    (typeof value.userId === "string" || value.userId === null) &&
    typeof value.recipientName === "string" &&
    typeof value.date === "string" &&
    typeof value.status === "string" &&
    ["pendiente", "preparacion", "enviado", "entregado"].includes(value.status) &&
    isNumber(value.subtotal) &&
    isNumber(value.tax) &&
    isNumber(value.shipping) &&
    isNumber(value.total) &&
    typeof value.shippingChannel === "string" &&
    ["sms_visual", "email_escrito", "dashboard"].includes(value.shippingChannel) &&
    typeof value.shippingAddress === "string" &&
    typeof value.city === "string" &&
    typeof value.contactNumber === "string" &&
    typeof value.visualCheckConfirmed === "boolean" &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.productId === "string" &&
        typeof item.code === "string" &&
        typeof item.name === "string" &&
        isProductCategory(item.category) &&
        isNumber(item.quantity) &&
        isNumber(item.price) &&
        (typeof item.imageUrl === "string" || item.imageUrl === null),
    )
  );
}

async function readApiError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  return isRecord(body) && typeof body.error === "string"
    ? body.error
    : `No se pudieron cargar los pedidos (HTTP ${response.status}).`;
}

function mapApiOrder(order: ApiOrder): SimulatedOrder {
  const items: CartItem[] = order.items.map((item) => ({
    quantity: item.quantity,
    product: {
      id: item.productId,
      code: item.code,
      name: item.name,
      category: item.category,
      brand: "",
      price: item.price,
      originalPrice: item.price,
      inStock: true,
      stockCount: 0,
      active: true,
      visualCert: "",
      rating: 0,
      reviewsCount: 0,
      images: { primary: item.imageUrl ?? "", angles: [] },
      description: "",
      visualAlert: "",
      specs: [],
      inclusiveFeatures: [],
    },
  }));
  const steps = [
    {
      step: "Pedido registrado",
      desc: "El pedido fue recibido y está pendiente de validación.",
    },
    {
      step: "En preparación",
      desc: "Los productos están siendo verificados y empacados.",
    },
    {
      step: "Enviado",
      desc: "El pedido fue entregado al operador logístico.",
    },
    {
      step: "Entregado",
      desc: "El pedido fue entregado al destinatario.",
    },
  ];
  const statusIndex: Record<SimulatedOrder["status"], number> = {
    pendiente: 0,
    confirmado: 0,
    preparacion: 1,
    despachado: 2,
    enviado: 2,
    en_camino: 2,
    entregado: 3,
  };
  const currentStep = statusIndex[order.status];
  const trackingHistory = steps.map((step, index) => ({
    ...step,
    date: index <= currentStep ? order.date : "Pendiente",
    done: index < currentStep,
    active: index === currentStep,
  }));

  return {
    orderId: order.orderId,
    userId: order.userId ?? undefined,
    userEmail: order.userEmail,
    date: order.date,
    items,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    shippingChannel: order.shippingChannel,
    shippingAddress: order.shippingAddress,
    city: order.city,
    recipientName: order.recipientName,
    contactNumber: order.contactNumber,
    notes: order.notes,
    visualCheckConfirmed: order.visualCheckConfirmed,
    payment: order.payment,
    trackingHistory,
  };
}

export async function fetchMyOrders(): Promise<SimulatedOrder[]> {
  const response = await apiFetch("/api/orders/mine");
  if (!response.ok) throw new Error(await readApiError(response));
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(isApiOrder)) {
    throw new Error("El servidor devolvió una lista de pedidos no válida.");
  }
  return body.map(mapApiOrder);
}

export async function confirmMercadoPagoSandboxPayment(
  paymentId: string,
  externalReference: string,
): Promise<SimulatedOrder> {
  const response = await apiFetch("/api/payments/mercadopago/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, externalReference }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const result: unknown = await response.json();
  if (!isRecord(result) || !isApiOrder(result.order)) {
    throw new Error("Mercado Pago devolvió una confirmación de pago no válida.");
  }
  if (result.order.payment?.provider !== "mercadopago_sandbox") {
    throw new Error("El pedido no contiene un comprobante sandbox verificable.");
  }
  return mapApiOrder(result.order);
}

export async function fetchAllOrders(): Promise<SimulatedOrder[]> {
  const response = await apiFetch("/api/orders");
  if (!response.ok) throw new Error(await readApiError(response));
  const body: unknown = await response.json();
  if (!Array.isArray(body) || !body.every(isApiOrder)) {
    throw new Error("El servidor devolvió una lista de pedidos no válida.");
  }
  return body.map(mapApiOrder);
}

export async function updateOrderStatus(
  orderId: string,
  status: SimulatedOrder["status"],
): Promise<void> {
  const normalizedStatus =
    status === "confirmado"
      ? "pendiente"
      : status === "despachado" || status === "en_camino"
        ? "enviado"
        : status;
  const response = await apiFetch(
    `/api/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: normalizedStatus }),
    },
  );
  if (!response.ok) throw new Error(await readApiError(response));
}
