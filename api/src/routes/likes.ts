import { Hono } from "hono";
import { z } from "zod";
import { readIdentity } from "../lib/identity";
import type { Services } from "../services";
import type { AppEnv } from "../types";

export function likesRoutes(services: Services): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  // GET /v1/likes?page=/http/status-codes/404 — current like count.
  routes.get("/", async (c) => {
    const page = c.req.query("page");
    if (!page || !page.startsWith("/") || page.length > 500) {
      return c.json({ error: "Missing or invalid `page` query parameter." }, 400);
    }
    return c.json({ page, count: await services.likes.count(page) });
  });

  // POST /v1/likes { "page": "/http" } — like a page. Identity (visitor UUID,
  // IP, user agent) is hashed server-side for dedupe + rate limiting; no raw
  // request data is stored.
  routes.post("/", async (c) => {
    const parsed = z
      .object({ page: z.string().startsWith("/").max(500) })
      .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "Invalid request body." }, 400);
    }
    const result = await services.likes.like(parsed.data.page, readIdentity(c));
    return c.json({ page: parsed.data.page, liked: result.liked, count: result.count });
  });

  return routes;
}