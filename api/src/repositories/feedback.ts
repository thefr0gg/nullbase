import type { Database } from "../db/port";
import { now } from "../db/port";

export interface FeedbackRow {
  id: number;
  page_path: string;
  rating: number | null;
  comment: string | null;
  email: string | null;
  status: "new" | "resolved" | "dismissed";
  created_at: string;
}

export type FeedbackStatus = FeedbackRow["status"];

export interface FeedbackInput {
  pagePath: string;
  rating?: number;
  comment?: string;
  email?: string;
  visitorHash: string;
  ipHash: string;
}

export class FeedbackRepository {
  constructor(private readonly db: Database) {}

  async insert(input: FeedbackInput): Promise<FeedbackRow> {
    await this.db
      .prepare(
        `INSERT INTO feedback (page_path, rating, comment, email, visitor_hash, ip_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.pagePath,
        input.rating ?? null,
        input.comment ?? null,
        input.email ?? null,
        input.visitorHash,
        input.ipHash,
        now(),
      )
      .run();
    const row = await this.db
      .prepare("SELECT * FROM feedback WHERE rowid = last_insert_rowid()")
      .first<FeedbackRow>();
    return row!;
  }

  /** Rate-limit inputs: submissions by a visitor/network identity in a window. */
  async countRecentByVisitor(visitorHash: string, since: string): Promise<number> {
    const row = await this.db
      .prepare(
        "SELECT COUNT(*) AS n FROM feedback WHERE visitor_hash = ? AND created_at > ?",
      )
      .bind(visitorHash, since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async countRecentByIp(ipHash: string, since: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS n FROM feedback WHERE ip_hash = ? AND created_at > ?")
      .bind(ipHash, since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async list(options: {
    status?: FeedbackStatus;
    pagePath?: string;
    limit: number;
    offset: number;
  }): Promise<FeedbackRow[]> {
    const { status, pagePath, limit, offset } = options;
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (pagePath) {
      conditions.push("page_path = ?");
      params.push(pagePath);
    }
    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const stmt = this.db.prepare(
      `SELECT * FROM feedback${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    );
    return stmt.bind(...params, limit, offset).all<FeedbackRow>();
  }

  async count(status?: FeedbackStatus, pagePath?: string): Promise<number> {
    const conditions: string[] = [];
    const params: string[] = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (pagePath) {
      conditions.push("page_path = ?");
      params.push(pagePath);
    }
    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const stmt = this.db.prepare(`SELECT COUNT(*) AS n FROM feedback${where}`);
    const row = await stmt.bind(...params).first<{ n: number }>();
    return row?.n ?? 0;
  }

  async updateStatus(id: number, status: FeedbackStatus): Promise<boolean> {
    await this.db
      .prepare("UPDATE feedback SET status = ? WHERE id = ?")
      .bind(status, id)
      .run();
    // better-sqlite3 and D1 report changes differently; re-check via select.
    const row = await this.db
      .prepare("SELECT id FROM feedback WHERE id = ?")
      .bind(id)
      .first<{ id: number }>();
    return row !== null;
  }
}