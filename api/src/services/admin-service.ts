import type { AdminUserRepository } from "../repositories/admin-users";
import { hashPassword, signToken, verifyPassword } from "../lib/crypto";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface LoginResult {
  ok: boolean;
  token?: string;
  admin?: { id: number; email: string; role: string };
}

export class AdminService {
  constructor(
    private readonly repo: AdminUserRepository,
    private readonly tokenSecret: string,
  ) {}

  /**
   * Verifies credentials and returns a stateless HMAC session token.
   * Deliberately returns the same `ok: false` for unknown email and wrong
   * password so the endpoint doesn't leak account existence.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.repo.findByEmail(email.trim().toLowerCase());
    if (!user) return { ok: false };
    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) return { ok: false };

    const token = await signToken({ sub: user.id, exp: 0 }, this.tokenSecret, TOKEN_TTL_SECONDS);
    return {
      ok: true,
      token,
      admin: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Used by the admin panel to validate a session against the live account. */
  async findById(id: number): Promise<{ id: number; email: string; role: string } | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role };
  }

  /** Used by `npm run db:admin` and the future admin panel bootstrap. */
  async createOrUpdateAdmin(email: string, password: string): Promise<number> {
    const { hash, salt } = await hashPassword(password);
    return this.repo.upsert({
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
    });
  }
}