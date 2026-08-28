import type { Database } from "../db/port";
import { now } from "../db/port";

/** Row shape of the admin_users table (snake_case columns). */
export interface AdminUserRow {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  role: string;
  created_at: string;
}

const COLUMNS = "id, email, password_hash, password_salt, role, created_at";

export class AdminUserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<AdminUserRow | null> {
    return this.db
      .prepare(`SELECT ${COLUMNS} FROM admin_users WHERE email = ?`)
      .bind(email)
      .first<AdminUserRow>();
  }

  async findById(id: number): Promise<AdminUserRow | null> {
    return this.db
      .prepare(`SELECT ${COLUMNS} FROM admin_users WHERE id = ?`)
      .bind(id)
      .first<AdminUserRow>();
  }

  async upsert(input: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<number> {
    await this.db
      .prepare(
        `INSERT INTO admin_users (email, password_hash, password_salt, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           password_hash = excluded.password_hash,
           password_salt = excluded.password_salt`,
      )
      .bind(input.email, input.passwordHash, input.passwordSalt, now())
      .run();
    const row = await this.findByEmail(input.email);
    return row!.id;
  }
}