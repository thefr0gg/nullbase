import { cors } from "hono/cors";

/**
 * CORS middleware.
 *
 * The frontend (nullbase.wiki / admin.nullbase.wiki) and the API
 * (api.nullbase.wiki) are different origins by design. This module is
 * the single source of truth for the policy — it validates the Origin
 * header against an allowlist, handles the OPTIONS preflight handshake
 * for every route, and never responds with "*".
 *
 * Origins are injected at the application entrypoints via `allowedOrigins`
 * (worker.ts parses ALLOWED_ORIGINS / .dev.vars, dev-server.ts reads the env).
 */
export function corsMiddleware(allowedOrigins: string[]) {
  const safeAllowedOrigins = allowedOrigins
    .map((origin) => origin.trim())
    .filter(Boolean);

  const corsHandler = cors({
    origin: safeAllowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Visitor-Id",
      "X-Requested-With",
    ],
    exposeHeaders: ["Retry-After"],
    maxAge: 86_400,
    // Required for the browser to send/receive the admin panel's httpOnly
    // refresh cookie cross-subdomain (admin.nullbase.wiki calling
    // api.nullbase.wiki). Only takes effect for requests a client opts
    // into via `credentials: "include"` — the public likes/feedback calls
    // in web/lib/api.ts stay on `credentials: "omit"`, unaffected.
    credentials: true,
  });

  return async (c: Parameters<typeof corsHandler>[0], next: () => Promise<void>) => {
    const origin = c.req.header("Origin");
    if (origin && !safeAllowedOrigins.includes(origin)) {
      console.warn(
        `[api] rejected CORS origin: ${origin} (allowed: ${safeAllowedOrigins.join(", ") || "<none>"})`,
      );
    }
    return corsHandler(c, next);
  };
}
