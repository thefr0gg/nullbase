import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content/loader";
import { slugToHref } from "@/lib/content/meta";
import { SITE_URL } from "@/lib/site";

// Required by `output: "export"` — without it, Next treats this route as
// potentially dynamic and refuses to prerender it into a static file.
export const dynamic = "force-static";

/**
 * Statically generated at build time (`output: "export"` emits this as a
 * plain `sitemap.xml` file, same as every other route). Content is data, not
 * code — every `.mdx` page under `web/content/**` is already the single
 * source of truth for routing (see `lib/content/loader.ts`), so this needs
 * no maintenance as pages are added: it just walks the same page list.
 *
 * URLs intentionally omit the trailing slash to match the canonical links
 * already emitted by `generateMetadata` in `app/[...slug]/page.tsx`, even
 * though `trailingSlash: true` is what the static host actually serves.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllPages();

  return [
    {
      url: SITE_URL + "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pages.map((page) => ({
      url: SITE_URL + slugToHref(page.slug),
      changeFrequency: "weekly" as const,
      // Category landing pages (top-level, e.g. /web-fundamentals) rank
      // slightly above their individual leaf pages.
      priority: page.slug.length <= 1 ? 0.8 : 0.6,
    })),
  ];
}
