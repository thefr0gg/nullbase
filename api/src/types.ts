import type { Database } from "./db/port";
import type { Services } from "./services";

/** Identity extracted from the incoming request (never stored raw). */
export interface RequestIdentity {
  /** Random client-generated UUID (X-Visitor-Id header); null if absent/invalid. */
  visitorId: string | null;
  ip: string | null;
  userAgent: string | null;
}

/**
 * Hono context environment shared by every route, on every runtime:
 * `db` and `services` are set by createApp's bootstrap middleware,
 * `adminId` by the auth middleware.
 */
export interface AppEnv {
  Variables: {
    adminId: number;
    db: Database;
    services: Services;
  };
}