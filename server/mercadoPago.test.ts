import assert from "node:assert/strict";
import test from "node:test";
import {
  isMercadoPagoSandboxUrl,
  isSandboxAccessToken,
} from "./mercadoPago";

test("accepts supported Mercado Pago Access Token formats", () => {
  assert.equal(isSandboxAccessToken("TEST-123456"), true);
  assert.equal(isSandboxAccessToken("APP_USR-123456"), true);
  assert.equal(isSandboxAccessToken("INVALID-123456"), false);
});

test("accepts Mercado Pago sandbox URLs with country-specific domains", () => {
  assert.equal(
    isMercadoPagoSandboxUrl(
      "https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=test",
    ),
    true,
  );
  assert.equal(
    isMercadoPagoSandboxUrl("https://sandbox.mercadopago.com/checkout"),
    true,
  );
});

test("rejects non-sandbox Mercado Pago URLs", () => {
  assert.equal(
    isMercadoPagoSandboxUrl("https://sandbox.mercadopago.com.attacker.test/"),
    false,
  );
  assert.equal(
    isMercadoPagoSandboxUrl("http://sandbox.mercadopago.com.co/checkout"),
    false,
  );
});
