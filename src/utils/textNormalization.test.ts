import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSearchText } from "./textNormalization";

test("normalizes month names regardless of case and accents", () => {
  assert.equal(normalizeSearchText("OCTUBRE"), "octubre");
  assert.equal(normalizeSearchText("Octúbre"), "octubre");
  assert.equal(normalizeSearchText("OCT"), "oct");
});

test("preserves numeric month searches", () => {
  assert.equal(normalizeSearchText("10"), "10");
});
