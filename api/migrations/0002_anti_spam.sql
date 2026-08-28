-- Anti-spam hardening (0002)
-- Identity binding + rate-limit indexes. Works identically on SQLite and D1.
-- Raw IPs are NEVER stored - only salted SHA-256 hashes computed server-side
-- (hash salt = ADMIN_TOKEN_SECRET, so clients cannot precompute identities).

-- Likes: store a network-level identity for rate limiting, and index both
-- identity dimensions by time for the COUNT(*)-based limit checks.
ALTER TABLE page_like_events ADD COLUMN ip_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_like_events_ip  ON page_like_events (ip_hash, created_at);
CREATE INDEX idx_like_events_vtr ON page_like_events (visitor_hash, created_at);

-- Feedback: same identity columns + indexes for its rate limits.
ALTER TABLE feedback ADD COLUMN visitor_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE feedback ADD COLUMN ip_hash      TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_feedback_ip  ON feedback (ip_hash, created_at);
CREATE INDEX idx_feedback_vtr ON feedback (visitor_hash, created_at);