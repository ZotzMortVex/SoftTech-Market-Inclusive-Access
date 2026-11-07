import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmMercadoPagoSandboxPayment,
  fetchMyOrders,
  updateOrderStatus,
} from "./ordersApi";

test("confirms a Mercado Pago sandbox payment through the backend", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody: Record<string, unknown> = {};
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        order: {
          orderId: "ORD-SANDBOX-123",
          userId: "user-123",
          userEmail: "cliente@example.com",
          recipientName: "Cliente",
          date: "09/10/2026",
          status: "pendiente",
          subtotal: 100000,
          tax: 19000,
          shipping: 0,
          total: 119000,
          shippingChannel: "email_escrito",
          shippingAddress: "Calle 1",
          city: "Bogotá",
          contactNumber: "3001234567",
          visualCheckConfirmed: true,
          payment: {
            provider: "mercadopago_sandbox",
            paymentId: "123456789",
            accountEmail: "buyer-test@example.com",
            amount: 119000,
            simulated: true,
          },
          items: [
            {
              productId: "product-1",
              code: "P-01",
              name: "Producto",
              category: "Laptops",
              quantity: 1,
              price: 100000,
              imageUrl: null,
            },
          ],
        },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const order = await confirmMercadoPagoSandboxPayment(
      "123456789",
      "ORD-SANDBOX-123",
    );
    assert.equal(requestUrl, "/api/payments/mercadopago/confirm");
    assert.deepEqual(requestBody, {
      paymentId: "123456789",
      externalReference: "ORD-SANDBOX-123",
    });
    assert.equal(order.payment?.provider, "mercadopago_sandbox");
    assert.equal(order.total, 119000);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("maps the user's order number, items, and current delivery status", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify([
        {
          orderId: "ORD-123",
          userId: "user-123",
          userEmail: "cliente@example.com",
          recipientName: "Cliente",
          date: "09/10/2026 15:00",
          status: "preparacion",
          subtotal: 100000,
          tax: 19000,
          shipping: 0,
          total: 119000,
          shippingChannel: "email_escrito",
          shippingAddress: "Calle 1",
          city: "Bogotá",
          contactNumber: "3001234567",
          visualCheckConfirmed: true,
          payment: {
            provider: "mercadopago_simulado",
            paymentId: "payment-123",
            accountEmail: "demo@pagos.test",
            amount: 119000,
            balanceAfter: 4881000,
            simulated: true,
          },
          items: [
            {
              productId: "product-1",
              code: "P-01",
              name: "Producto",
              category: "Laptops",
              quantity: 1,
              price: 100000,
              imageUrl: "https://example.com/product.png",
            },
          ],
        },
      ]),
      { headers: { "Content-Type": "application/json" } },
    );

  try {
    const [order] = await fetchMyOrders();
    assert.equal(order.orderId, "ORD-123");
    assert.equal(order.status, "preparacion");
    assert.equal(order.total, 119000);
    assert.equal(order.items[0].product.name, "Producto");
    assert.equal(order.items[0].product.images.primary, "https://example.com/product.png");
    assert.equal(order.trackingHistory[1].active, true);
    assert.equal(order.payment?.paymentId, "payment-123");
    assert.equal(order.payment?.balanceAfter, 4881000);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("persists an administrator's order status change through the API", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody = "";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = String(init?.body);
    return new Response(JSON.stringify({ orderId: "ORD-123", status: "enviado" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await updateOrderStatus("ORD-123", "despachado");
    assert.equal(requestUrl, "/api/orders/ORD-123/status");
    assert.deepEqual(JSON.parse(requestBody), { status: "enviado" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
