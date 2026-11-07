import mysql from "mysql2/promise";

function parsePort(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
}

export const apiPort = parsePort("API_PORT", 4000);

export const databaseConfig = {
  host: process.env.DB_HOST?.trim() || "localhost",
  port: parsePort("DB_PORT", 3306),
  user: process.env.DB_USER?.trim() || "root",
  password: process.env.DB_PASSWORD?.trim() || "",
  database: process.env.DB_NAME?.trim() || "softtech_market",
};

export const database = mysql.createPool({
  ...databaseConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await database.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
