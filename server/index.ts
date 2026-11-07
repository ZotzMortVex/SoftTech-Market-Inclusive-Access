import "dotenv/config";
import express from "express";
import type { ErrorRequestHandler } from "express";
import { isPublicApiRoute } from "./apiAccess";
import { apiPort, database } from "./db";
import { authRouter, requireAuth } from "./auth";
import { productsRouter } from "./products";
import { salesAnalyticsRouter } from "./salesAnalytics";
import { simulatedPaymentsRouter } from "./simulatedPayments";
import { mercadoPagoRouter } from "./mercadoPago";
import { ordersRouter } from "./orders";
import { sessionMiddleware } from "./session";
import { createStandardHttpError, standardizeHttpErrors } from "./httpErrors";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "16kb" }));
app.use(sessionMiddleware);
app.use("/api", standardizeHttpErrors);
app.use("/api", (request, response, next) => {
  const pathname = new URL(request.originalUrl, "http://localhost").pathname;
  if (isPublicApiRoute(request.method, pathname)) {
    next();
    return;
  }

  requireAuth(request, response, next);
});
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/analytics", salesAnalyticsRouter);
app.use("/api/payments", simulatedPaymentsRouter);
app.use("/api/payments/mercadopago", mercadoPagoRouter);
app.use("/api/orders", ordersRouter);

app.get("/api/health", async (_request, response) => {
  try {
    await database.query("SELECT 1");
    response.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("MySQL health check failed:", error);
    response.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

const apiErrorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500;

  if (status === 400 || status === 413) {
    console.warn("Rejected an HTTP request with invalid or oversized data.");
  } else {
    console.error(
      "Unhandled HTTP request error:",
      error instanceof Error ? error.message : "Unknown request error",
    );
  }

  response.status(status).json(createStandardHttpError(status));
};

app.use(apiErrorHandler);

app.listen(apiPort, () => {
  console.log(`Express API listening on http://localhost:${apiPort}`);
});
