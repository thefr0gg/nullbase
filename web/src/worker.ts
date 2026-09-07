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

/**
 * True for a request that resolves to a real static file rather than a
 * page route — `/_next/*` (build chunks), and anything with a file
 * extension in its last path segment (`/favicon.ico`, `/nullbase-logo-dark.svg`,
 * `/robots.txt`, `/sitemap.xml`, ...). These all live once, at the root of
 * `out/` (shared by every route tree, `public/` assets included), never
 * under `out/admin/...` — rewriting them would 404. Real page routes never
 * match this: `trailingSlash: true` means every route is a directory
 * (`/foo/index.html`), never a bare dotted filename.
 */
function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return lastSegment.includes(".");
}

const worker = {
  async fetch(request: Request, env: { ASSETS: AssetsBinding }): Promise<Response> {
    const url = new URL(request.url);

    // `www.nullbase.wiki` is bound as its own custom domain (wrangler.jsonc)
    // pointing at this same Worker/asset build, so it was silently serving
    // an exact duplicate of every page at a different host — no canonical
    // pointed at it, but Google still crawled it, found (in its eyes) 800+
    // duplicate/non-canonical URLs, and reported them as not indexed.
    // Redirecting to the apex consolidates everything onto the one host
    // every canonical/sitemap URL already uses.
    if (url.hostname === "www.nullbase.wiki") {
      url.hostname = "nullbase.wiki";
      return Response.redirect(url.toString(), 301);
    }

    if (
      url.hostname === "admin.nullbase.wiki" &&
      !isStaticAsset(url.pathname) &&
      !url.pathname.startsWith("/admin")
    ) {
      url.pathname = `/admin${url.pathname}`;
      request = new Request(url, request);
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
