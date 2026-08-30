import type { Database } from "../db/port";
import { now } from "../db/port";

/** Row shape of the admin_sessions table — one row per device/browser session. */
export interface AdminSessionRow {
  id: number;
  admin_id: number;
  refresh_token_hash: string;
  user_agent: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
}

const COLUMNS =
  "id, admin_id, refresh_token_hash, user_agent, created_at, last_used_at, expires_at, revoked_at";

export class AdminSessionRepository {
  constructor(private readonly db: Database) {}

  async create(input: {
    adminId: number;
    refreshTokenHash: string;
    userAgent: string | null;
    expiresAt: string;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO admin_sessions (admin_id, refresh_token_hash, user_agent, created_at, last_used_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(input.adminId, input.refreshTokenHash, input.userAgent, now(), now(), input.expiresAt)
      .run();
  }

  async findByHash(refreshTokenHash: string): Promise<AdminSessionRow | null> {
    return this.db
      .prepare(`SELECT ${COLUMNS} FROM admin_sessions WHERE refresh_token_hash = ?`)
      .bind(refreshTokenHash)
      .first<AdminSessionRow>();
  }

  async touch(id: number): Promise<void> {
    await this.db
      .prepare("UPDATE admin_sessions SET last_used_at = ? WHERE id = ?")
      .bind(now(), id)
      .run();
  }

  async revoke(id: number): Promise<void> {
    await this.db
      .prepare("UPDATE admin_sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL")
      .bind(now(), id)
      .run();
  }

  /** Theft-response: a rotated-away token was replayed — kill every session. */
  async revokeAllForAdmin(adminId: number): Promise<void> {
    await this.db
      .prepare("UPDATE admin_sessions SET revoked_at = ? WHERE admin_id = ? AND revoked_at IS NULL")
      .bind(now(), adminId)
      .run();
  }

  async listActive(adminId: number): Promise<AdminSessionRow[]> {
    return this.db
      .prepare(
        `SELECT ${COLUMNS} FROM admin_sessions
         WHERE admin_id = ? AND revoked_at IS NULL AND expires_at > ?
         ORDER BY last_used_at DESC`,
      )
      .bind(adminId, now())
      .all<AdminSessionRow>();
  }

  /** Ownership check for the revoke-one-session route. */
  async findByIdForAdmin(id: number, adminId: number): Promise<AdminSessionRow | null> {
    return this.db
      .prepare(`SELECT ${COLUMNS} FROM admin_sessions WHERE id = ? AND admin_id = ?`)
      .bind(id, adminId)
      .first<AdminSessionRow>();
  }
}
