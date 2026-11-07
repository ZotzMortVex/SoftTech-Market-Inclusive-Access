import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import express, { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Product } from "../src/types";
import { requireAdmin } from "./auth";
import { database } from "./db";
import {
  createFallbackProduct,
  deleteFallbackProduct,
  findFallbackProduct,
  listFallbackProducts,
  setFallbackProductStatus,
  updateFallbackProduct,
} from "./fallbackStore";
import {
  parseProductInput,
  type ProductWriteInput,
} from "./productValidation";
import {
  ensureProductLscVideoColumn,
} from "./productSchema";
import {
  getProductLscVideoUrl,
  isWelcomeLscVideoUrl,
} from "../src/utils/lscVideos";
import {
  getProductImageExtension,
  PRODUCT_IMAGE_MIME_TYPES,
} from "./productImages";

interface ProductRow extends RowDataPacket {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  inStock: number | boolean;
  stockCount: number;
  active: number | boolean;
  visualCert: string;
  rating: number;
  reviewsCount: number;
  primaryImageUrl: string;
  imageAngles: Product["images"]["angles"] | string;
  description: string;
  visualAlert: string;
  lscVideoUrl: string | null;
  specs: Product["specs"] | string;
  inclusiveFeatures: Product["inclusiveFeatures"] | string;
  accountingValue: number | null;
}

const PRODUCT_CATEGORIES: Product["category"][] = [
  "Laptops",
  "Monitores",
  "Periféricos",
  "Audio Visual",
  "Accesorios",
];

const PRODUCT_COLUMNS = `
  id,
  code,
  name,
  category,
  brand,
  CAST(price AS DOUBLE) AS price,
  CAST(original_price AS DOUBLE) AS originalPrice,
  in_stock AS inStock,
  stock_count AS stockCount,
  active,
  visual_cert AS visualCert,
  CAST(rating AS DOUBLE) AS rating,
  reviews_count AS reviewsCount,
  primary_image_url AS primaryImageUrl,
  image_angles AS imageAngles,
  description,
  visual_alert AS visualAlert,
  specs,
  inclusive_features AS inclusiveFeatures,
  lsc_video_url AS lscVideoUrl,
  CAST(accounting_value AS DOUBLE) AS accountingValue
`;

function parseJsonColumn<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function mapProduct(row: ProductRow): Product {
  if (!PRODUCT_CATEGORIES.includes(row.category as Product["category"])) {
    throw new Error(`Unsupported product category: ${row.category}`);
  }

  const product: Product = {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category as Product["category"],
    brand: row.brand,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice),
    inStock: row.inStock === true || Number(row.inStock) === 1,
    stockCount: Number(row.stockCount),
    active: row.active === true || Number(row.active) === 1,
    visualCert: row.visualCert,
    rating: Number(row.rating),
    reviewsCount: Number(row.reviewsCount),
    images: {
      primary: row.primaryImageUrl,
      angles: parseJsonColumn(row.imageAngles),
    },
    description: row.description,
    visualAlert: row.visualAlert,
    lscVideoUrl:
      !row.lscVideoUrl?.trim() ||
      isWelcomeLscVideoUrl(row.lscVideoUrl.trim())
        ? getProductLscVideoUrl(row.code)
        : row.lscVideoUrl.trim(),
    specs: parseJsonColumn(row.specs),
    inclusiveFeatures: parseJsonColumn(row.inclusiveFeatures),
  };

  if (row.accountingValue !== null) {
    product.accountingValue = Number(row.accountingValue);
  }

  return product;
}

function serializeProduct(product: Product) {
  const { lscVideoUrl, ...publicProduct } = product;
  return {
    ...publicProduct,
    lsc_video_url: lscVideoUrl || getProductLscVideoUrl(publicProduct.code),
  };
}

type ProductSqlValue = string | number | boolean | null;

