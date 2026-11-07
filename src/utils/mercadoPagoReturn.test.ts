import assert from "node:assert/strict";
import test from "node:test";
import { parseMercadoPagoReturn } from "./mercadoPagoReturn";

test("treats null Mercado Pago callback values as missing", () => {
  assert.deepEqual(
    parseMercadoPagoReturn(
      "?payment_id=null&collection_id=null&status=null&collection_status=null&external_reference=ORD-123",
    ),
    {
      status: null,
      paymentId: null,
      externalReference: "ORD-123",
    },
  );
});

test("reads a valid payment id and falls back to legacy callback parameters", () => {
  assert.deepEqual(
    parseMercadoPagoReturn(
      "?payment_id=undefined&collection_id=123456&collection_status=approved&external_reference=ORD-123",
    ),
    {
      status: "approved",
      paymentId: "123456",
      externalReference: "ORD-123",
    },
  );
});

test("rejects malformed payment ids and oversized external references", () => {
  assert.deepEqual(
    parseMercadoPagoReturn(
      `?payment_id=invalid&external_reference=${"x".repeat(129)}`,
    ),
    {
      status: null,
      paymentId: null,
      externalReference: null,
    },
  );
});
