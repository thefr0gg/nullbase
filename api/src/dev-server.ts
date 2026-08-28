import { serve } from "@hono/node-server";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppConfig } from "./app";
import { createApp } from "./app";
import { SqliteDatabase } from "./db/sqlite";

/**
 * Plain-Node development entrypoint (better-sqlite3).
 *
 * Runs the SAME application as the production Worker (src/app.ts) — only the
 * database adapter and the HTTP server differ. No D1, no wrangler, no
 * workerd: everything runs against api/data/nullbase.db.
 *
 * `npm run dev` (tsx watch) — reset anytime with `npm run db:reset`.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.SQLITE_PATH ?? path.resolve(here, "../data/nullbase.db");

const config: AppConfig = {
  db: new SqliteDatabase(dbFile),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim()),
  // Dev-only default; production uses `wrangler secret put ADMIN_TOKEN_SECRET`.
  tokenSecret: process.env.ADMIN_TOKEN_SECRET ?? "dev-only-secret-change-me",
};

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: createApp(config).fetch, port }, (info) => {
  console.log(`[api] dev server on http://localhost:${info.port} (sqlite: ${dbFile})`);
});