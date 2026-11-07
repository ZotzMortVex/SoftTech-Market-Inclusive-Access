export const MIN_FONT_SCALE = 100;
export const MAX_FONT_SCALE = 200;
export const FONT_SCALE_STEP = 5;
export const FONT_SCALE_BUTTON_STEP = 25;

export function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) return MIN_FONT_SCALE;
  return Math.min(
    MAX_FONT_SCALE,
    Math.max(MIN_FONT_SCALE, Math.round(value / FONT_SCALE_STEP) * FONT_SCALE_STEP),
  );
}
