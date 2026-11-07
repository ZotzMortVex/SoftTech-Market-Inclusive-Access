export const SESSION_UNAUTHORIZED_EVENT = "softtech:session-unauthorized";
export interface ApiAccessDeniedEventDetail {
  status: number;
}

function getRequestPath(input: RequestInfo | URL): string {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname
        : input.url;
  return new URL(url, "http://localhost").pathname;
}

function isRestrictedApiRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  const pathname = getRequestPath(input);
  const method =
    init?.method ??
    (typeof Request !== "undefined" && input instanceof Request
      ? input.method
      : "GET");

  if (pathname.startsWith("/api/products/images")) {
    return method !== "GET";
  }

  return (
    pathname.startsWith("/api/orders/") ||
    pathname === "/api/orders" ||
    pathname.startsWith("/api/analytics/") ||
    pathname === "/api/analytics" ||
    pathname === "/api/auth/users" ||
    pathname.startsWith("/api/auth/users/") ||
    ((pathname === "/api/products" ||
      pathname.startsWith("/api/products/")) &&
      method !== "GET")
  );
}

export function shouldShowErrorPage(
  status: number,
  input: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  if (getRequestPath(input).startsWith("/api/payments/mercadopago/")) {
    return false;
  }
  if ([400, 500, 502, 503].includes(status)) return true;
  return (
    (status === 401 || status === 403) &&
    isRestrictedApiRequest(input, init)
  );
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "same-origin",
  });

  if (
    shouldShowErrorPage(response.status, input, init) &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new CustomEvent<ApiAccessDeniedEventDetail>(
        SESSION_UNAUTHORIZED_EVENT,
        { detail: { status: response.status } },
      ),
    );
  }

  return response;
}
