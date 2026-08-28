/**
 * Random, per-browser visitor identifier for the like/feedback anti-spam.
 *
 * This is NOT a fingerprint: it is a random UUID generated once and stored in
 * localStorage. It carries no personal information, is never sent anywhere
 * except to our own API, and clearing site data simply issues a new one (the
 * server-side IP + rate-limit layers remain in effect regardless).
 */
const STORAGE_KEY = "nullbase:visitor-id";

export function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Storage unavailable (private mode, blocked) — request proceeds without
    // the header; the server's IP/UA-based layers still apply.
    return null;
  }
}