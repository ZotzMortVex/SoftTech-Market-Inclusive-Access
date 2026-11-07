import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password";

test("password hashes do not contain the original password and verify correctly", async () => {
  const password = "a secure test password";
  const storedHash = await hashPassword(password);

  assert.match(storedHash, /^scrypt\$16384\$8\$1\$/);
  assert.equal(storedHash.includes(password), false);
  assert.equal(await verifyPassword(password, storedHash), true);
  assert.equal(await verifyPassword("a different password", storedHash), false);
});

test("password verification rejects malformed or unsupported hashes", async () => {
  assert.equal(await verifyPassword("password", "not-a-scrypt-hash"), false);
  assert.equal(
    await verifyPassword("password", "scrypt$1$1$1$00$00"),
    false,
  );
});
