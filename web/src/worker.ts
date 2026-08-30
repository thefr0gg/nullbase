/**
 * Custom Worker entrypoint for the "nullbase" Worker — the same Worker
 * that serves nullbase.wiki also serves admin.nullbase.wiki (see
 * wrangler.jsonc's `routes`), so they can share one static asset build
 * (`out/`) and one deploy. `run_worker_first: true` in wrangler.jsonc
 * means EVERY request passes through here before asset serving; the only
 * job is a Host-based path rewrite for the admin subdomain, then handing
 * off to the same assets binding every request already uses.
 *
 * `/admin/...` is a real route tree in the Next app (`app/admin/**`,
 * output to `out/admin/...`) — it's never linked to directly, only
 * reached via this rewrite, so the `/admin` prefix never appears in the
 * visible URL on admin.nullbase.wiki.
 */
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

const worker = {
  async fetch(request: Request, env: { ASSETS: AssetsBinding }): Promise<Response> {
    const url = new URL(request.url);
    if (
      url.hostname === "admin.nullbase.wiki" &&
      !url.pathname.startsWith("/_next/") &&
      !url.pathname.startsWith("/admin")
    ) {
      url.pathname = `/admin${url.pathname}`;
      request = new Request(url, request);
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