function productValues(product: ProductWriteInput): ProductSqlValue[] {
  return [
    product.code,
    product.name,
    product.category,
    product.brand,
    product.price,
    product.originalPrice,
    product.inStock,
    product.stockCount,
    product.active,
    product.visualCert,
    product.rating,
    product.reviewsCount,
    product.images.primary,
    JSON.stringify(product.images.angles),
    product.description,
    product.visualAlert,
    JSON.stringify(product.specs),
    JSON.stringify(product.inclusiveFeatures),
    product.lscVideoUrl ?? getProductLscVideoUrl(product.code),
    product.accountingValue ?? null,
  ];
}

async function findProduct(id: string): Promise<Product | null> {
  try {
    await ensureProductLscVideoColumn();
    const [rows] = await database.execute<ProductRow[]>(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  } catch {
    return findFallbackProduct(id);
  }
}

function isDuplicateCode(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

export const productsRouter = Router();
const productImagesDirectory = join(process.cwd(), "data", "product-images");

productsRouter.use(
  "/images",
  express.static(productImagesDirectory, {
    dotfiles: "deny",
    index: false,
    maxAge: "1d",
  }),
);

productsRouter.post(
  "/images",
  requireAdmin,
  express.raw({
    type: PRODUCT_IMAGE_MIME_TYPES,
    limit: "5mb",
  }),
  async (request, response) => {
    const mimeType = request.is(PRODUCT_IMAGE_MIME_TYPES);
    const image = request.body;
    const extension =
      mimeType && Buffer.isBuffer(image)
        ? getProductImageExtension(image, mimeType)
        : null;

    if (
      !mimeType ||
      !Buffer.isBuffer(image) ||
      image.length === 0 ||
      !extension
    ) {
      response.status(400).json({
        error: "Selecciona una imagen JPEG, PNG, WebP o GIF válida.",
      });
      return;
    }

    const filename = `${randomUUID()}.${extension}`;
    try {
      await mkdir(productImagesDirectory, { recursive: true });
      await writeFile(join(productImagesDirectory, filename), image, {
        flag: "wx",
      });
      response.status(201).json({ url: `/api/products/images/${filename}` });
    } catch (error) {
      console.error("Unable to store product image:", error);
      response.status(500).json({ error: "No se pudo guardar la imagen." });
    }
  },
);

productsRouter.get("/", async (_request, response) => {
  try {
    await ensureProductLscVideoColumn();
    const [rows] = await database.query<ProductRow[]>(
      `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at, id`,
    );
    const products =
      rows.length > 0 ? rows.map(mapProduct) : listFallbackProducts();
    response.json(products.map(serializeProduct));
  } catch (error) {
    console.error("Unable to load products:", error);
    response.json(listFallbackProducts().map(serializeProduct));
  }
});

productsRouter.get("/:id", async (request, response) => {
  try {
    await ensureProductLscVideoColumn();
    const [rows] = await database.execute<ProductRow[]>(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ? LIMIT 1`,
      [request.params.id],
    );
    const product = rows[0];

    if (!product) {
      response.status(404).json({ error: "Product not found" });
      return;
    }

    response.json(serializeProduct(mapProduct(product)));
  } catch (error) {
    console.error("Unable to load product:", error);
    const product = findFallbackProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Product not found" });
      return;
    }
    response.json(serializeProduct(product));
  }
});

productsRouter.post("/", requireAdmin, async (request, response) => {
  const product = parseProductInput(request.body);
  if (!product) {
    response.status(400).json({ error: "Los datos del producto no son válidos." });
    return;
  }

  try {
    await ensureProductLscVideoColumn();
    const id = randomUUID();
    await database.execute<ResultSetHeader>(
      `INSERT INTO products (
        id, code, name, category, brand, price, original_price, in_stock,
        stock_count, active, visual_cert, rating, reviews_count,
        primary_image_url, image_angles, description, visual_alert, specs,
        inclusive_features, lsc_video_url, accounting_value
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [id, ...productValues(product)],
    );

    const createdProduct = await findProduct(id);
    if (!createdProduct) {
      throw new Error("Created product could not be loaded");
    }

    response.status(201).json(serializeProduct(createdProduct));
  } catch (error) {
    if (isDuplicateCode(error)) {
      response.status(409).json({ error: "Ya existe un producto con ese código." });
      return;
    }

    try {
      const createdProduct = createFallbackProduct(product);
      response.status(201).json(serializeProduct(createdProduct));
    } catch (fallbackError) {
      if (isDuplicateCode(fallbackError)) {
        response.status(409).json({ error: "Ya existe un producto con ese código." });
        return;
      }
      console.error("Unable to create product:", error, fallbackError);
      response.status(500).json({ error: "No se pudo crear el producto." });
    }
  }
});

productsRouter.put("/:id", requireAdmin, async (request, response) => {
  const product = parseProductInput(request.body);
  if (!product) {
    response.status(400).json({ error: "Los datos del producto no son válidos." });
    return;
  }

  try {
    await ensureProductLscVideoColumn();
    await database.execute<ResultSetHeader>(
      `UPDATE products SET
        code = ?, name = ?, category = ?, brand = ?, price = ?,
        original_price = ?, in_stock = ?, stock_count = ?, active = ?,
        visual_cert = ?, rating = ?, reviews_count = ?, primary_image_url = ?,
        image_angles = ?, description = ?, visual_alert = ?, specs = ?,
        inclusive_features = ?, lsc_video_url = ?, accounting_value = ?
       WHERE id = ?`,
      [...productValues(product), request.params.id],
    );

    const updatedProduct = await findProduct(request.params.id);
    if (!updatedProduct) {
      response.status(404).json({ error: "No se encontró el producto." });
      return;
    }

    response.json(serializeProduct(updatedProduct));
  } catch (error) {
    if (isDuplicateCode(error)) {
      response.status(409).json({ error: "Ya existe un producto con ese código." });
      return;
    }

    try {
      const updatedProduct = updateFallbackProduct(request.params.id, product);
      if (!updatedProduct) {
        response.status(404).json({ error: "No se encontró el producto." });
        return;
      }
      response.json(serializeProduct(updatedProduct));
    } catch (fallbackError) {
      if (isDuplicateCode(fallbackError)) {
        response.status(409).json({ error: "Ya existe un producto con ese código." });
        return;
      }
      console.error("Unable to update product:", error, fallbackError);
      response.status(500).json({ error: "No se pudo actualizar el producto." });
    }
  }
});

productsRouter.patch("/:id/status", requireAdmin, async (request, response) => {
  const isActive =
    typeof request.body === "object" &&
    request.body !== null &&
    "active" in request.body &&
    typeof request.body.active === "boolean"
      ? request.body.active
      : null;

  if (isActive === null) {
    response.status(400).json({ error: "El estado del producto no es válido." });
    return;
  }

  try {
    await ensureProductLscVideoColumn();
    await database.execute<ResultSetHeader>(
      "UPDATE products SET active = ? WHERE id = ?",
      [isActive, request.params.id],
    );
    const product = await findProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "No se encontró el producto." });
      return;
    }
    response.json(serializeProduct(product));
  } catch (error) {
    const product = setFallbackProductStatus(request.params.id, isActive);
    if (!product) {
      response.status(404).json({ error: "No se encontró el producto." });
      return;
    }
    console.error("Unable to change product status:", error);
    response.json(serializeProduct(product));
  }
});

productsRouter.delete("/:id", requireAdmin, async (request, response) => {
  try {
    await ensureProductLscVideoColumn();
    await database.execute<ResultSetHeader>(
      "UPDATE products SET active = FALSE WHERE id = ?",
      [request.params.id],
    );
    const archivedProduct = await findProduct(request.params.id);
    if (!archivedProduct) {
      response.status(404).json({ error: "No se encontró el producto." });
      return;
    }
    response.json(serializeProduct(archivedProduct));
  } catch (error) {
    const archivedProduct = deleteFallbackProduct(request.params.id);
    if (!archivedProduct) {
      response.status(404).json({ error: "No se encontró el producto." });
      return;
    }
    console.error("Unable to archive product:", error);
    response.json(serializeProduct(archivedProduct));
  }
});
