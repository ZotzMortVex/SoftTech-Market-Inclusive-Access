import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "./auth";
import { database } from "./db";
import { ensureOrderSchema } from "./orderStore";

interface SalesOrderRow extends RowDataPacket {
  totalSales: number | string;
  totalOrders: number | string;
  averageTicket: number | string | null;
}

interface YearRow extends RowDataPacket {
  year: number | string;
}

interface CategoryRow extends RowDataPacket {
  category: string;
  totalSales: number | string;
  unitsSold: number | string;
  orders: number | string;
}

interface TopProductRow extends RowDataPacket {
  productId: string;
  code: string;
  name: string;
  category: string;
  unitsSold: number | string;
  orders: number | string;
  totalSales: number | string;
}

interface MonthlyRow extends RowDataPacket {
  month: number | string;
  totalSales: number | string;
  orders: number | string;
}

interface AnnualRow extends RowDataPacket {
  year: number | string;
  totalSales: number | string;
  orders: number | string;
}

function mapNumbers<T extends Record<string, unknown>>(
  row: T,
  numberKeys: (keyof T)[],
): T {
  const mapped = { ...row };
  for (const key of numberKeys) {
    mapped[key] = Number(row[key]) as T[keyof T];
  }
  return mapped;
}

export function parseSalesPeriodParameters(
  rawYear: unknown,
  rawMonth: unknown,
): { year?: number; month?: number } | null {
  if (
    rawYear !== undefined &&
    (typeof rawYear !== "string" ||
      !/^\d{4}$/.test(rawYear) ||
      Number(rawYear) < 2000 ||
      Number(rawYear) > 2100)
  ) {
    return null;
  }
  if (
    rawMonth !== undefined &&
    (typeof rawMonth !== "string" ||
      !/^(?:0?[1-9]|1[0-2])$/.test(rawMonth))
  ) {
    return null;
  }

  return {
    ...(rawYear === undefined ? {} : { year: Number(rawYear) }),
    ...(rawMonth === undefined ? {} : { month: Number(rawMonth) }),
  };
}

export const salesAnalyticsRouter = Router();

salesAnalyticsRouter.get("/sales", requireAdmin, async (request, response) => {
  const period = parseSalesPeriodParameters(
    request.query.year,
    request.query.month,
  );
  if (!period) {
    response.status(400).json({
      error: "El año o mes de consulta no es válido.",
    });
    return;
  }

  try {
    await ensureOrderSchema();
    const [yearRows] = await database.query<YearRow[]>(
      "SELECT DISTINCT YEAR(created_at) AS year FROM sales_orders ORDER BY year DESC",
    );
    const years = yearRows.map((row) => Number(row.year));
    const selectedYear =
      period.year === undefined
        ? (years[0] ?? new Date().getFullYear())
        : period.year;
    const start = period.month
      ? `${selectedYear}-${String(period.month).padStart(2, "0")}-01 00:00:00`
      : `${selectedYear}-01-01 00:00:00`;
    const end =
      period.month === 12
        ? `${selectedYear + 1}-01-01 00:00:00`
        : period.month
          ? `${selectedYear}-${String(period.month + 1).padStart(2, "0")}-01 00:00:00`
          : `${selectedYear + 1}-01-01 00:00:00`;
    const dateClause = "created_at >= ? AND created_at < ?";
    const range = [start, end];

    const [[totals]] = await database.execute<SalesOrderRow[]>(
      `SELECT CAST(COALESCE(SUM(total), 0) AS DOUBLE) AS totalSales,
              COUNT(*) AS totalOrders,
              CAST(COALESCE(AVG(total), 0) AS DOUBLE) AS averageTicket
       FROM sales_orders WHERE ${dateClause}`,
      range,
    );
    const [categoryRows] = await database.execute<CategoryRow[]>(
      `SELECT i.category,
              CAST(SUM(i.unit_price * i.quantity) AS DOUBLE) AS totalSales,
              SUM(i.quantity) AS unitsSold,
              COUNT(DISTINCT i.order_id) AS orders
       FROM sales_order_items i
       INNER JOIN sales_orders o ON o.order_id = i.order_id
       WHERE o.created_at >= ? AND o.created_at < ?
       GROUP BY i.category
       ORDER BY totalSales DESC`,
      range,
    );
    const [topProductRows] = await database.execute<TopProductRow[]>(
      `SELECT i.product_id AS productId, i.product_code AS code,
              i.product_name AS name, i.category,
              SUM(i.quantity) AS unitsSold,
              COUNT(DISTINCT i.order_id) AS orders,
              CAST(SUM(i.unit_price * i.quantity) AS DOUBLE) AS totalSales
       FROM sales_order_items i
       INNER JOIN sales_orders o ON o.order_id = i.order_id
       WHERE o.created_at >= ? AND o.created_at < ?
       GROUP BY i.product_id, i.product_code, i.product_name, i.category
       ORDER BY unitsSold DESC, orders DESC, totalSales DESC
       LIMIT 5`,
      range,
    );
    const [topRevenueProductRows] = await database.execute<TopProductRow[]>(
      `SELECT i.product_id AS productId, i.product_code AS code,
              i.product_name AS name, i.category,
              SUM(i.quantity) AS unitsSold,
              COUNT(DISTINCT i.order_id) AS orders,
              CAST(SUM(i.unit_price * i.quantity) AS DOUBLE) AS totalSales
       FROM sales_order_items i
       INNER JOIN sales_orders o ON o.order_id = i.order_id
       WHERE o.created_at >= ? AND o.created_at < ?
       GROUP BY i.product_id, i.product_code, i.product_name, i.category
       ORDER BY totalSales DESC, unitsSold DESC
       LIMIT 5`,
      range,
    );
    const [monthlyRows] = await database.execute<MonthlyRow[]>(
      `SELECT MONTH(created_at) AS month,
              CAST(SUM(total) AS DOUBLE) AS totalSales,
              COUNT(*) AS orders
       FROM sales_orders WHERE ${dateClause}
       GROUP BY MONTH(created_at) ORDER BY month`,
      range,
    );
    const [annualRows] = await database.query<AnnualRow[]>(
      `SELECT YEAR(created_at) AS year,
              CAST(SUM(total) AS DOUBLE) AS totalSales,
              COUNT(*) AS orders
       FROM sales_orders GROUP BY YEAR(created_at) ORDER BY year`,
    );

    response.json({
      selectedYear,
      ...(period.month === undefined ? {} : { selectedMonth: period.month }),
      years: years.length > 0 ? years : [selectedYear],
      totalSales: Number(totals?.totalSales ?? 0),
      totalOrders: Number(totals?.totalOrders ?? 0),
      averageTicket: Number(totals?.averageTicket ?? 0),
      categories: categoryRows.map((row) =>
        mapNumbers(row, ["totalSales", "unitsSold", "orders"]),
      ),
      topProducts: topProductRows.map((row) =>
        mapNumbers(row, ["unitsSold", "orders", "totalSales"]),
      ),
      topRevenueProducts: topRevenueProductRows.map((row) =>
        mapNumbers(row, ["unitsSold", "orders", "totalSales"]),
      ),
      monthlySales: monthlyRows.map((row) =>
        mapNumbers(row, ["month", "totalSales", "orders"]),
      ),
      annualSales: annualRows.map((row) =>
        mapNumbers(row, ["year", "totalSales", "orders"]),
      ),
    });
  } catch (error) {
    console.error("Unable to load sales analytics:", error);
    response.status(503).json({
      error: "No se pudo cargar el análisis de ventas desde la base de datos.",
    });
  }
});
