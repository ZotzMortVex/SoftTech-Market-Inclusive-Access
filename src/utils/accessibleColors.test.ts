import test from "node:test";
import assert from "node:assert/strict";

import {
  getAdaptiveColorTokens,
  getBestContrastColor,
  getContrastRatio,
} from "./accessibleColors";

test("contrast ratio follows the WCAG relative luminance formula", () => {
  assert.equal(getContrastRatio("#000000", "#ffffff"), 21);
  assert.equal(getContrastRatio("#000", "#fff"), 21);
  assert.ok(Math.abs(getContrastRatio("#777777", "#ffffff") - 4.478) < 0.001);
});

test("foreground selection maximizes contrast against its background", () => {
  assert.equal(getBestContrastColor("#ffffff"), "#000000");
  assert.equal(getBestContrastColor("#0d1527"), "#ffffff");
  assert.equal(
    getBestContrastColor("#38bdf8"),
    getContrastRatio("#000000", "#38bdf8") >
      getContrastRatio("#ffffff", "#38bdf8")
      ? "#000000"
      : "#ffffff",
  );
});

test("semantic theme text and control colors meet WCAG AAA for normal text", () => {
  for (const theme of ["dark_deep", "high_contrast", "light_mode"] as const) {
    const tokens = getAdaptiveColorTokens(theme);

    for (const [foreground, background] of [
      ["--adaptive-on-canvas", "--adaptive-canvas"],
      ["--adaptive-on-surface", "--adaptive-surface"],
      ["--adaptive-on-action", "--adaptive-action"],
      ["--adaptive-on-disabled", "--adaptive-disabled-surface"],
    ] as const) {
      assert.ok(
        getContrastRatio(tokens[foreground], tokens[background]) >= 7,
        `${theme}: ${foreground} does not meet 7:1 against ${background}`,
      );
    }
  }
});

test("simulated payment receipt colors meet WCAG AAA in every theme", () => {
  assert.ok(getContrastRatio("#f8fafc", "#00261f") >= 7);
  assert.ok(getContrastRatio("#ffff00", "#000000") >= 7);
});

test("invalid colors and empty foreground candidates are rejected", () => {
  assert.throws(() => getContrastRatio("red", "#ffffff"), /Unsupported color/);
  assert.throws(() => getBestContrastColor("#ffffff", []), /At least one/);
});
