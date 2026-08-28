import { Hono } from "hono";
import { z } from "zod";
import type { Services } from "../services";
import type { AppEnv } from "../types";
import { requireAuth } from "../middleware/auth";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

export function adminRoutes(services: Services, tokenSecret: string): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  // POST /v1/admin/login — exchange email + password for a session token.
  routes.post("/login", async (c) => {
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "Invalid request body." }, 400);
    }
    const result = await services.admin.login(parsed.data.email, parsed.data.password);
    if (!result.ok) {
      return c.json({ error: "Invalid email or password." }, 401);
    }
    return c.json({ token: result.token, admin: result.admin });
  });

  // Everything below requires a valid session token.
  routes.use("*", requireAuth(tokenSecret));

  // GET /v1/admin/me — validate a token / fetch the session identity.
  routes.get("/me", async (c) => {
    const adminId = c.get("adminId");
    const admin = await services.admin.findById(adminId);
    if (!admin) return c.json({ error: "Account no longer exists." }, 401);
    return c.json({ id: admin.id, email: admin.email, role: admin.role });
  });

  // GET /v1/admin/feedback?status=&limit=&offset= — paginated list.
  routes.get("/feedback", async (c) => {
    const status = c.req.query("status");
    const limit = Math.min(Number(c.req.query("limit") ?? 50) || 50, 200);
    const offset = Math.max(Number(c.req.query("offset") ?? 0) || 0, 0);
    const result = await services.feedback.list({
      status: status === "new" || status === "resolved" || status === "dismissed" ? status : undefined,
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

  return routes;
}