import type { Database } from "./db/port";
import type { Services } from "./services";

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