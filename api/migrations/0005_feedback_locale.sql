-- Feedback locale tagging (0005)
-- `page_path` on new submissions is now the canonical (English) path
-- regardless of which locale the visitor was reading, so like/feedback
-- counts consolidate across translations of the same content instead of
-- fragmenting per locale. This column records which locale the visitor was
-- actually viewing when they left feedback, so a translation-specific
-- problem (e.g. a bad Arabic translation) can still be traced to the right
-- version even though `page_path` alone no longer says so. Nullable, same
-- pattern as `type` in 0004 — plain TEXT, no CHECK, validated app-side.

ALTER TABLE feedback ADD COLUMN locale TEXT;
