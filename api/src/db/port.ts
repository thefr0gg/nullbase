/**
 * Database port — the ONLY database abstraction in the API.
 *
 * Business logic (services/repositories) depends exclusively on this
 * interface, never on a concrete driver. The shape mirrors Cloudflare D1's
 * prepared-statement API so the production adapter is a thin wrapper, while
 * the development adapter maps it onto better-sqlite3.
 *
 * Known port limitation: multi-statement transactions. D1 exposes `batch()`,
 * better-sqlite3 exposes synchronous transactions. Current features don't
 * need them; add `batch()` here (both adapters already could support it)
 * before writing repository code that does.
 */

export type DbParam = string | number | null;

export interface DbStatement {
  /** Returns a new statement with the params bound (the receiver is unchanged). */
  bind(...params: DbParam[]): DbStatement;
  all<T = Record<string, unknown>>(): Promise<T[]>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<void>;
}

export interface Database {
  prepare(sql: string): DbStatement;
}

/**
 * Minimal structural type of a Cloudflare D1 binding (subset the API uses).
 * `env.DB` from the D1 wrangler binding satisfies this — no credentials,
 * no connection string, auth handled by Cloudflare.
 */
export interface D1Binding {
  prepare(sql: string): {
    /** Unbound statements are directly executable AND can take params. */
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    first<T = Record<string, unknown>>(): Promise<T | null>;
    run(): Promise<void>;
    bind(...params: DbParam[]): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      first<T = Record<string, unknown>>(): Promise<T | null>;
      run(): Promise<void>;
    };
  };
}

/** ISO-8601 timestamp used consistently across tables and drivers. */
export function now(): string {
  return new Date().toISOString();
}