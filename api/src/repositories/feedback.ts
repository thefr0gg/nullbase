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
}

export class FeedbackRepository {
  constructor(private readonly db: Database) {}

  async insert(input: FeedbackInput): Promise<FeedbackRow> {
    await this.db
      .prepare(
        `INSERT INTO feedback (page_path, rating, comment, email, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        input.pagePath,
        input.rating ?? null,
        input.comment ?? null,
        input.email ?? null,
        now(),
      )
      .run();
    const row = await this.db
      .prepare("SELECT * FROM feedback WHERE rowid = last_insert_rowid()")
      .first<FeedbackRow>();
    return row!;
  }

  async list(options: {
    status?: FeedbackStatus;
    limit: number;
    offset: number;
  }): Promise<FeedbackRow[]> {
    const { status, limit, offset } = options;
    const base = "SELECT * FROM feedback";
    const where = status ? " WHERE status = ?" : "";
    const stmt = this.db.prepare(
      `${base}${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    );
    return status
      ? stmt.bind(status, limit, offset).all<FeedbackRow>()
      : stmt.bind(limit, offset).all<FeedbackRow>();
  }

  async count(status?: FeedbackStatus): Promise<number> {
    const stmt = this.db.prepare(
      `SELECT COUNT(*) AS n FROM feedback${status ? " WHERE status = ?" : ""}`,
    );
    const row = await (status
      ? stmt.bind(status).first<{ n: number }>()
      : stmt.first<{ n: number }>());
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