import assert from "node:assert/strict";
import test from "node:test";
import {
  FLASH_INTENSITY_OPTIONS,
  getFlashIntensitySettings,
} from "./accessibilitySettings";

test("provides an accessible off option that disables optical flashes", () => {
  assert.ok(FLASH_INTENSITY_OPTIONS.some((option) => option.id === "off"));
  assert.deepEqual(getFlashIntensitySettings("off"), {
    flashIntensity: "off",
    opticalFlashes: false,
  });
});

test("enables optical flashes for each visible intensity", () => {
  for (const intensity of ["soft", "standard", "intense"] as const) {
    assert.deepEqual(getFlashIntensitySettings(intensity), {
      flashIntensity: intensity,
      opticalFlashes: true,
    });
  }
});
