const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const PRODUCT_IMAGE_MIME_TYPES = Object.keys(IMAGE_EXTENSIONS);

export function getProductImageExtension(
  buffer: Buffer,
  mimeType: string,
): string | null {
  let isValidImage = false;

  switch (mimeType) {
    case "image/jpeg":
      isValidImage =
        buffer.length >= 3 &&
        buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
      break;
    case "image/png":
      isValidImage =
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      break;
    case "image/webp":
      isValidImage =
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";
      break;
    case "image/gif":
      isValidImage =
        buffer.length >= 6 &&
        ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
      break;
  }

  return isValidImage ? IMAGE_EXTENSIONS[mimeType] : null;
}
