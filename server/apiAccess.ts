export function isPublicApiRoute(method: string, pathname: string): boolean {
  return (
    (method === "GET" &&
      (pathname === "/api/health" ||
        pathname === "/api/products" ||
        /^\/api\/products\/(?!images(?:\/|$))[^/]+$/.test(pathname) ||
        /^\/api\/products\/images\/[^/]+$/.test(pathname))) ||
    (method === "POST" &&
      /^\/api\/auth\/(login|register|logout|password-reset\/request|password-reset\/confirm)$/.test(
        pathname,
      ))
  );
}
