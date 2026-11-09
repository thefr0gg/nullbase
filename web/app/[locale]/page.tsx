import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card } from "@/app/_components/ui";
import type { BadgeColor } from "@/app/_components/ui";
import { getSidebarTree, slugToHref, type SidebarNode } from "@/lib/content/meta";
import { SITE_NAME } from "@/lib/site";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { format, pluralize } from "@/lib/i18n/format";
import { JsonLd } from "@/app/_components/json-ld";
import { buildWebSite } from "@/lib/seo/structured-data";
import { HeroDemoPanel } from "@/app/_components/hero-demo-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const href = slugToHref(locale, []);
  const description = getDictionary(locale).home.heroSubtext;
  // Every locale's homepage always exists (unlike content pages, which may
  // not yet be translated) — every locale gets an hreflang entry.
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = slugToHref(l, []);
  languages["x-default"] = slugToHref(defaultLocale, []);

  return {
    // No explicit `title` here — the layout's `metadata.title.default`
    // ("nullbase — developer reference") applies as-is for the homepage;
    // setting an explicit string here would additionally run it through
    // the layout's `"%s · nullbase"` template and double up the brand name.
    description,
    alternates: {
      canonical: href,
      languages,
    },
    openGraph: {
      title: "nullbase — developer reference",
      description,
      url: href,
      siteName: SITE_NAME,
      type: "website",
      locale,
    },
    twitter: {
      card: "summary",
      title: "nullbase — developer reference",
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const CARD_ACCENTS: { badge: BadgeColor; shadow: string; hoverText: string }[] = [
  { badge: "blue", shadow: "shadow-[8px_8px_0_0_var(--color-electric-blue)]", hoverText: "group-hover:text-electric-blue" },
  { badge: "purple", shadow: "shadow-[8px_8px_0_0_var(--color-violet)]", hoverText: "group-hover:text-violet" },
  { badge: "orange", shadow: "shadow-[8px_8px_0_0_var(--color-tangerine)]", hoverText: "group-hover:text-tangerine" },
  { badge: "green", shadow: "shadow-[8px_8px_0_0_var(--color-teal)]", hoverText: "group-hover:text-teal" },
];

function countPages(node: SidebarNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countPages(child), 0);
}

// Direct subtopics only (e.g. HTTP, DNS, TLS under Web Fundamentals) — not a
// walk into their own children, which would surface a subtopic's internal
// pages (Fundamentals, Methods, Headers...) instead of sibling subtopics.
function quickLinks(node: SidebarNode, limit = 5): SidebarNode[] {
  return node.children.slice(0, limit);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  const roots = getSidebarTree(locale);
  const builtTitles = new Set(roots.map((r) => r.title.toLowerCase()));
  const upcoming = dict.home.plannedCategories.filter(
    (name) => !builtTitles.has(name.toLowerCase()),
  );

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd data={buildWebSite(locale)} />
      <header className="hero-grid-bg flex flex-wrap items-center gap-12 py-6">
        <div className="flex min-w-0 flex-1 basis-[32rem] flex-col gap-5">
          <h1 className="flex max-w-2xl flex-wrap items-baseline gap-x-2.5 gap-y-1 font-heading text-5xl font-extrabold tracking-[-0.04em] text-text-primary sm:text-6xl">
            <span>{dict.home.heroLead}</span>
            <code className="rounded-md bg-[color-mix(in_oklch,var(--color-electric-blue)_14%,var(--surface))] px-2 py-0.5 font-mono text-electric-blue">
              {dict.home.heroCode}
            </code>
          </h1>
          <p className="max-w-xl text-lg text-text-secondary">{dict.home.heroSubtext}</p>
          {roots.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={roots[0].href}
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-text-primary bg-electric-blue px-4 py-2 text-sm font-semibold text-[#0a0a0c] shadow-[4px_4px_0_0_var(--shadow-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--shadow-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                {format(dict.home.startWith, { topic: roots[0].title })}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <span className="text-sm text-text-secondary">
                {pluralize(
                  locale,
                  roots.reduce((sum, r) => sum + countPages(r), 0),
                  dict.home.pagesAndCounting,
                )}
              </span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 basis-80 justify-center">
          <HeroDemoPanel dict={dict.heroDemo} />
        </div>
      </header>

      {roots.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">
              {dict.home.browseByTopic}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roots.map((node, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              const links = quickLinks(node);
              const total = countPages(node) - 1;
              return (
                <Card
                  key={node.href}
                  variant="feature"
                  className={`flex flex-col gap-4 border-text-primary ${accent.shadow}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={node.href} className="group">
                        <h3 className={`font-heading text-xl font-bold text-text-primary ${accent.hoverText}`}>
                          {node.title}
                        </h3>
                      </Link>
                      {node.description && (
                        <p className="mt-1.5 text-sm text-text-secondary">
                          {node.description}
                        </p>
                      )}
                    </div>
                    {total > 0 && (
                      <Badge color={accent.badge} className="shrink-0">
                        {pluralize(locale, total, dict.home.pageCount)}
                      </Badge>
                    )}
                  </div>

                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-electric-blue/40 hover:text-electric-blue"
                        >
                          {link.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={node.href}
                    className="inline-flex w-fit items-center gap-1 text-sm font-medium text-electric-blue hover:underline"
                  >
                    {format(dict.home.explore, { topic: node.title })}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">
            {dict.home.comingSoon}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {upcoming.map((name) => (
              <span
                key={name}
                className="rounded-full border border-dashed border-border px-3.5 py-2 text-sm text-text-secondary"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
