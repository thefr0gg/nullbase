-- Admin sessions (0003)
-- Backs the JWT-access / rotating-refresh-token auth scheme: the refresh
-- token itself is an opaque, client-held, httpOnly cookie value — only its
-- SHA-256 hash is ever stored here (same hash-not-plaintext principle as
-- admin_users.password_hash), so a DB leak alone can't be replayed as a
-- session. Each row IS one device/browser session, which is what the admin
-- panel's "active sessions" view lists and revokes from.

CREATE TABLE admin_sessions (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id           INTEGER NOT NULL REFERENCES admin_users(id),
  refresh_token_hash TEXT NOT NULL UNIQUE,
  user_agent         TEXT,
  created_at         TEXT NOT NULL,
  last_used_at       TEXT NOT NULL,
  expires_at         TEXT NOT NULL,
  revoked_at         TEXT                      -- NULL while active
);

CREATE INDEX idx_admin_sessions_admin ON admin_sessions (admin_id);
CREATE INDEX idx_admin_sessions_hash  ON admin_sessions (refresh_token_hash);
