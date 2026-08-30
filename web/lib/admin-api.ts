import { z } from "zod";
import { apiFetch, ApiError } from "./api";

/**
 * Admin API client. Mirrors `lib/api.ts`'s `apiFetch`/`ApiError`/zod
 * pattern (reused directly, not duplicated) with one addition: every call
 * here that touches auth uses `credentials: "include"` so the browser
 * sends/stores the API's httpOnly refresh cookie.
 *
 * The access token itself is kept **in memory only** (this module-level
 * variable), never `localStorage` — a page reload always calls
 * `adminRefresh()` once (via the httpOnly cookie) to silently re-obtain
 * one. This is what makes the refresh token immune to XSS token theft:
 * it's never reachable from JS at all.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

function setAccessToken(token: string | null): void {
  accessToken = token;
}

const adminIdentitySchema = z.object({
  id: z.number().int(),
  email: z.string(),
  role: z.string(),
});
export type AdminIdentity = z.infer<typeof adminIdentitySchema>;

const authResponseSchema = z.object({
  accessToken: z.string(),
  admin: adminIdentitySchema,
});

export async function adminLogin(email: string, password: string): Promise<AdminIdentity> {
  const data = authResponseSchema.parse(
    await apiFetch<unknown>("/v1/admin/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
    }),
  );
  setAccessToken(data.accessToken);
  return data.admin;
}

/** Silently exchanges the httpOnly refresh cookie for a new access token.
 *  Returns `null` (never throws) when there's no valid session — callers
 *  redirect to `/admin/login` in that case. */
export async function adminRefresh(): Promise<AdminIdentity | null> {
  try {
    const data = authResponseSchema.parse(
      await apiFetch<unknown>("/v1/admin/refresh", {
        method: "POST",
        credentials: "include",
      }),
    );
    setAccessToken(data.accessToken);
    return data.admin;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await apiFetch("/v1/admin/logout", { method: "POST", credentials: "include" });
  } finally {
    setAccessToken(null);
  }
}

/**
 * Authenticated fetch wrapper: attaches the in-memory access token, and on
 * a 401 (expired access token — the common case, given its 15-minute TTL)
 * attempts exactly one silent refresh + retry before giving up. Throws
 * `ApiError` on final failure; the admin UI treats that as "not logged
 * in" and redirects to `/admin/login`.
 */
async function adminApiFetch<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  try {
    return await apiFetch<T>(path, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${accessToken ?? ""}` },
    });
  } catch (e) {
    if (!isRetry && e instanceof ApiError && e.status === 401) {
      const refreshed = await adminRefresh();
      if (refreshed) return adminApiFetch<T>(path, init, true);
    }
    throw e;
  }
}

export async function adminMe(): Promise<AdminIdentity> {
  return adminIdentitySchema.parse(await adminApiFetch<unknown>("/v1/admin/me"));
}

// --- Feedback ---------------------------------------------------------------

const feedbackRowSchema = z.object({
  id: z.number().int(),
  page_path: z.string(),
  rating: z.number().int().nullable(),
  comment: z.string().nullable(),
  email: z.string().nullable(),
  status: z.enum(["new", "resolved", "dismissed"]),
  created_at: z.string(),
});
export type FeedbackRow = z.infer<typeof feedbackRowSchema>;

const feedbackListSchema = z.object({
  items: z.array(feedbackRowSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
export type FeedbackList = z.infer<typeof feedbackListSchema>;

export async function adminListFeedback(options: {
  status?: "new" | "resolved" | "dismissed";
  page?: string;
  limit?: number;
  offset?: number;
}): Promise<FeedbackList> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.page) params.set("page", options.page);
  params.set("limit", String(options.limit ?? 50));
  params.set("offset", String(options.offset ?? 0));
  return feedbackListSchema.parse(
    await adminApiFetch<unknown>(`/v1/admin/feedback?${params.toString()}`),
  );
}

export async function adminUpdateFeedbackStatus(
  id: number,
  status: "new" | "resolved" | "dismissed",
): Promise<void> {
  await adminApiFetch(`/v1/admin/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// --- Likes --------------------------------------------------------------

const likesRowSchema = z.object({
  page_path: z.string(),
  count: z.number().int(),
  updated_at: z.string(),
});
export type LikesRow = z.infer<typeof likesRowSchema>;

const likesListSchema = z.object({
  items: z.array(likesRowSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
export type LikesList = z.infer<typeof likesListSchema>;

export async function adminListLikes(options: { limit?: number; offset?: number } = {}): Promise<LikesList> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? 50),
    offset: String(options.offset ?? 0),
  });
  return likesListSchema.parse(await adminApiFetch<unknown>(`/v1/admin/likes?${params.toString()}`));
}

// --- Sessions ---------------------------------------------------------------

const sessionSchema = z.object({
  id: z.number().int(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  lastUsedAt: z.string(),
  current: z.boolean(),
});
export type AdminSession = z.infer<typeof sessionSchema>;

const sessionsListSchema = z.object({ items: z.array(sessionSchema) });

export async function adminListSessions(): Promise<AdminSession[]> {
  return sessionsListSchema.parse(await adminApiFetch<unknown>("/v1/admin/sessions")).items;
}

export async function adminRevokeSession(id: number): Promise<void> {
  await adminApiFetch(`/v1/admin/sessions/${id}/revoke`, { method: "POST" });
}
