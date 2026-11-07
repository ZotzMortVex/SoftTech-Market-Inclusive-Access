import type { NextFunction, Request, Response } from "express";

export const ERROR_APOLOGY =
  "Pedimos disculpas por estos inconvenientes, estamos trabajando para mejorar.";

const ERROR_NAMES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  413: "Payload Too Large",
  429: "Too Many Requests",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

export interface StandardHttpError {
  status: number;
  error: string;
  message: string;
  code: string;
  details?: string;
}

export function createStandardHttpError(
  status: number,
  details?: string,
): StandardHttpError {
  return {
    status,
    error: ERROR_NAMES[status] ?? "HTTP Error",
    message: ERROR_APOLOGY,
    code: `ERR_${status}`,
    ...(details ? { details } : {}),
  };
}

export function standardizeHttpErrors(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  const sendJson = response.json.bind(response);
  response.json = ((body?: unknown) => {
    if (response.statusCode < 400) return sendJson(body);

    const details =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : undefined;
    return sendJson(createStandardHttpError(response.statusCode, details));
  }) as Response["json"];
  next();
}
