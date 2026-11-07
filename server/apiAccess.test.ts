import assert from "node:assert/strict";
import test from "node:test";
import { isPublicApiRoute } from "./apiAccess";

test("allows only the intended public API routes", () => {
  const publicRoutes: Array<[string, string]> = [
    ["GET", "/api/health"],
    ["GET", "/api/products"],
    ["GET", "/api/products/product-123"],
    ["GET", "/api/products/images/product-image.png"],
    ["POST", "/api/auth/login"],
    ["POST", "/api/auth/register"],
    ["POST", "/api/auth/password-reset/request"],
    ["POST", "/api/auth/password-reset/confirm"],
    ["POST", "/api/auth/logout"],
  ];

  for (const [method, pathname] of publicRoutes) {
    assert.equal(isPublicApiRoute(method, pathname), true, `${method} ${pathname}`);
  }
});

test("requires authentication for private, administrative, and unknown API routes", () => {
  const protectedRoutes: Array<[string, string]> = [
    ["GET", "/api/auth/me"],
    ["GET", "/api/auth/users"],
    ["PATCH", "/api/auth/users/user-1/status"],
    ["DELETE", "/api/auth/users/user-1"],
    ["POST", "/api/auth/activity"],
    ["POST", "/api/products"],
    ["PUT", "/api/products/product-1"],
    ["DELETE", "/api/products/product-1"],
    ["POST", "/api/products/images"],
    ["GET", "/api/orders/mine"],
    ["GET", "/api/orders"],
    ["PATCH", "/api/orders/order-1/status"],
    ["POST", "/api/payments/simulated/charge"],
    ["GET", "/api/analytics/sales"],
    ["GET", "/api/unknown"],
    ["GET", "/api/products/images"],
  ];

  for (const [method, pathname] of protectedRoutes) {
    assert.equal(
      isPublicApiRoute(method, pathname),
      false,
      `${method} ${pathname}`,
    );
  }
});
