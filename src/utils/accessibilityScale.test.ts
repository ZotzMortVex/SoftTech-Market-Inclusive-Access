import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
  clampFontScale,
} from "./accessibilityScale";

test("font scale remains within the supported 100%-200% range", () => {
  assert.equal(clampFontScale(0), MIN_FONT_SCALE);
  assert.equal(clampFontScale(250), MAX_FONT_SCALE);
});

test("font scale rounds to the nearest five-percent step", () => {
  assert.equal(clampFontScale(127), 125);
  assert.equal(clampFontScale(128), 130);
});

test("non-finite font scale returns the accessible default", () => {
  assert.equal(clampFontScale(Number.NaN), MIN_FONT_SCALE);
});
