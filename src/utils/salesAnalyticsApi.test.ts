import assert from "node:assert/strict";
import test from "node:test";
import type { SimulatedOrder } from "../types";
import {
  createMercadoPagoSandboxPreference,
  recordCompletedSale,
} from "./salesAnalyticsApi";

const order: SimulatedOrder = {
  orderId: "ORD-SIM-123",
  userId: "customer-1",
  userEmail: "cliente@example.com",
  date: "01/11/2026",
  items: [
    {
      quantity: 1,
      product: {
        id: "product-1",
        code: "CUD001",
        name: "Producto de prueba",
        category: "Laptops",
        brand: "SoftTech",
        price: 100_000,
        originalPrice: 120_000,
        inStock: true,
        stockCount: 2,
        active: true,
        visualCert: "",
        rating: 5,
        reviewsCount: 0,
        images: { primary: "", angles: [] },
        description: "",
        visualAlert: "",
        specs: [],
        inclusiveFeatures: [],
      },
    },
  ],
  subtotal: 100_000,
  tax: 19_000,
  shipping: 0,
  total: 119_000,
  status: "pendiente",
  shippingChannel: "email_escrito",
  shippingAddress: "Calle 1",
  city: "Bogotá",
  recipientName: "Cliente",
  contactNumber: "3001234567",
  visualCheckConfirmed: true,
  trackingHistory: [],
};

test("records an order through the simulated payment endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody: Record<string, unknown> = {};
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        recorded: true,
        duplicate: false,
        payment: {
          provider: "mercadopago_simulado",
          paymentId: "payment-123",
          accountEmail: "demo@pagos.test",
          subtotal: 100_000,
          tax: 19_000,
          amount: 119_000,
          balanceAfter: 4_881_000,
          simulated: true,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const receipt = await recordCompletedSale(order, {
      email: "demo@pagos.test",
      password: "DemoPago2026!",
    });
    assert.equal(requestUrl, "/api/payments/simulated/charge");
    assert.deepEqual(requestBody.paymentCredentials, {
      email: "demo@pagos.test",
      password: "DemoPago2026!",
    });
    assert.equal(receipt.paymentId, "payment-123");
    assert.equal(receipt.subtotal, 100_000);
    assert.equal(receipt.balanceAfter, 4_881_000);
    assert.equal(receipt.simulated, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("surfaces simulated payment rejections to checkout", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        status: 402,
        error: "Payment Required",
        message: "La operación requiere un saldo válido.",
        code: "ERR_402",
        details: "Saldo virtual insuficiente.",
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );

  try {
    await assert.rejects(
      recordCompletedSale(order, {
        email: "sin-saldo@pagos.test",
        password: "SinSaldo2026!",
      }),
      /Saldo virtual insuficiente/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("creates a Mercado Pago sandbox preference without sending payment credentials", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody: Record<string, unknown> = {};
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        orderId: order.orderId,
        sandboxInitPoint: "https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=test",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const checkoutUrl = await createMercadoPagoSandboxPreference(order);
    assert.equal(requestUrl, "/api/payments/mercadopago/preferences");
    assert.deepEqual(requestBody.items, [
      { productId: "product-1", quantity: 1 },
    ]);
    assert.equal("paymentCredentials" in requestBody, false);
    assert.equal(
      checkoutUrl,
      "https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=test",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects Mercado Pago checkout URLs outside the sandbox domain", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        sandboxInitPoint: "https://sandbox.mercadopago.com.attacker.example/checkout",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );

  try {
    await assert.rejects(
      createMercadoPagoSandboxPreference(order),
      /URL de checkout no válida/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
