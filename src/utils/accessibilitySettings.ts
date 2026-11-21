import type { AccessibilitySettings } from "../types";

export type FlashIntensity = NonNullable<AccessibilitySettings["flashIntensity"]>;

export const FLASH_INTENSITY_OPTIONS: {
  id: FlashIntensity;
  label: string;
}[] = [
  { id: "off", label: "Apagado" },
  { id: "soft", label: "Suave" },
  { id: "standard", label: "Estándar" },
  { id: "intense", label: "Vívido" },
];

export function getFlashIntensitySettings(
  intensity: FlashIntensity,
): Pick<AccessibilitySettings, "flashIntensity" | "opticalFlashes"> {
  return {
    flashIntensity: intensity,
    opticalFlashes: intensity !== "off",
  };
}
