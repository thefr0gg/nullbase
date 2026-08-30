-- Feedback categorization (0004)
-- A single-select category the submitter picks to describe what's wrong
-- with a page (or a suggestion) — nullable so existing rows and any
-- integration that doesn't send it keep working unchanged. Validated
-- app-side against api/src/lib/feedback-types.ts, same pattern as `status`
-- (a plain TEXT column, no DB-level CHECK — see 0001_init's comment on
-- `status` for why: kept consistent with how visitor_hash/ip_hash were
-- added in 0002 via a plain ALTER TABLE ADD COLUMN).

ALTER TABLE feedback ADD COLUMN type TEXT;
CREATE INDEX idx_feedback_type ON feedback (type);
