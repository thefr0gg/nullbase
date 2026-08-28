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
  return cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86_400,
  });
}
