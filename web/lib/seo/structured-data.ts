import { getPage } from "@/lib/content/loader";
import { slugToHref } from "@/lib/content/meta";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { CollectedPage } from "@/lib/content/schema";

/**
 * schema.org structured data. Built entirely from data the site already
 * has (slug, frontmatter, sidebar ancestry) — nothing here is hand-authored
 * per page, so it stays correct automatically as pages are added.
 */

/** Home, then every ancestor of `slug` that resolves to a real page, each
 *  with a locale-correct URL — mirrors the sidebar hierarchy exactly. */
export function buildBreadcrumbList(locale: Locale, slug: string[]) {
  const items: { name: string; url: string }[] = [
    { name: "Home", url: `${SITE_URL}${slugToHref(locale, [])}` },
  ];
  for (let i = 1; i <= slug.length; i++) {
    const ancestorSlug = slug.slice(0, i);
    const page = getPage(locale, ancestorSlug);
    if (!page) continue;
    items.push({
      name: page.frontmatter.title,
      url: `${SITE_URL}${slugToHref(locale, ancestorSlug)}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** A reference/documentation page — schema.org's `TechArticle` is the
 *  specific subtype for exactly this kind of content. */
export function buildTechArticle(locale: Locale, page: CollectedPage, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.frontmatter.title,
    description: page.frontmatter.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** Used once, on the homepage — not repeated on every content page. */
export function buildWebSite(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}${slugToHref(locale, [])}`,
    inLanguage: locale,
  };
}
