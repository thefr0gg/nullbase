import type { Database, DbParam, DbStatement, D1Binding } from "./port";

/**
 * Production adapter: maps the Database port onto a Cloudflare D1 binding.
 * No SQL, no logic — pure delegation (the port was shaped after D1 on
 * purpose). Constructed per request in worker.ts with `env.DB`.
 */
class D1Statement implements DbStatement {
  constructor(
    private readonly binding: D1Binding,
    private readonly sql: string,
    private readonly params: DbParam[] = [],
  ) {}

  bind(...params: DbParam[]): DbStatement {
    return new D1Statement(this.binding, this.sql, params);
  }

  async all<T = Record<string, unknown>>(): Promise<T[]> {
    const result = await this.stmt().all<T>();
    return result.results;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return this.stmt().first<T>();
  }

  async run(): Promise<void> {
    await this.stmt().run();
  }

  private stmt() {
    const stmt = this.binding.prepare(this.sql);
    // D1 rejects bind() with zero arguments.
    return this.params.length > 0 ? stmt.bind(...this.params) : stmt;
  }
}

export class D1Database implements Database {
  constructor(private readonly binding: D1Binding) {}

  prepare(sql: string): DbStatement {
    return new D1Statement(this.binding, sql);
  }
}