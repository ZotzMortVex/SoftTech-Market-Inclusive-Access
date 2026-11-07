import "dotenv/config";
import type { RowDataPacket } from "mysql2";
import { INITIAL_PRODUCTS } from "../src/data/mockData";
import { database } from "../server/db";
import { ensureProductLscVideoColumn } from "../server/productSchema";
import { DEFAULT_LSC_VIDEO_URL } from "../src/utils/lscVideos";

async function seedInitialProducts(): Promise<void> {
  await ensureProductLscVideoColumn();
  const connection = await database.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS productCount FROM products",
    );
    if (Number(rows[0]?.productCount) > 0) {
      await connection.rollback();
      console.info("Product seed skipped: the products table is not empty.");
      return;
    }

    for (const product of INITIAL_PRODUCTS) {
      await connection.execute(
        `INSERT INTO products (
          id, code, name, category, brand, price, original_price, in_stock,
          stock_count, active, visual_cert, rating, reviews_count,
          primary_image_url, image_angles, description, visual_alert, specs,
          inclusive_features, lsc_video_url, accounting_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          product.id,
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
          product.lscVideoUrl ?? DEFAULT_LSC_VIDEO_URL,
          product.accountingValue ?? null,
        ],
      );
    }

    await connection.commit();
    console.info(`Seeded ${INITIAL_PRODUCTS.length} initial products.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await database.end();
  }
}

seedInitialProducts().catch((error: unknown) => {
  console.error("Unable to seed initial products:", error);
  process.exitCode = 1;
});
