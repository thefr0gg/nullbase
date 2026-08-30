import { Hono } from "hono";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import type { Services } from "../services";
import type { AppEnv } from "../types";
import { requireAuth } from "../middleware/auth";
import type { AuthResult } from "../services/admin-service";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

const REFRESH_COOKIE = "nb_refresh";
const HINT_COOKIE = "nb_admin_hint";
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // must match admin-service.ts

/**
 * `cookieDomain` is `undefined` in dev (cookies scope to the exact host,
 * e.g. localhost — a `Domain` attribute of "nullbase.wiki" would be
 * rejected by the browser from a non-matching host) and "nullbase.wiki" in
 * production, so the refresh/hint cookies are shared across
 * admin.nullbase.wiki and nullbase.wiki. `secureCookies` is `false` in dev
 * (plain `http://localhost` — a `Secure` cookie is never stored/sent over
 * a non-HTTPS origin, browsers and PowerShell's `WebRequestSession` alike)
 * and `true` in production.
 */
export function adminRoutes(
  services: Services,
  tokenSecret: string,
  cookieDomain?: string,
  secureCookies = true,
): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  function setAuthCookies(c: Context<AppEnv>, auth: AuthResult) {
    setCookie(c, REFRESH_COOKIE, auth.refreshToken, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "Lax",
      domain: cookieDomain,
      path: "/v1/admin",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    });
    // Non-httpOnly, carries no information beyond "a session probably
    // exists" — read by the main site's navbar to decide whether to show
    // the admin panel link. The real credential never leaves this cookie.
    setCookie(c, HINT_COOKIE, "1", {
      httpOnly: false,
      secure: secureCookies,
      sameSite: "Lax",
      domain: cookieDomain,
      path: "/",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    });
  }

  function clearAuthCookies(c: Context<AppEnv>) {
    deleteCookie(c, REFRESH_COOKIE, { domain: cookieDomain, path: "/v1/admin" });
    deleteCookie(c, HINT_COOKIE, { domain: cookieDomain, path: "/" });
  }

  // POST /v1/admin/login — exchange email + password for a new session.
  routes.post("/login", async (c) => {
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "Invalid request body." }, 400);
    }
    const userAgent = c.req.header("User-Agent") ?? null;
    const result = await services.admin.login(parsed.data.email, parsed.data.password, userAgent);
    if (!result.ok || !result.auth) {
      return c.json({ error: "Invalid email or password." }, 401);
    }
    setAuthCookies(c, result.auth);
    return c.json({ accessToken: result.auth.accessToken, admin: result.auth.admin });
  });

  // POST /v1/admin/refresh — exchange the httpOnly refresh cookie for a new
  // access token, rotating the refresh token. No Authorization header
  // needed (that's the point — the access token may already be expired).
  routes.post("/refresh", async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    if (!refreshToken) return c.json({ error: "No session." }, 401);
    const userAgent = c.req.header("User-Agent") ?? null;
    const result = await services.admin.refresh(refreshToken, userAgent);
    if (!result.ok || !result.auth) {
      clearAuthCookies(c);
      return c.json({ error: "Session expired." }, 401);
    }
    setAuthCookies(c, result.auth);
    return c.json({ accessToken: result.auth.accessToken, admin: result.auth.admin });
  });

  // POST /v1/admin/logout — revoke the current session. Deliberately not
  // gated by requireAuth: a logout attempt should succeed even if the
  // access token has already expired, as long as the refresh cookie
  // (which is what's actually being invalidated) is present.
  routes.post("/logout", async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE);
    if (refreshToken) await services.admin.logout(refreshToken);
    clearAuthCookies(c);
    return c.json({ ok: true });
  });

  // Everything below requires a valid (unexpired) access token.
  routes.use("*", requireAuth(tokenSecret));

  // GET /v1/admin/me — validate a token / fetch the session identity.
  routes.get("/me", async (c) => {
    const adminId = c.get("adminId");
    const admin = await services.admin.findById(adminId);
    if (!admin) return c.json({ error: "Account no longer exists." }, 401);
    return c.json(admin);
  });

  // GET /v1/admin/sessions — this admin's active devices/browsers.
  routes.get("/sessions", async (c) => {
    const adminId = c.get("adminId");
    const currentRefreshToken = getCookie(c, REFRESH_COOKIE) ?? null;
    const sessions = await services.admin.listSessions(adminId, currentRefreshToken);
    return c.json({ items: sessions });
  });

  // POST /v1/admin/sessions/:id/revoke — remote "log out that device".
  routes.post("/sessions/:id/revoke", async (c) => {
    const adminId = c.get("adminId");
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ error: "Invalid session id." }, 400);
    }
    const revoked = await services.admin.revokeSession(adminId, id);
    if (!revoked) return c.json({ error: "Session not found." }, 404);
    return c.json({ ok: true });
  });

  // GET /v1/admin/feedback?status=&page=&limit=&offset= — paginated list.
  routes.get("/feedback", async (c) => {
    const status = c.req.query("status");
    const pagePath = c.req.query("page") || undefined;
    const limit = Math.min(Number(c.req.query("limit") ?? 50) || 50, 200);
    const offset = Math.max(Number(c.req.query("offset") ?? 0) || 0, 0);
    const result = await services.feedback.list({
      status: status === "new" || status === "resolved" || status === "dismissed" ? status : undefined,
      pagePath,
      limit,
      offset,
    });
    return c.json(result);
  });

  // PATCH /v1/admin/feedback/:id — triage (update status).
  routes.patch("/feedback/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ error: "Invalid feedback id." }, 400);
    }
    const body = await c.req.json().catch(() => null);
    const parsed = z.object({ status: z.enum(["new", "resolved", "dismissed"]) }).safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid status; expected new, resolved, or dismissed." }, 400);
    }
    const updated = await services.feedback.updateStatus(id, parsed.data.status);
    if (!updated) return c.json({ error: "Feedback not found." }, 404);
    return c.json({ ok: true });
  });

  // GET /v1/admin/likes?limit=&offset= — per-page like counts, most-liked first.
  routes.get("/likes", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") ?? 50) || 50, 200);
    const offset = Math.max(Number(c.req.query("offset") ?? 0) || 0, 0);
    const result = await services.likes.listAll({ limit, offset });
    return c.json(result);
  });

  return routes;
}
