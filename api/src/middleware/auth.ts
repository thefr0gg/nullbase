import type { Context, Next } from "hono";
import { verifyToken } from "../lib/crypto";
import type { AppEnv } from "../types";

/**
 * Bearer-token auth middleware. Verifies the HMAC session token and exposes
 * the admin user id via `c.get("adminId")`. Returns 401 for missing, malformed,
 * expired, or forged tokens. Rate limiting / WAF remain host-level concerns.
 */
export function requireAuth(tokenSecret: string) {
  return async (c: Context<AppEnv>, next: Next) => {
    const header = c.req.header("Authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const session = token ? await verifyToken(token, tokenSecret) : null;
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("adminId", session.sub);
    await next();
  };
}