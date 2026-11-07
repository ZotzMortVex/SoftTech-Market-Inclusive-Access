import type { Product } from "../src/types";
import {
  getProductLscVideoUrl,
  isWelcomeLscVideoUrl,
} from "../src/utils/lscVideos";

export type ProductWriteInput = Omit<Product, "id">;

const PRODUCT_CATEGORIES: Product["category"][] = [
  "Laptops",
  "Monitores",
  "Periféricos",
  "Audio Visual",
  "Accesorios",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isNumberBetween(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isTextPair(
  value: unknown,
): value is { label: string; value: string } {
  return (
    isRecord(value) &&
    isText(value.label, 200) &&
    value.label.trim().length > 0 &&
    isText(value.value, 1000)
  );
}

function isProductAngle(
  value: unknown,
): value is Product["images"]["angles"][number] {
  return (
    isRecord(value) &&
    isText(value.id, 100) &&
    isText(value.label, 100) &&
    isText(value.url, 2048)
  );
}

export function parseProductInput(
  value: unknown,
): ProductWriteInput | null {
  if (!isRecord(value) || !isRecord(value.images)) {
    return null;
  }

  const {
    code,
    name,
    category,
    brand,
    price,
    originalPrice,
    stockCount,
    active,
    visualCert,
    rating,
    reviewsCount,
    description,
    visualAlert,
    accountingValue,
  } = value;
  const { primary, angles } = value.images;
  const { specs, inclusiveFeatures } = value;
  const normalizedCode =
    typeof code === "string" ? code.trim().toUpperCase() : "";
  const rawLscVideoUrl = value.lscVideoUrl ?? value.lsc_video_url;
  const assignedLscVideoUrl = getProductLscVideoUrl(normalizedCode);
  const lscVideoUrl =
    rawLscVideoUrl === undefined ||
    rawLscVideoUrl === null ||
    (typeof rawLscVideoUrl === "string" &&
      isWelcomeLscVideoUrl(rawLscVideoUrl))
      ? assignedLscVideoUrl
      : rawLscVideoUrl;

  if (
    !isText(code, 64) ||
    normalizedCode.length === 0 ||
    normalizedCode.length > 64 ||
    !isText(name, 200) ||
    name.trim().length === 0 ||
    typeof category !== "string" ||
    !PRODUCT_CATEGORIES.includes(category as Product["category"]) ||
    !isText(brand, 120) ||
    brand.trim().length === 0 ||
    !isNumberBetween(price, 0.01, 9_999_999_999.99) ||
    !isNumberBetween(originalPrice, 0.01, 9_999_999_999.99) ||
    !Number.isSafeInteger(stockCount) ||
    !isNumberBetween(stockCount, 0, 4_294_967_295) ||
    typeof active !== "boolean" ||
    !isText(visualCert, 5000) ||
    !isNumberBetween(rating, 0, 5) ||
    !Number.isSafeInteger(reviewsCount) ||
    !isNumberBetween(reviewsCount, 0, 4_294_967_295) ||
    !isText(primary, 2048) ||
    !Array.isArray(angles) ||
    angles.length > 20 ||
    !angles.every(isProductAngle) ||
    !isText(description, 5000) ||
    description.trim().length === 0 ||
    !isText(visualAlert, 1000) ||
    !isText(lscVideoUrl, 2048) ||
    lscVideoUrl.trim().length === 0 ||
    (!(
      lscVideoUrl.startsWith("/") &&
      !lscVideoUrl.startsWith("//") &&
      !lscVideoUrl.includes("\\")
    ) &&
      !/^https:\/\/[^/]+/i.test(lscVideoUrl)) ||
    !Array.isArray(specs) ||
    specs.length > 100 ||
    !specs.every(isTextPair) ||
    !Array.isArray(inclusiveFeatures) ||
    inclusiveFeatures.length > 50 ||
    !inclusiveFeatures.every((feature) => isText(feature, 500)) ||
    (accountingValue !== undefined &&
      !isNumberBetween(accountingValue, 0, 9_999_999_999.99))
  ) {
    return null;
  }

  return {
    code: normalizedCode,
    name: name.trim(),
    category: category as Product["category"],
    brand: brand.trim(),
    price,
    originalPrice,
    inStock: stockCount > 0,
    stockCount,
    active,
    visualCert,
    rating,
    reviewsCount,
    images: {
      primary,
      angles,
    },
    description: description.trim(),
    visualAlert,
    lscVideoUrl: lscVideoUrl.trim(),
    specs,
    inclusiveFeatures,
    ...(typeof accountingValue === "number" ? { accountingValue } : {}),
  };
}
