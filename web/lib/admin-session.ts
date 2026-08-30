const HINT_COOKIE = "nb_admin_hint";

/**
 * Reads the non-httpOnly hint cookie the API sets alongside the real
 * (httpOnly) refresh token on login — see `api/src/routes/admin.ts`. It
 * carries no credential, just "a session probably exists somewhere",
 * which is all the main site's navbar needs to decide whether to show the
 * admin panel link. Worst case it's stale (the refresh token expired
 * naturally) and clicking through just lands on `/admin/login`.
 */
export function hasAdminFlag(): boolean {
  try {
    return document.cookie
      .split(";")
      .some((part) => part.trim().startsWith(`${HINT_COOKIE}=`));
  } catch {
    return false;
  }
}
