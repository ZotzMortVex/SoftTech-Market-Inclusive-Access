import type { RowDataPacket } from "mysql2";
import {
  BEACON_LSC_VIDEO_URL,
  DEFAULT_LSC_VIDEO_URL,
  BONE_CONDUCTION_HEADPHONES_LSC_VIDEO_URL,
  CURVED_MONITOR_LSC_VIDEO_URL,
  ERGONOMIC_MOUSE_LSC_VIDEO_URL,
  GRAPHICS_TABLET_LSC_VIDEO_URL,
  getProductLscVideoUrl,
  MECHANICAL_KEYBOARD_LSC_VIDEO_URL,
  PROTOTYPE_KEYBOARD_LSC_VIDEO_URL,
  THUNDERBOLT_HUB_LSC_VIDEO_URL,
  ULTRABOOK_PRO_16_LSC_VIDEO_URL,
} from "../src/utils/lscVideos";
import { database } from "./db";

let productSchemaReady: Promise<void> | null = null;

export async function ensureProductLscVideoColumn(): Promise<void> {
  if (!productSchemaReady) {
    productSchemaReady = (async () => {
      const [columns] = await database.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME AS name
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'products'
           AND COLUMN_NAME = 'lsc_video_url'`,
      );

      if (columns.length === 0) {
        await database.query(
          `ALTER TABLE products
           ADD COLUMN lsc_video_url VARCHAR(2048) NOT NULL
           DEFAULT '${DEFAULT_LSC_VIDEO_URL}'`,
        );
      }

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE lsc_video_url IS NULL OR TRIM(lsc_video_url) = ''`,
        [DEFAULT_LSC_VIDEO_URL],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ?`,
        [
          PROTOTYPE_KEYBOARD_LSC_VIDEO_URL,
          "CUD016",
          "Prototipo de Teclado Braille Óptico",
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name LIKE ?`,
        [ULTRABOOK_PRO_16_LSC_VIDEO_URL, "CUD008", "Ultrabook Pro 16%"],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ?`,
        [
          MECHANICAL_KEYBOARD_LSC_VIDEO_URL,
          "CUD010",
          "Teclado Mecánico Háptico Silent Touch",
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          GRAPHICS_TABLET_LSC_VIDEO_URL,
          "CUD012",
          'Tablet Gráfica Pro 12" PaperTouch',
          1520000,
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          CURVED_MONITOR_LSC_VIDEO_URL,
          "CUD009",
          'Monitor Curvo 34" UltraWide QHD Lumínico',
          2950000,
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          THUNDERBOLT_HUB_LSC_VIDEO_URL,
          "CUD013",
          "Hub Thunderbolt 4 con Matriz LED de Diagnóstico",
          860000,
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          ERGONOMIC_MOUSE_LSC_VIDEO_URL,
          "CUD014",
          "Ratón Ergonómico Háptico con Tira Lumínica",
          350000,
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          BEACON_LSC_VIDEO_URL,
          "CUD015",
          "Baliza Estroboscópica USB para Notificaciones",
          195000,
        ],
      );

      await database.execute(
        `UPDATE products
         SET lsc_video_url = ?
         WHERE code = ? AND name = ? AND price = ?`,
        [
          BONE_CONDUCTION_HEADPHONES_LSC_VIDEO_URL,
          "CUD011",
          "Auriculares de Conducción Ósea con Faro LED",
          510000,
        ],
      );

      const [productsWithWelcomeVideo] =
        await database.execute<RowDataPacket[]>(
          `SELECT code
           FROM products
           WHERE LOWER(lsc_video_url) LIKE '%/welcome.mp4'`,
        );

      for (const product of productsWithWelcomeVideo) {
        if (typeof product.code !== "string") continue;

        await database.execute(
          `UPDATE products
           SET lsc_video_url = ?
           WHERE code = ? AND LOWER(lsc_video_url) LIKE '%/welcome.mp4'`,
          [getProductLscVideoUrl(product.code), product.code],
        );
      }
    })().catch((error: unknown) => {
      productSchemaReady = null;
      throw error;
    });
  }

  return productSchemaReady;
}
