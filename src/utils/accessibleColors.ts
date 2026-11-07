export type ColorTheme = "dark_deep" | "high_contrast" | "light_mode";

type AdaptiveColorTokens = Record<`--adaptive-${string}`, string>;

interface ThemePalette {
  canvas: string;
  surface: string;
  action: string;
  disabledSurface: string;
}

const palettes: Record<ColorTheme, ThemePalette> = {
  dark_deep: {
    canvas: "#0d1527",
    surface: "#0f1a30",
    action: "#38bdf8",
    disabledSurface: "#26364f",
  },
  high_contrast: {
    canvas: "#000000",
    surface: "#000000",
    action: "#ffff00",
    disabledSurface: "#ffff00",
  },
  light_mode: {
    canvas: "#f4f8fa",
    surface: "#ffffff",
    action: "#00536b",
    disabledSurface: "#e2e8f0",
  },
};

function parseHexColor(color: string): [number, number, number] {
  const normalized = color.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => `${channel}${channel}`)
          .join("")
      : normalized;

  if (!/^[\da-f]{6}$/i.test(expanded)) {
    throw new Error(`Unsupported color value: ${color}`);
  }

  return [0, 2, 4].map((offset) =>
    Number.parseInt(expanded.slice(offset, offset + 2), 16),
  ) as [number, number, number];
}

function luminance(color: string): number {
  const channels = parseHexColor(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [
    luminance(foreground),
    luminance(background),
  ].sort((first, second) => second - first);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getBestContrastColor(
  background: string,
  candidates: readonly string[] = ["#000000", "#ffffff"],
): string {
  if (candidates.length === 0) {
    throw new Error("At least one foreground color candidate is required.");
  }

  return candidates.reduce((best, candidate) =>
    getContrastRatio(candidate, background) > getContrastRatio(best, background)
      ? candidate
      : best,
  );
}

export function getAdaptiveColorTokens(theme: ColorTheme): AdaptiveColorTokens {
  const palette = palettes[theme];

  return {
    "--adaptive-canvas": palette.canvas,
    "--adaptive-surface": palette.surface,
    "--adaptive-action": palette.action,
    "--adaptive-on-canvas": getBestContrastColor(palette.canvas),
    "--adaptive-on-surface": getBestContrastColor(palette.surface),
    "--adaptive-on-action": getBestContrastColor(palette.action),
    "--adaptive-disabled-surface": palette.disabledSurface,
    "--adaptive-on-disabled": getBestContrastColor(palette.disabledSurface),
    "--adaptive-focus": getBestContrastColor(palette.canvas),
  };
}
