-- nullbase schema (0001_init)
-- Written for SQLite AND Cloudflare D1 (both are SQLite): no PRAGMAs, no
-- engine-specific syntax. Timestamps are ISO-8601 TEXT.
-- Applied locally by `npm run db:migrate` (better-sqlite3 runner) and to
-- production by `npm run db:migrate:remote` (wrangler d1 migrations apply).

CREATE TABLE admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,             -- PBKDF2-SHA256, base64
  password_salt TEXT NOT NULL,             -- base64
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL
);

CREATE TABLE feedback (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,                 -- e.g. "/http/status-codes/404"
  rating    INTEGER CHECK (rating BETWEEN 1 AND 5),   -- nullable
  comment   TEXT,                                     -- nullable
  email     TEXT,                                     -- optional contact
  status    TEXT NOT NULL DEFAULT 'new'
            CHECK (status IN ('new', 'resolved', 'dismissed')),
  created_at TEXT NOT NULL
);

CREATE INDEX idx_feedback_status ON feedback (status, created_at);
CREATE INDEX idx_feedback_page   ON feedback (page_path);

CREATE TABLE page_likes (
  page_path  TEXT PRIMARY KEY,
  count      INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- One row per (page, visitor): the PRIMARY KEY enforces the dedupe.
-- visitor_hash = salted SHA-256 of (ip | user-agent) — no raw IPs stored.
CREATE TABLE page_like_events (
  page_path    TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  PRIMARY KEY (page_path, visitor_hash)
);