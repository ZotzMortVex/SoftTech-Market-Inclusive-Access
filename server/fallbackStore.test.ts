import assert from "node:assert/strict";
import test from "node:test";
import {
  ensureDefaultAdmin,
  findFallbackUserByEmail,
} from "./fallbackStore";

test("does not create a fallback administrator without explicit credentials", async () => {
  const previousEmail = process.env.FALLBACK_ADMIN_EMAIL;
  const previousPassword = process.env.FALLBACK_ADMIN_PASSWORD;
  delete process.env.FALLBACK_ADMIN_EMAIL;
  delete process.env.FALLBACK_ADMIN_PASSWORD;

  try {
    await ensureDefaultAdmin();
    assert.equal(findFallbackUserByEmail("admin@softtech.test") !== null, false);
  } finally {
    if (previousEmail === undefined) delete process.env.FALLBACK_ADMIN_EMAIL;
    else process.env.FALLBACK_ADMIN_EMAIL = previousEmail;
    if (previousPassword === undefined) delete process.env.FALLBACK_ADMIN_PASSWORD;
    else process.env.FALLBACK_ADMIN_PASSWORD = previousPassword;
  }
});
