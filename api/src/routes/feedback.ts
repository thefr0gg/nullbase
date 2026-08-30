import { Hono } from "hono";
import { z } from "zod";
import { readIdentity } from "../lib/identity";
import { FEEDBACK_TYPES } from "../lib/feedback-types";
import type { Services } from "../services";
import type { AppEnv } from "../types";
import { FeedbackValidationError } from "../services/feedback-service";

const submitSchema = z
  .object({
    page: z.string().startsWith("/").max(500),
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional(),
    email: z.email().optional(),
    type: z.enum(FEEDBACK_TYPES).optional(),
    // The visitor's locale at submission time — not tied to a fixed enum
    // here since the API shouldn't need to know the web workspace's locale
    // list to accept a value; it's just recorded for display.
    locale: z.string().min(2).max(10).optional(),
  })
  .refine((v) => v.rating != null || (v.comment != null && v.comment.trim() !== ""), {
    message: "A rating or a comment is required.",
  });

export function feedbackRoutes(services: Services): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  // POST /v1/feedback — public page-feedback submission (rate limited per
  // visitor/network identity; see services/feedback-service.ts).
  routes.post("/", async (c) => {
    const parsed = submitSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." }, 400);
    }
    try {
      const created = await services.feedback.submit(
        {
          pagePath: parsed.data.page,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
          email: parsed.data.email,
          type: parsed.data.type,
          locale: parsed.data.locale,
        },
        readIdentity(c),
      );
      return c.json({ id: created.id }, 201);
    } catch (e) {
      if (e instanceof FeedbackValidationError) {
        return c.json({ error: e.message }, 400);
      }
      throw e;
    }
  });

  return routes;
}