import { Hono } from "hono";
import type { Database } from "./db/port";
import { corsMiddleware } from "./middleware/cors";
import { adminRoutes } from "./routes/admin";
import { feedbackRoutes } from "./routes/feedback";
import { healthRoutes } from "./routes/health";
import { likesRoutes } from "./routes/likes";
import { createServices } from "./services";
import { RateLimitedError } from "./services/errors";
import type { AppEnv } from "./types";

export interface AppConfig {
  db: Database;
  /** Comma-separated list came from env; parsed by the runtime entrypoints. */
  allowedOrigins: string[];
  tokenSecret: string;
}

/**
 * Builds the entire Hono application — the ONLY place where routing,
 * middleware, services, and the database port are wired together. Both
 * runtime entrypoints (worker.ts on D1, dev-server.ts on better-sqlite3)
 * call this with their own adapter, so business logic exists exactly once.
 */
export function createApp(config: AppConfig): Hono<AppEnv> {
  const services = createServices(config.db, config.tokenSecret);

  const app = new Hono<AppEnv>().basePath("/v1");

    // CORS: the frontend and API are different origins by design.
  app.use("*", corsMiddleware(config.allowedOrigins));

  // Bootstrap middleware: put the port + services on the context.
  app.use("*", async (c, next) => {
    c.set("db", config.db);
    c.set("services", services);
    await next();
  });

  app.onError((err, c) => {
    if (err instanceof RateLimitedError) {
      c.header("Retry-After", String(err.retryAfterSeconds));
      return c.json({ error: err.message }, 429);
    }
    console.error(`[api] ${c.req.method} ${c.req.path}:`, err);
    return c.json({ error: "Internal server error." }, 500);
  });

  app.notFound((c) => c.json({ error: "Not found." }, 404));

  app.route("/health", healthRoutes());
  app.route("/admin", adminRoutes(services, config.tokenSecret));
  app.route("/feedback", feedbackRoutes(services));
  app.route("/likes", likesRoutes(services));

  return app;
}