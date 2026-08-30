import type { Context, Next } from "hono";
import { verifyAccessToken } from "../lib/crypto";
import type { AppEnv } from "../types";

/**
 * Bearer-token auth middleware. Verifies the short-lived JWT access token
 * and exposes the admin user id via `c.get("adminId")`. Returns 401 for
 * missing, malformed, expired, or forged tokens — including a naturally
 * expired access token, which the client is expected to handle by calling
 * `POST /admin/refresh` (using its httpOnly refresh cookie) and retrying.
 * Rate limiting / WAF remain host-level concerns.
 */
export function requireAuth(tokenSecret: string) {
  return async (c: Context<AppEnv>, next: Next) => {
    const header = c.req.header("Authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const session = token ? await verifyAccessToken(token, tokenSecret) : null;
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("adminId", session.sub);
    await next();
  };
}