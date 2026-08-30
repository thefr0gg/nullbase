import { z } from "zod";
import { getVisitorId } from "./visitor";

/**
 * Single source of truth for the API base URL.
 *
 * Set `NEXT_PUBLIC_API_BASE_URL` at build time (env var or .env.* files):
 *   development: http://localhost:8787
 *   production:  https://api.nullbase.wiki (set as a Cloudflare build env var
 *                or via web/.env.production — static export inlines the value
 *                into the bundle, there is no runtime env on a static host).
 */ 
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

/** Error thrown for any failed API interaction (network, timeout, non-2xx). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 10_000;

/**
 * Hardened fetch wrapper: base URL join, JSON headers, no credentials, hard
 * 10s timeout, and typed errors. Server error messages are surfaced so the
 * widgets can show exactly why something failed (validation, rate limit...).
 */
/** Exported so `lib/admin-api.ts` reuses the same base-URL/timeout/error
 *  handling instead of duplicating a second fetch wrapper — it just passes
 *  `credentials: "include"` per-call to opt into the httpOnly refresh cookie. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "omit",
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: init?.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(TIMEOUT_MS)])
        : AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e; // unmounted
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new ApiError("The request timed out.", 0);
    }
    throw new ApiError("Could not reach the server.", 0);
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body !== null && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status}).`;
    throw new ApiError(message, res.status, Number(res.headers.get("retry-after")) || undefined);
  }
  return body as T;
}

/** The anti-spam visitor identity (random localStorage UUID — not a fingerprint). */
function visitorHeaders(): Record<string, string> {
  const id = getVisitorId();
  return id ? { "X-Visitor-Id": id } : {};
}

// --- Responses (validated before the UI trusts them) ------------------------

const likesCountSchema = z.object({ count: z.number().int().min(0) });
const likeResultSchema = z.object({
  liked: z.boolean(),
  count: z.number().int().min(0),
});
const feedbackCreatedSchema = z.object({ id: z.number().int() });

export async function getPageLikes(page: string, signal?: AbortSignal): Promise<number> {
  const data = likesCountSchema.parse(
    await apiFetch<unknown>(`/v1/likes?page=${encodeURIComponent(page)}`, { signal }),
  );
  return data.count;
}

export async function likePage(
  page: string,
): Promise<{ liked: boolean; count: number }> {
  return likeResultSchema.parse(
    await apiFetch<unknown>("/v1/likes", {
      method: "POST",
      body: JSON.stringify({ page }),
      headers: visitorHeaders(),
    }),
  );
}

export interface FeedbackInput {
  page: string;
  rating?: number;
  comment?: string;
  email?: string;
}

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  await feedbackCreatedSchema.parse(
    await apiFetch<unknown>("/v1/feedback", {
      method: "POST",
      body: JSON.stringify(input),
      headers: visitorHeaders(),
    }),
  );
}