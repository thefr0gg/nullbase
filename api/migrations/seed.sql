-- Seed data (both local SQLite and remote D1: `npm run db:seed:remote`).
-- Guarded so it is safe to run more than once.
-- Admin accounts are NOT seeded here — use `npm run db:admin -- <email> <password>`
-- locally, or the SQL it prints with `wrangler d1 execute --remote`.

INSERT INTO feedback (page_path, rating, comment, status, created_at)
SELECT '/http/status-codes/404', 5, 'Love the live status explorer!', 'new', '2026-08-28T12:00:00.000Z'
WHERE NOT EXISTS (SELECT 1 FROM feedback);

INSERT INTO feedback (page_path, rating, comment, status, created_at)
SELECT '/http/methods/post', 3, 'Would be nice to have more request body examples.', 'new', '2026-08-28T12:05:00.000Z'
WHERE NOT EXISTS (SELECT 2 FROM feedback WHERE 1 = 0) AND (SELECT COUNT(*) FROM feedback) < 2;