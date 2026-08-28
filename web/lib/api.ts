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