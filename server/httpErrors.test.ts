import assert from "node:assert/strict";
import test from "node:test";
import {
  createStandardHttpError,
  ERROR_APOLOGY,
} from "./httpErrors";

test("creates the shared HTTP error response shape", () => {
  assert.deepEqual(createStandardHttpError(404), {
    status: 404,
    error: "Not Found",
    message: ERROR_APOLOGY,
    code: "ERR_404",
  });
});

test("preserves a route-specific technical detail separately", () => {
  assert.deepEqual(createStandardHttpError(400, "El correo no es válido."), {
    status: 400,
    error: "Bad Request",
    message: ERROR_APOLOGY,
    code: "ERR_400",
    details: "El correo no es válido.",
  });
});
