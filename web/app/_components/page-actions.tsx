"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, Star, ThumbsUp, X } from "lucide-react";
import { ApiError, getPageLikes, likePage, submitFeedback } from "@/lib/api";
import { useHasMounted } from "@/lib/use-has-mounted";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/feedback-types";
import { pluralize, format } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import { Button, Card } from "./ui";

/**
 * Interactive bottom-of-page cards: "Like this page" + "Feedback".
 *
 * Client component (the only interactive part of the page footer). Every
 * failure mode degrades gracefully: timeouts, API downtime and rate limits
 * surface as inline messages with a manual retry — never auto-retry loops,
 * never a broken page.
 */

type Dict = Dictionary["pageActions"];

// localStorage guards (private mode / blocked storage must not break the page)
function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function writeFlag(key: string, value: boolean): void {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* ignored by design */
  }
}

/**
 * Countdown-based cooldown, started from a server `Retry-After` duration.
 * `active` drives disabling the like/feedback controls; `secondsLeft` drives
 * the human-readable countdown — both derived from state, never from a raw
 * `Date.now()` read during render (which the previous implementation did,
 * and which also let a stray "Retry" button ignore the cooldown entirely).
 */
function useCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const active = secondsLeft > 0;

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const start = useCallback((seconds: number) => {
    // Cap the displayed cooldown at 1h even for the 24h daily caps — a
    // day-long disabled button reads as broken. The server remains the
    // source of truth: if the window hasn't actually reset, the next
    // attempt just gets a fresh 429 and restarts the cooldown.
    setSecondsLeft(Math.min(Math.max(1, Math.ceil(seconds)), 60 * 60));
  }, []);

  return { secondsLeft, active, start };
}

function cooldownLabel(seconds: number, dict: Dict["cooldown"]): string {
  if (seconds >= 60) {
    return format(dict.minutes, { m: Math.ceil(seconds / 60) });
  }
  return format(dict.seconds, { s: seconds });
}

