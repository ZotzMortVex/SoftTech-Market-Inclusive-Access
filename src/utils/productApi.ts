import { Product } from "../types";
import { apiFetch } from "./apiFetch";
import {
  getProductLscVideoUrl,
  isWelcomeLscVideoUrl,
} from "./lscVideos";

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

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isProductAngle(
  value: unknown,
): value is Product["images"]["angles"][number] {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.url === "string"
  );
}

function isSpec(value: unknown): value is Product["specs"][number] {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.value === "string"
  );
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value) || !isRecord(value.images)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    PRODUCT_CATEGORIES.includes(value.category as Product["category"]) &&
    typeof value.brand === "string" &&
    isNumber(value.price) &&
    isNumber(value.originalPrice) &&
    typeof value.inStock === "boolean" &&
    isNumber(value.stockCount) &&
    typeof value.active === "boolean" &&
    typeof value.visualCert === "string" &&
    isNumber(value.rating) &&
    isNumber(value.reviewsCount) &&
    typeof value.images.primary === "string" &&
    Array.isArray(value.images.angles) &&
    value.images.angles.every(isProductAngle) &&
    typeof value.description === "string" &&
    typeof value.visualAlert === "string" &&
    typeof value.lscVideoUrl === "string" &&
    Array.isArray(value.specs) &&
    value.specs.every(isSpec) &&
    Array.isArray(value.inclusiveFeatures) &&
    value.inclusiveFeatures.every(
      (feature) => typeof feature === "string",
    ) &&
    (value.accountingValue === undefined ||
      isNumber(value.accountingValue))
  );
}

function normalizeApiProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;

  const { lsc_video_url: _lscVideoUrl, ...productData } = value;
  const receivedLscVideoUrl =
    typeof value.lsc_video_url === "string"
      ? value.lsc_video_url
      : typeof value.lscVideoUrl === "string"
        ? value.lscVideoUrl
        : "";
  const lscVideoUrl =
    !receivedLscVideoUrl ||
    isWelcomeLscVideoUrl(receivedLscVideoUrl)
      ? getProductLscVideoUrl(
          typeof value.code === "string" ? value.code : "",
        )
      : receivedLscVideoUrl;
  const normalized = { ...productData, lscVideoUrl };
  return isProduct(normalized) ? normalized : null;
}

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await apiFetch("/api/products", { signal });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (HTTP ${response.status}).`);
  }

  const result: unknown = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("La API devolvió un catálogo con un formato no válido.");
  }

  const products = result.map(normalizeApiProduct);
  if (products.some((product) => product === null)) {
    throw new Error("La API devolvió un catálogo con un formato no válido.");
  }

  return products.filter((product): product is Product => product !== null);
}

async function writeProduct(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<Product> {
  const response = await apiFetch(url, {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(result) && typeof result.error === "string"
        ? result.error
        : `No se pudo guardar el producto (HTTP ${response.status}).`;
    throw new Error(message);
  }

  const product = normalizeApiProduct(result);
  if (!product) {
    throw new Error("La API devolvió un producto con un formato no válido.");
  }

  return product;
}

export function createProduct(product: ProductWriteInput): Promise<Product> {
  return writeProduct("/api/products", "POST", product);
}

export async function uploadProductImage(file: File): Promise<string> {
  const response = await apiFetch("/api/products/images", {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isRecord(result) && typeof result.error === "string"
        ? result.error
        : `No se pudo cargar la imagen (HTTP ${response.status}).`;
    throw new Error(message);
  }

  if (!isRecord(result) || typeof result.url !== "string") {
    throw new Error("El servidor devolvió una ruta de imagen no válida.");
  }

  return result.url;
}

export function updateProduct(product: Product): Promise<Product> {
  return writeProduct(
    `/api/products/${encodeURIComponent(product.id)}`,
    "PUT",
    product,
  );
}

export function setProductActive(
  productId: string,
  active: boolean,
): Promise<Product> {
  const id = encodeURIComponent(productId);
  return active
    ? writeProduct(`/api/products/${id}/status`, "PATCH", { active })
    : writeProduct(`/api/products/${id}`, "DELETE");
}
