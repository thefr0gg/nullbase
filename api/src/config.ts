/**
 * Anti-spam rate limits for the public write endpoints.
 *
 * Enforced in the database (COUNT(*) over indexed identity columns), so the
 * exact same rules run on local SQLite and production D1 — no KV/DO needed
 * at this scale. Identities are salted hashes (see lib/crypto.ts); raw IPs
 * and user agents are never stored.
 */
export const RATE_LIMITS = {
  /** Likes per visitor identity per 24h (blocks UA/localStorage rotation). */
  likesPerVisitorPerDay: 10,
  /** Likes per network identity (IP hash) per 24h. */
  likesPerIpPerDay: 25,
  /** Feedback submissions per network identity per 24h. */
  feedbackPerIpPerDay: 5,
  /** Feedback submissions per visitor identity per hour. */
  feedbackPerVisitorPerHour: 2,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export const DAY_AGO = () => new Date(Date.now() - DAY_MS).toISOString();
export const HOUR_AGO = () => new Date(Date.now() - HOUR_MS).toISOString();

/** Seconds until the next UTC midnight (aligned with the 24h windows). */
export function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return Math.max(1, Math.ceil((midnight - now.getTime()) / 1000));
}

/** Seconds until the next UTC hour boundary (aligned with the 1h window). */
export function secondsUntilNextHour(): number {
  const now = Date.now();
  return Math.max(1, Math.ceil((HOUR_MS - (now % HOUR_MS)) / 1000));
}