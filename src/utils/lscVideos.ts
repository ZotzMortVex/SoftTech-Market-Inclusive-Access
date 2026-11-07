export const DEFAULT_LSC_VIDEO_URL = "/assets/videos/welcome.mp4";
export const PROTOTYPE_KEYBOARD_LSC_VIDEO_URL =
  "/assets/videos/prototipo_teclado.mp4";
export const ULTRABOOK_PRO_16_LSC_VIDEO_URL =
  "/assets/videos/ultrabook_pro_16.mp4";
export const MECHANICAL_KEYBOARD_LSC_VIDEO_URL =
  "/assets/videos/teclado_mecanico.mp4";
export const GRAPHICS_TABLET_LSC_VIDEO_URL = "/assets/videos/tablet.mp4";
export const CURVED_MONITOR_LSC_VIDEO_URL = "/assets/videos/monitor.mp4";
export const THUNDERBOLT_HUB_LSC_VIDEO_URL = "/assets/videos/hub.mp4";
export const ERGONOMIC_MOUSE_LSC_VIDEO_URL = "/assets/videos/raton.mp4";
export const BEACON_LSC_VIDEO_URL = "/videos/baliza.mp4";
export const BONE_CONDUCTION_HEADPHONES_LSC_VIDEO_URL =
  "/assets/videos/auriculares.mp4";

export function isWelcomeLscVideoUrl(url: string): boolean {
  const pathname = url.split(/[?#]/, 1)[0].toLowerCase();
  return (
    pathname === DEFAULT_LSC_VIDEO_URL.toLowerCase() ||
    pathname === "welcome.mp4" ||
    pathname.endsWith("/welcome.mp4")
  );
}

export function getProductLscVideoUrl(productCode: string): string {
  if (productCode === "CUD008") return ULTRABOOK_PRO_16_LSC_VIDEO_URL;
  if (productCode === "CUD010") return MECHANICAL_KEYBOARD_LSC_VIDEO_URL;
  if (productCode === "CUD012") return GRAPHICS_TABLET_LSC_VIDEO_URL;
  if (productCode === "CUD009") return CURVED_MONITOR_LSC_VIDEO_URL;
  if (productCode === "CUD013") return THUNDERBOLT_HUB_LSC_VIDEO_URL;
  if (productCode === "CUD014") return ERGONOMIC_MOUSE_LSC_VIDEO_URL;
  if (productCode === "CUD015") return BEACON_LSC_VIDEO_URL;
  if (productCode === "CUD011")
    return BONE_CONDUCTION_HEADPHONES_LSC_VIDEO_URL;
  if (productCode === "CUD016") return PROTOTYPE_KEYBOARD_LSC_VIDEO_URL;
  return `/assets/videos/lsc/${encodeURIComponent(productCode)}.mp4`;
}
