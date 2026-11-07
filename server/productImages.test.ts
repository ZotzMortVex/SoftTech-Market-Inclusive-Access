import assert from "node:assert/strict";
import test from "node:test";
import { getProductImageExtension } from "./productImages";

test("accepts supported image headers and returns safe extensions", () => {
  assert.equal(
    getProductImageExtension(
      Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      "image/jpeg",
    ),
    "jpg",
  );
  assert.equal(
    getProductImageExtension(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    "png",
  );
  assert.equal(
    getProductImageExtension(
      Buffer.from("RIFF0000WEBP"),
      "image/webp",
    ),
    "webp",
  );
  assert.equal(
    getProductImageExtension(Buffer.from("GIF89a"), "image/gif"),
    "gif",
  );
});

test("rejects mismatched, unsupported, or incomplete image data", () => {
  assert.equal(
    getProductImageExtension(Buffer.from("not an image"), "image/png"),
    null,
  );
  assert.equal(
    getProductImageExtension(Buffer.from([0xff, 0xd8, 0xff]), "image/png"),
    null,
  );
  assert.equal(
    getProductImageExtension(Buffer.from("image"), "image/svg+xml"),
    null,
  );
});
