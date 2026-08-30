/**
 * Mirrors `api/src/lib/feedback-types.ts`'s value list exactly (kept in
 * sync by hand, same cross-workspace-contract convention as the rest of
 * the API/web split) — plus the display labels the API has no reason to
 * know about.
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

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  incorrect: "Incorrect",
  outdated: "Outdated",
  unclear: "Unclear",
  incomplete: "Incomplete",
  language: "Language",
  broken_example: "Broken example",
  typo_grammar: "Typo / grammar",
  broken_link: "Broken link",
  formatting: "Formatting",
  translation: "Translation",
  suggestion: "Suggestion",
  other: "Other",
};
