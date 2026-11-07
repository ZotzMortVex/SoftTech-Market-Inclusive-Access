import session from "express-session";
import { MysqlSessionStore } from "./mysqlSessionStore";

const SESSION_DURATION_MS = 10 * 60 * 1000;
const sessionSecret = process.env.SESSION_SECRET?.trim() ?? "development-session-secret-value-123456";

if (sessionSecret.length < 16) {
  throw new Error("SESSION_SECRET must contain at least 16 characters");
}

const shouldUseMysqlSessionStore = Boolean(
  process.env.DB_HOST?.trim() &&
    process.env.DB_USER?.trim() &&
    process.env.DB_PASSWORD?.trim() &&
    process.env.DB_NAME?.trim(),
);

export const sessionMiddleware = session({
  secret: sessionSecret,
  store: shouldUseMysqlSessionStore
    ? new MysqlSessionStore(SESSION_DURATION_MS)
    : new session.MemoryStore(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS,
  },
});
