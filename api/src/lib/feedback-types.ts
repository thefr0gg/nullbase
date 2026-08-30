/**
 * The single-select category a feedback submitter can attach to describe
 * what's wrong with a page (or that it's a suggestion). Canonical list —
 * `web/lib/feedback-types.ts` mirrors these exact values with display
 * labels for the frontend; keep both in sync by hand when this changes
 * (same cross-boundary-contract convention as the rest of the API/web
 * split — see the root CLAUDE.md).
 */
export const FEEDBACK_TYPES = [
  "incorrect",
  "outdated",
  "unclear",
  "incomplete",
  "language",
  "broken_example",
  "typo_grammar",
  "broken_link",
  "formatting",
  "translation",
  "suggestion",
  "other",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export function isFeedbackType(value: unknown): value is FeedbackType {
  return typeof value === "string" && (FEEDBACK_TYPES as readonly string[]).includes(value);
}
