import type { RowDataPacket } from "mysql2";
import { database } from "./db";

let orderSchemaReady: Promise<void> | null = null;

export function ensureOrderSchema(): Promise<void> {
  if (!orderSchemaReady) {
    orderSchemaReady = (async () => {
      await database.query(`
        CREATE TABLE IF NOT EXISTS sales_orders (
          order_id VARCHAR(128) NOT NULL,
          user_id VARCHAR(64) NULL,
          total DECIMAL(14, 2) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'pendiente',
          order_details LONGTEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (order_id),
          INDEX sales_orders_created_at_idx (created_at),
          INDEX sales_orders_user_id_idx (user_id)
        ) ENGINE=InnoDB
      `);
      await database.query(`
        CREATE TABLE IF NOT EXISTS sales_order_items (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          order_id VARCHAR(128) NOT NULL,
          product_id VARCHAR(64) NOT NULL,
          product_code VARCHAR(64) NOT NULL,
          product_name VARCHAR(200) NOT NULL,
          category VARCHAR(80) NOT NULL,
          quantity INT UNSIGNED NOT NULL,
          unit_price DECIMAL(12, 2) NOT NULL,
          PRIMARY KEY (id),
          INDEX sales_order_items_order_idx (order_id),
          INDEX sales_order_items_product_idx (product_id),
          CONSTRAINT sales_order_items_order_fk
            FOREIGN KEY (order_id) REFERENCES sales_orders(order_id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);

      const [columns] = await database.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME AS name
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_orders'`,
      );
      const existingColumns = new Set(columns.map((column) => column.name));
      if (!existingColumns.has("user_id")) {
        await database.query(
          "ALTER TABLE sales_orders ADD COLUMN user_id VARCHAR(64) NULL",
        );
      }
      if (!existingColumns.has("status")) {
        await database.query(
          "ALTER TABLE sales_orders ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pendiente'",
        );
      }
      if (!existingColumns.has("order_details")) {
        await database.query(
          "ALTER TABLE sales_orders ADD COLUMN order_details LONGTEXT NULL",
        );
      }

      const [indexes] = await database.execute<RowDataPacket[]>(
        `SELECT INDEX_NAME AS name
         FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sales_orders'`,
      );
      if (!indexes.some((index) => index.name === "sales_orders_user_id_idx")) {
        await database.query(
          "ALTER TABLE sales_orders ADD INDEX sales_orders_user_id_idx (user_id)",
        );
      }
    })().catch((error: unknown) => {
      orderSchemaReady = null;
      throw error;
    });
  }

  return orderSchemaReady;
}
