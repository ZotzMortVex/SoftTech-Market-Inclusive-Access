import assert from "node:assert/strict";
import test from "node:test";
import { parseSale } from "./simulatedPayments";
import { parseSalesPeriodParameters } from "./salesAnalytics";

const validOrder = {
  orderId: " ORDER-1 ",
  items: [
    { productId: " product-1 ", quantity: 2 },
    { productId: "product-1", quantity: 3 },
  ],
  orderDetails: {
    shippingChannel: "email_escrito",
    shippingAddress: "Calle 1",
    city: "Bogotá",
    recipientName: "Cliente",
    contactNumber: "3001234567",
    visualCheckConfirmed: true,
  },
  paymentCredentials: {
    email: "demo@pagos.test",
    password: "DemoPago2026!",
  },
};

test("sale input normalizes IDs and combines repeated product lines", () => {
  assert.deepEqual(parseSale(validOrder)?.items, [
    { productId: "product-1", quantity: 5 },
  ]);
  assert.equal(parseSale(validOrder)?.orderId, "ORDER-1");
});

test("sale input rejects combined quantities above the per-product limit", () => {
  assert.equal(
    parseSale({
      ...validOrder,
      items: [
        { productId: "product-1", quantity: 100 },
        { productId: "product-1", quantity: 1 },
      ],
    }),
    null,
  );
});

test("sale input requires valid simulated wallet credentials", () => {
  const { paymentCredentials: _credentials, ...saleWithoutPayment } = validOrder;
  assert.equal(parseSale(saleWithoutPayment), null);
  assert.equal(
    parseSale({
      ...validOrder,
      paymentCredentials: { email: "demo@pagos.test", password: "" },
    }),
    null,
  );
});

test("sale input can omit wallet credentials for Mercado Pago Checkout Pro", () => {
  const { paymentCredentials: _credentials, ...saleWithoutPayment } = validOrder;
  assert.equal(parseSale(saleWithoutPayment, false)?.orderId, "ORDER-1");
  assert.equal(
    parseSale(
      { ...saleWithoutPayment, paymentCredentials: { email: "invalid" } },
      false,
    ),
    null,
  );
});

test("sales analytics period parameters preserve defaults when omitted", () => {
  assert.deepEqual(parseSalesPeriodParameters(undefined, undefined), {});
});

test("sales analytics period parameters accept a year and month", () => {
  assert.deepEqual(parseSalesPeriodParameters("2025", "02"), {
    year: 2025,
    month: 2,
  });
  assert.deepEqual(parseSalesPeriodParameters(undefined, "12"), {
    month: 12,
  });
});

test("sales analytics period parameters reject invalid years and months", () => {
  for (const [year, month] of [
    ["1999", undefined],
    ["2101", undefined],
    ["2025x", undefined],
    [undefined, "0"],
    [undefined, "13"],
    [undefined, "1.5"],
    [undefined, ["2", "3"]],
  ] as const) {
    assert.equal(parseSalesPeriodParameters(year, month), null);
  }
});
