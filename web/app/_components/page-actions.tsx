"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MessageSquare, Star, ThumbsUp } from "lucide-react";
import { ApiError, getPageLikes, likePage, submitFeedback } from "@/lib/api";
import { Button, Card } from "./ui";

/**
 * Interactive bottom-of-page cards: "Like this page" + "Feedback".
 *
 * Client component (the only interactive part of the page footer). Every
 * failure mode degrades gracefully: timeouts, API downtime and rate limits
 * surface as inline messages with a manual retry — never auto-retry loops,
 * never a broken page.
 */

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

export function PageActions({ page }: { page: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LikeCard page={page} />
      <FeedbackCard page={page} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Like card
// ---------------------------------------------------------------------------

function LikeCard({ page }: { page: string }) {
  const [count, setCount] = useState<number | null>(null); // null = loading
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [, setTick] = useState(0); // re-renders once per second while cooling down

  // Initial load: server count + local liked flag (both fail-safe).
  useEffect(() => {
    setLiked(readFlag(`nullbase:liked:${page}`));
    const ac = new AbortController();
    getPageLikes(page, ac.signal)
      .then(setCount)
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setCount(null);
      });
    return () => ac.abort();
  }, [page]);

  // Cooldown countdown after a 429 (button disabled until Retry-After passes).
  useEffect(() => {
    if (!cooldownUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= cooldownUntil) setCooldownUntil(0);
      else setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const like = useCallback(async () => {
    if (busy || liked) return;
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
        const ms = Math.min((e.retryAfterSeconds ?? 60) * 1000, 60 * 60 * 1000);
        setCooldownUntil(Date.now() + ms);
      }
      setError(e instanceof ApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, [busy, liked, count, page]);

  const retry = useCallback(() => {
    setError(null);
    if (liked) {
      // The like itself succeeded earlier — just refresh the count.
      getPageLikes(page)
        .then(setCount)
        .catch(() => setError("Still can't reach the server."));
    } else {
      void like();
    }
  }, [liked, like, page]);

  const cooling = Date.now() < cooldownUntil;

  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Button
        variant={liked ? "primary" : "secondary"}
        onClick={like}
        disabled={busy || liked || cooling}
        aria-pressed={liked}
        className="w-full sm:w-auto"
      >
        <ThumbsUp className="h-4 w-4" />
        {liked ? "Liked" : cooling ? "Try again later" : "Like this page"}
      </Button>
      <p className="text-sm tabular-nums text-text-secondary" aria-live="polite">
        {count === null ? "—" : count} {count === 1 ? "like" : "likes"} on this
        page
      </p>
      {error && (
        <p className="text-xs text-danger">
          {error}{" "}
          <button
            type="button"
            onClick={retry}
            className="font-medium underline underline-offset-2 hover:text-electric-blue"
          >
            Retry
          </button>
        </p>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feedback card
// ---------------------------------------------------------------------------

type FeedbackState = "idle" | "sending" | "sent" | "error";

function FeedbackCard({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FeedbackState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setAlreadySent(readFlag(`nullbase:sent-feedback:${page}`));
  }, [page]);

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (rating == null && comment.trim() === "") {
        setState("error");
        setErrorMsg("Add a rating or a short comment first.");
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
        });
        setState("sent");
        setAlreadySent(true);
        writeFlag(`nullbase:sent-feedback:${page}`, true);
      } catch (err) {
        setState("error");
        setErrorMsg(
          err instanceof ApiError
            ? err.message
            : "Something went wrong — your text is preserved, try again.",
        );
      }
    },
    [page, rating, comment, email],
  );

  if (state === "sent" || alreadySent) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="inline-flex items-center rounded-lg bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
          Thanks!
        </span>
        <p className="text-sm text-text-secondary">Your feedback has been noted.</p>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
        <p className="text-xs text-text-secondary">
          Spot a mistake? Tell us what to improve.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="grid gap-3 text-left">
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Page rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
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
          <span className="ml-2 text-xs text-text-secondary">
            {rating ? `${rating}/5` : "Rating (optional)"}
          </span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="What did you think of this page? (optional)"
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional — only if you want a reply)"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
        {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : errorMsg ? "Retry" : "Send feedback"}
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
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}