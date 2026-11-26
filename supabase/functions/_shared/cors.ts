const STATIC_ALLOWED_ORIGINS = new Set([
  "https://astradehub.com",
  "https://www.astradehub.com",
]);

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  if (STATIC_ALLOWED_ORIGINS.has(origin)) return true;

  const customBase = Deno.env.get("APP_BASE_URL")?.trim();
  if (customBase && origin === customBase.replace(/\/+$/, "")) {
    return true;
  }

  return /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(origin);
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowedOrigin = isAllowedOrigin(origin)
    ? origin
    : (Deno.env.get("APP_BASE_URL")?.trim().replace(/\/+$/, "") || "https://astradehub.com");

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function resolveReturnBaseUrl(req: Request): string {
  const origin = req.headers.get("origin");
  if (isAllowedOrigin(origin)) return origin;

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (isAllowedOrigin(refOrigin)) return refOrigin;
    } catch {
      // Ignore malformed referer
    }
  }

  return Deno.env.get("APP_BASE_URL")?.trim().replace(/\/+$/, "") || "https://astradehub.com";
}