export function PageActions({ page, locale, dict }: { page: string; locale: string; dict: Dict }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LikeCard page={page} locale={locale} dict={dict.like} cooldownDict={dict.cooldown} />
      <FeedbackCard page={page} locale={locale} dict={dict} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Like card
// ---------------------------------------------------------------------------

function LikeCard({
  page,
  locale,
  dict,
  cooldownDict,
}: {
  page: string;
  locale: string;
  dict: Dict["like"];
  cooldownDict: Dict["cooldown"];
}) {
  const [count, setCount] = useState<number | null>(null); // null = loading
  const [liked, setLiked] = useState(() => readFlag(`nullbase:liked:${page}`));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldown = useCooldown();

  // Initial load: server count (the liked flag is read lazily above so it's
  // correct on the very first render, per page).
  useEffect(() => {
    const ac = new AbortController();
    getPageLikes(page, ac.signal)
      .then(setCount)
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setCount(null);
      });
    return () => ac.abort();
  }, [page]);

  const like = useCallback(async () => {
    if (busy || liked || cooldown.active) return;
    setBusy(true);
    setError(null);
    const previousCount = count;
    const wasLiked = liked;
    // Optimistic update; reverted below if the API disagrees.
    setCount((c) => (c ?? 0) + 1);
    setLiked(true);
    writeFlag(`nullbase:liked:${page}`, true);
    try {
      const result = await likePage(page);
      setCount(result.count);
      setLiked(true);
      writeFlag(`nullbase:liked:${page}`, true);
    } catch (e) {
      setCount(previousCount);
      setLiked(wasLiked);
      writeFlag(`nullbase:liked:${page}`, wasLiked);
      if (e instanceof ApiError && e.status === 429) {
        cooldown.start(e.retryAfterSeconds ?? 60);
      }
      setError(e instanceof ApiError ? e.message : dict.genericError);
    } finally {
      setBusy(false);
    }
  }, [busy, liked, count, page, cooldown, dict.genericError]);

  const retry = useCallback(() => {
    // Rate-limited failures must wait out the cooldown like any other like
    // attempt — this used to bypass it entirely, letting a spammable
    // "Retry" link hammer the endpoint through a 429 loop.
    if (cooldown.active) return;
    setError(null);
    if (liked) {
      // The like itself succeeded earlier — just refresh the count.
      getPageLikes(page)
        .then(setCount)
        .catch(() => setError(dict.retryError));
    } else {
      void like();
    }
  }, [liked, like, page, cooldown.active, dict.retryError]);

  const disabled = busy || liked || cooldown.active;

  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Button
        variant={liked ? "primary" : "secondary"}
        onClick={like}
        disabled={disabled}
        aria-pressed={liked}
        className="w-full sm:w-auto"
      >
        <ThumbsUp className="h-4 w-4" />
        {liked ? dict.liked : cooldown.active ? cooldownLabel(cooldown.secondsLeft, cooldownDict) : dict.like}
      </Button>
      <p className="text-sm tabular-nums text-text-secondary" aria-live="polite">
        {count === null ? dict.loadingCount : pluralize(locale, count, dict.countSuffix)}
      </p>
      {error && (
        <p className="text-xs text-danger" aria-live="polite">
          {error}{" "}
          {!cooldown.active && (
            <button
              type="button"
              onClick={retry}
              className="font-medium underline underline-offset-2 hover:text-electric-blue"
            >
              {dict.retry}
            </button>
          )}
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feedback card
// ---------------------------------------------------------------------------

type FeedbackState = "idle" | "sending" | "sent" | "error";

function FeedbackCard({ page, locale, dict }: { page: string; locale: string; dict: Dict }) {
  const t = dict.feedback;
  const [open, setOpen] = useState(false);
  const [alreadySent, setAlreadySent] = useState(() => readFlag(`nullbase:sent-feedback:${page}`));
  const [rating, setRating] = useState<number | null>(null);
  const [type, setType] = useState<FeedbackType | "">("");
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FeedbackState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cooldown = useCooldown();

  const commentWordCount = comment.trim() ? comment.trim().split(/\s+/).filter(Boolean).length : 0;

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      // Previously missing entirely: a 429 here left the form fully
      // resubmittable, so a rejected submission could just be retried
      // immediately in a loop.
      if (cooldown.active) return;
      if (rating == null && comment.trim() === "") {
        setState("error");
        setErrorMsg(t.ratingOrCommentRequired);
        return;
      }
      if (commentWordCount > 1000) {
        setState("error");
        setErrorMsg(t.commentTooLong);
        return;
      }
      setState("sending");
      setErrorMsg(null);
      try {
        await submitFeedback({
          page,
          rating: rating ?? undefined,
          comment: comment.trim() || undefined,
          email: email.trim() || undefined,
          type: type || undefined,
          locale,
        });
        setState("sent");
        setAlreadySent(true);
        writeFlag(`nullbase:sent-feedback:${page}`, true);
      } catch (err) {
        setState("error");
        if (err instanceof ApiError && err.status === 429) {
          cooldown.start(err.retryAfterSeconds ?? 60);
          setErrorMsg(err.message);
        } else {
          setErrorMsg(err instanceof ApiError ? err.message : t.genericError);
        }
      }
    },
    [page, locale, rating, type, comment, email, commentWordCount, cooldown, t],
  );

  const mounted = useHasMounted();

  if (state === "sent" || alreadySent) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="inline-flex items-center rounded-lg bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
          {t.thanksBadge}
        </span>
        <p className="text-sm text-text-secondary">{t.thanksBody}</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          {t.openButton}
        </Button>
        <p className="text-xs text-text-secondary">{t.openSubtitle}</p>
      </Card>

      {/* Portaled to <body> and rendered as a fixed-position overlay instead
          of swapping the card's own content — otherwise the small button
          card would grow into a full form in place, which on a narrow
          mobile layout pushes everything below it down awkwardly. */}
      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <Card className="relative max-h-[90vh] w-full max-w-md overflow-y-auto p-6 text-start shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{t.modalTitle}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.close}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={submit} className="grid gap-3">
                <div className="flex items-center gap-1" role="radiogroup" aria-label={t.ratingAriaLabel}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={pluralize(locale, n, t.starAriaLabel)}
                      onClick={() => setRating(rating === n ? null : n)}
                      className="cursor-pointer rounded-md p-1 transition-colors hover:bg-electric-blue/10"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          rating != null && n <= rating
                            ? "fill-tangerine text-tangerine"
                            : "text-text-secondary"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ms-2 text-xs text-text-secondary">
                    {rating ? format(t.ratingValue, { rating }) : t.ratingOptional}
                  </span>
                </div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType | "")}
                  aria-label={t.typeAriaLabel}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
                >
                  <option value="">{t.typePlaceholder}</option>
                  {FEEDBACK_TYPES.map((ft) => (
                    <option key={ft} value={ft}>
                      {dict.feedbackTypes[ft]}
                    </option>
                  ))}
                </select>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    if (nextValue.trim().split(/\s+/).filter(Boolean).length <= 1000) {
                      setComment(nextValue);
                    }
                  }}
                  rows={4}
                  maxLength={2000}
                  placeholder={t.commentPlaceholder}
                  className="max-h-80 w-full max-w-full resize-y rounded-xl border border-border bg-background p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
                <div className="flex items-center justify-between text-[11px] text-text-secondary">
                  <span>{t.wordCountLabel}</span>
                  <span>{format(t.wordCountSuffix, { count: commentWordCount })}</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
                {errorMsg && (
                  <p className="text-xs text-danger" aria-live="polite">
                    {errorMsg}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={state === "sending" || cooldown.active}
                  >
                    {state === "sending"
                      ? t.sending
                      : cooldown.active
                        ? cooldownLabel(cooldown.secondsLeft, dict.cooldown)
                        : errorMsg
                          ? t.retry
                          : t.send}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      setErrorMsg(null);
                      setState("idle");
                    }}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </Card>
          </div>,
          document.body,
        )}
    </>
  );
}
