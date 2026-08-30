import type { AdminUserRepository } from "../repositories/admin-users";
import type { AdminSessionRepository } from "../repositories/admin-sessions";
import { generateRefreshToken, hashPassword, hashRefreshToken, signAccessToken, verifyPassword } from "../lib/crypto";
import { now } from "../db/port";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes — short-lived, kept in memory client-side
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days — httpOnly cookie, rotated on every refresh

export interface AdminIdentity {
  id: number;
  email: string;
  role: string;
}

export interface AuthResult {
  accessToken: string;
  /** Raw refresh token — the route sets this as the httpOnly cookie value; never stored raw. */
  refreshToken: string;
  refreshTokenExpiresAt: string;
  admin: AdminIdentity;
}

export interface LoginResult {
  ok: boolean;
  auth?: AuthResult;
}

export interface RefreshResult {
  ok: boolean;
  auth?: AuthResult;
}

export interface SessionSummary {
  id: number;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  /** True for the session the calling request's own refresh cookie belongs to. */
  current: boolean;
}

export class AdminService {
  constructor(
    private readonly repo: AdminUserRepository,
    private readonly sessions: AdminSessionRepository,
    private readonly tokenSecret: string,
  ) {}

  /**
   * Verifies credentials and issues a new session (access JWT + a fresh
   * refresh token, persisted as a new admin_sessions row). Deliberately
   * returns the same `ok: false` for unknown email and wrong password so
   * the endpoint doesn't leak account existence.
   */
  async login(email: string, password: string, userAgent: string | null): Promise<LoginResult> {
    const user = await this.repo.findByEmail(email.trim().toLowerCase());
    if (!user) return { ok: false };
    const valid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!valid) return { ok: false };

    const auth = await this.issueSession(
      { id: user.id, email: user.email, role: user.role },
      userAgent,
    );
    return { ok: true, auth };
  }

  /**
   * Exchanges a refresh token for a new session, rotating it (the old
   * session row is revoked, a new one is created). Reusing an
   * already-rotated-away token is treated as a theft signal — every
   * session for that admin is revoked rather than just rejecting the one
   * token, since a legitimate client would never present a token it has
   * already been rotated off of.
   */
  async refresh(refreshToken: string, userAgent: string | null): Promise<RefreshResult> {
    const hash = await hashRefreshToken(refreshToken);
    const session = await this.sessions.findByHash(hash);
    if (!session) return { ok: false };

    if (session.revoked_at) {
      await this.sessions.revokeAllForAdmin(session.admin_id);
      return { ok: false };
    }
    if (session.expires_at <= now()) return { ok: false };

    const user = await this.repo.findById(session.admin_id);
    if (!user) return { ok: false };

    await this.sessions.revoke(session.id);
    const auth = await this.issueSession(
      { id: user.id, email: user.email, role: user.role },
      userAgent,
    );
    return { ok: true, auth };
  }

  /** Revokes exactly the session the presented refresh token belongs to. */
  async logout(refreshToken: string): Promise<void> {
    const hash = await hashRefreshToken(refreshToken);
    const session = await this.sessions.findByHash(hash);
    if (session) await this.sessions.revoke(session.id);
  }

  /** Used by the admin panel to validate a session against the live account. */
  async findById(id: number): Promise<AdminIdentity | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role };
  }

  /** Used by `npm run db:admin` and the admin panel bootstrap. */
  async createOrUpdateAdmin(email: string, password: string): Promise<number> {
    const { hash, salt } = await hashPassword(password);
    return this.repo.upsert({
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
    });
  }

  /** Active (non-revoked, non-expired) sessions for the "manage devices" UI. */
  async listSessions(adminId: number, currentRefreshToken: string | null): Promise<SessionSummary[]> {
    const currentHash = currentRefreshToken ? await hashRefreshToken(currentRefreshToken) : null;
    const rows = await this.sessions.listActive(adminId);
    return rows.map((row) => ({
      id: row.id,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
      current: currentHash !== null && row.refresh_token_hash === currentHash,
    }));
  }

  /** Revoke one session by id — ownership-checked against the calling admin. */
  async revokeSession(adminId: number, sessionId: number): Promise<boolean> {
    const row = await this.sessions.findByIdForAdmin(sessionId, adminId);
    if (!row) return false;
    await this.sessions.revoke(sessionId);
    return true;
  }

  private async issueSession(admin: AdminIdentity, userAgent: string | null): Promise<AuthResult> {
    const accessToken = await signAccessToken(admin.id, this.tokenSecret, ACCESS_TOKEN_TTL_SECONDS);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString();
    await this.sessions.create({
      adminId: admin.id,
      refreshTokenHash,
      userAgent,
      expiresAt: refreshTokenExpiresAt,
    });
    return { accessToken, refreshToken, refreshTokenExpiresAt, admin };
  }
}
