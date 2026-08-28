import { Hono } from "hono";
import type { AppEnv } from "../types";

export function healthRoutes(): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  // GET /v1/health — liveness + database connectivity check.
  routes.get("/", async (c) => {
    const db = c.get("db");
    const row = await db.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    return c.json({ status: row?.ok === 1 ? "ok" : "degraded" });
  });

  return routes;
}