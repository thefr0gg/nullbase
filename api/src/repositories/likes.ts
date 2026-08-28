import type { Database } from "../db/port";
import { now } from "../db/port";

export interface LikesRow {
  page_path: string;
  count: number;
  updated_at: string;
}

export class LikesRepository {
  constructor(private readonly db: Database) {}

  async getCount(pagePath: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT count FROM page_likes WHERE page_path = ?")
      .bind(pagePath)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }

  async hasVisitorLiked(pagePath: string, visitorHash: string): Promise<boolean> {
    const row = await this.db
      .prepare("SELECT 1 AS x FROM page_like_events WHERE page_path = ? AND visitor_hash = ?")
      .bind(pagePath, visitorHash)
      .first<{ x: number }>();
    return row !== null;
  }

  /** Rate-limit inputs: events by a visitor/network identity inside a window. */
  async countRecentByVisitor(visitorHash: string, since: string): Promise<number> {
    const row = await this.db
      .prepare(
        "SELECT COUNT(*) AS n FROM page_like_events WHERE visitor_hash = ? AND created_at > ?",
      )
      .bind(visitorHash, since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async countRecentByIp(ipHash: string, since: string): Promise<number> {
    const row = await this.db
      .prepare(
        "SELECT COUNT(*) AS n FROM page_like_events WHERE ip_hash = ? AND created_at > ?",
      )
      .bind(ipHash, since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  /**
   * Records a like. Returns false if this visitor already liked the page
   * (unique (page_path, visitor_hash) constraint — the INSERT throws on
   * duplicates for both drivers). The aggregate count is then incremented
   * atomically by SQLite itself.
   */
  async like(pagePath: string, visitorHash: string, ipHash: string): Promise<boolean> {
    try {
      await this.db
        .prepare(
          "INSERT INTO page_like_events (page_path, visitor_hash, ip_hash, created_at) VALUES (?, ?, ?, ?)",
        )
        .bind(pagePath, visitorHash, ipHash, now())
        .run();
    } catch {
      return false; // duplicate like from this visitor
    }
    await this.db
      .prepare(
        `INSERT INTO page_likes (page_path, count, updated_at) VALUES (?, 1, ?)
         ON CONFLICT(page_path) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`,
      )
      .bind(pagePath, now())
      .run();
    return true;
  }
}