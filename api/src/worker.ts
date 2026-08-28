import { Hono } from "hono";
import type { AppConfig } from "./app";
import { createApp } from "./app";
import { D1Database } from "./db/d1";
import type { D1Binding } from "./db/port";

/**
 * Cloudflare Worker entrypoint (production).
 *
 * The D1 binding (`env.DB`, bound in wrangler.jsonc to nullbase-db) is the
 * ONLY way the API touches production data — no credentials, no connection
 * strings, authentication is handled entirely by Cloudflare.
 */
interface Env {
  DB: D1Binding;
  ALLOWED_ORIGINS?: string;
  ADMIN_TOKEN_SECRET?: string;
}

const DEFAULT_ALLOWED_ORIGINS = [
  "https://nullbase.wiki",
  "https://www.nullbase.wiki",
  "https://admin.nullbase.wiki",
].join(",");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!env.DB) {
      return Response.json(
        { error: "D1 binding `DB` is not available. Check the wrangler configuration." },
        { status: 500 },
      );
    }
    if (!env.ADMIN_TOKEN_SECRET) {
      return Response.json(
        { error: "ADMIN_TOKEN_SECRET is not set. Run: npx wrangler secret put ADMIN_TOKEN_SECRET" },
        { status: 500 },
      );
    }
    const config: AppConfig = {
      db: new D1Database(env.DB),
      allowedOrigins: (env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS).split(",").map((s) => s.trim()),
      tokenSecret: env.ADMIN_TOKEN_SECRET,
    };
    // The D1 binding is per-isolate, so the app is built per request — it is
    // a cheap object graph (no connections are opened per request).
    return createApp(config).fetch(request);
  },
};
