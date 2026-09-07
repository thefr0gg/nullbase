import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content/loader";
import { slugToHref } from "@/lib/content/meta";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/lib/i18n/config";

// Required by `output: "export"` — without it, Next treats this route as
// potentially dynamic and refuses to prerender it into a static file.
export const dynamic = "force-static";

/**
 * Statically generated at build time (`output: "export"` emits this as a
 * plain `sitemap.xml` file, same as every other route). Iterates every
 * locale's content tree — each `.mdx` page under `web/content/<locale>/**`
 * is already the single source of truth for routing (see
 * `lib/content/loader.ts`), so this needs no maintenance as pages or
 * languages are added: it just walks the same per-locale page lists.
 *
 * The bare `/` isn't listed — it's a client-side redirect shell (see
 * `app/(root)/page.tsx`), not a real indexable page; each locale's own
 * homepage (`/en`, `/fr`, ...) is what should be indexed instead.
 *
 * URLs carry a trailing slash to match `trailingSlash: true`'s effect on
 * every page's real canonical link (Next normalizes `alternates.canonical`
 * to the trailing-slash form at export time, whatever `slugToHref` itself
 * returns) — without it, Search Console requests the sitemap URL, gets
 * redirected to the canonical trailing-slash form, and flags the page as
 * "page with redirect" instead of indexing it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);
  return locales.flatMap((locale) => {
    const pages = getAllPages(locale);
    return [
      {
        url: SITE_URL + withSlash(slugToHref(locale, [])),
        changeFrequency: "weekly" as const,
        priority: 1,
      },
      ...pages.map((page) => ({
        url: SITE_URL + withSlash(slugToHref(locale, page.slug)),
        changeFrequency: "weekly" as const,
        // Category landing pages (top-level, e.g. /en/web-fundamentals) rank
        // slightly above their individual leaf pages.
        priority: page.slug.length <= 1 ? 0.8 : 0.6,
      })),
    ];
  });
}
