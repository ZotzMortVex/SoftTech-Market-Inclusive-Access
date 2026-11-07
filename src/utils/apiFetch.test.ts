import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowErrorPage } from "./apiFetch";

test("does not show an error page for an anonymous session check or invalid login", () => {
  assert.equal(shouldShowErrorPage(401, "/api/auth/me"), false);
  assert.equal(
    shouldShowErrorPage(401, "/api/auth/login", { method: "POST" }),
    false,
  );
});

test("shows shared pages for server and malformed request errors", () => {
  for (const status of [400, 500, 502, 503]) {
    assert.equal(shouldShowErrorPage(status, "/api/products"), true);
  }
});

test("keeps Mercado Pago errors in the checkout instead of replacing the page", () => {
  for (const status of [400, 401, 403, 500, 502, 503]) {
    assert.equal(
      shouldShowErrorPage(status, "/api/payments/mercadopago/preferences", {
        method: "POST",
      }),
      false,
    );
  }
});

test("shows access errors only for protected API routes", () => {
  assert.equal(
    shouldShowErrorPage(401, "/api/orders/mine"),
    true,
  );
  assert.equal(
    shouldShowErrorPage(403, "/api/analytics/sales"),
    true,
  );
  assert.equal(shouldShowErrorPage(403, "/api/products"), false);
  assert.equal(shouldShowErrorPage(404, "/api/products"), false);
});
