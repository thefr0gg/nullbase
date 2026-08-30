import type { Metadata } from "next";
import { getPage } from "@/lib/content/loader";
import { slugToHref } from "@/lib/content/meta";
import { SITE_NAME } from "@/lib/site";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

/**
 * Shared per-page metadata builder — used by both the content catch-all
 * and the homepage, so canonical/hreflang/OpenGraph/Twitter/robots logic
 * lives in exactly one place instead of drifting between the two.
 */
export function buildPageMetadata({
  locale,
  slug,
  title,
  description,
  kind,
  index = true,
}: {
  locale: Locale;
  slug: string[];
  title: string;
  description: string;
  kind: "article" | "website";
  /** Set `false` for pages that shouldn't be indexed (e.g. an untranslated
   *  duplicate of another locale's page). */
  index?: boolean;
}): Metadata {
  const href = slugToHref(locale, slug);

  // Give search results real hierarchy context: "HTTP — Web Fundamentals"
  // rather than a bare "HTTP" that reads as ambiguous out of context. Only
  // applies when the immediate parent slug resolves to a real page — a
  // topic root (e.g. "Web Fundamentals" itself) has none, so it stays bare.
  const parent = slug.length > 0 ? getPage(locale, slug.slice(0, -1)) : null;
  const pageTitle = parent ? `${title} — ${parent.frontmatter.title}` : title;

  // Every locale's homepage (slug: []) always exists — content-page slugs
  // only get an hreflang entry for locales that actually have that page.
  const languages: Record<string, string> = {};
  for (const l of locales) {
    if (slug.length === 0 || getPage(l, slug)) languages[l] = slugToHref(l, slug);
  }
  languages["x-default"] = slugToHref(defaultLocale, slug);

  return {
    title: pageTitle,
    description,
    alternates: {
      // Relative path — resolved against `metadataBase` (https://nullbase.wiki).
      canonical: href,
      languages,
    },
    openGraph: {
      title: `${pageTitle} · ${SITE_NAME}`,
      description,
      url: href,
      siteName: SITE_NAME,
      type: kind,
      locale,
    },
    twitter: {
      // "summary" not "summary_large_image" — no OG image asset exists yet
      // to back a large card.
      card: "summary",
      title: pageTitle,
      description,
    },
    robots: {
      index,
      follow: true,
    },
  };
}
