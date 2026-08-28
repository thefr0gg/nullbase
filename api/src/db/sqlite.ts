import BetterSqlite3 from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Database, DbParam, DbStatement } from "./port";

/**
 * Development adapter: maps the Database port onto better-sqlite3 against a
 * local file (api/data/nullbase.db). No SQL, no logic — pure delegation.
 */
class SqliteStatement implements DbStatement {
  constructor(
    private readonly db: BetterSqlite3.Database,
    private readonly sql: string,
    private readonly params: DbParam[] = [],
  ) {}

  bind(...params: DbParam[]): DbStatement {
    return new SqliteStatement(this.db, this.sql, params);
  }

  async all<T = Record<string, unknown>>(): Promise<T[]> {
    return this.db.prepare(this.sql).all(...this.params) as T[];
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return (this.db.prepare(this.sql).get(...this.params) as T | undefined) ?? null;
  }

  async run(): Promise<void> {
    this.db.prepare(this.sql).run(...this.params);
  }
}

export class SqliteDatabase implements Database {
  /** Exposed for the migration/seed scripts (they are infrastructure, not business logic). */
  readonly handle: BetterSqlite3.Database;

  constructor(file: string) {
    mkdirSync(path.dirname(file), { recursive: true });
    this.handle = new BetterSqlite3(file);
    this.handle.pragma("journal_mode = WAL");
  }

  prepare(sql: string): DbStatement {
    return new SqliteStatement(this.handle, sql);
  }

  close(): void {
    this.handle.close();
  }
}