import { getAllPages } from "./loader";
import { slugToHref } from "./meta";
import { locales } from "@/lib/i18n/config";

/**
 * Maps every page's canonical href (exactly what `PageActions` sends as
 * the API's `page` — see `[locale]/[...slug]/page.tsx`'s `pagePath`) to
 * its human-readable title, so the admin panel can show "GET" instead of
 * "/en/web-fundamentals/http/methods/get" next to feedback/likes.
 *
 * Server/build-time only (walks the content tree via `node:fs` through
 * `getAllPages`) — call this from a Server Component and pass the result
 * down as a plain prop; never import it from a "use client" file.
 */
export function getPageTitleMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of locales) {
    for (const page of getAllPages(locale)) {
      map[slugToHref(locale, page.slug)] = page.frontmatter.title;
    }
  }
  return map;
}
