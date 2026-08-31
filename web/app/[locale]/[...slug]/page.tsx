import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getPage, getAllSlugs, type CollectedPage } from "@/lib/content/loader";
import { getNextPage, slugToHref } from "@/lib/content/meta";
import { PageFooter } from "@/app/_components/page-footer";
import { JsonLd } from "@/app/_components/json-ld";
import { SITE_URL } from "@/lib/site";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { InteractiveDictProvider, type InteractiveDict } from "@/lib/i18n/step-flow-context";
import type { Dictionary } from "@/lib/i18n/types";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbList, buildTechArticle } from "@/lib/seo/structured-data";

// `dynamicParams = false` means only slugs returned by generateStaticParams
// are rendered — unknown paths fall through to a 404. Fast and cacheable.
// With `output: "export"` everything below runs once, at build time.
export const dynamicParams = false;

/**
 * Every content page is statically generated from the `/content/<locale>`
 * tree. Adding an `.mdx` file automatically creates a prerendered route — no
 * routing code to touch. Only locale x slug combinations that actually have
 * a translated file are generated — an untranslated slug in a given locale
 * simply doesn't exist as a route (see the i18n plan's "don't generate
 * untranslated routes" decision); the language switcher falls back to that
 * locale's homepage instead.
 */
export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string[] };
  const page = getPage(locale, slug);
  if (!page) return { title: "Not found" };

  return buildPageMetadata({
    locale,
    slug,
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    kind: "article",
  });
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string[] };
  const page: CollectedPage | null = getPage(locale, slug);
  if (!page) notFound();

  const dict = getDictionary(locale);
  const next = getNextPage(locale, page.slug);
  return (
    <ContentRenderer
      page={page}
      locale={locale}
      next={next}
      // Canonical (English) path, not this locale's — likes/feedback for
      // the same content should consolidate across translations instead of
      // fragmenting per locale. See <PageFooter>/<PageActions> for how the
      // actual viewing locale is still recorded on feedback separately.
      pagePath={slugToHref(defaultLocale, page.slug)}
      nextLabel={dict.pageFooter.next}
      pageActionsDict={dict.pageActions}
      interactiveDict={{
        stepFlow: dict.stepFlow,
        requestPlayground: dict.requestPlayground,
        simulated: dict.interactive.simulated,
        diagramExplorer: dict.diagramExplorer,
        stateMachine: dict.stateMachine,
        codePlayground: dict.codePlayground,
        exercise: dict.exercise,
        predictOutput: dict.predictOutput,
        terminal: dict.terminal,
        underTheHood: dict.underTheHood,
        glossary: dict.glossary,
      }}
    />
  );
}

async function ContentRenderer({
  page,
  locale,
  next,
  pagePath,
  nextLabel,
  pageActionsDict,
  interactiveDict,
}: {
  page: CollectedPage;
  locale: Locale;
  next: ReturnType<typeof getNextPage>;
  pagePath: string;
  nextLabel: string;
  pageActionsDict: Dictionary["pageActions"];
  interactiveDict: InteractiveDict;
}) {
  // Dynamic import of the compiled `.mdx` (resolved by @next/mdx's loader).
  const mod = (await import(`../../../content/${locale}/${page.fileRel}.mdx`)) as {
    default: ComponentType;
  };
  const MDX = mod.default;
  return (
    <article className="mdx-prose w-full max-w-none break-words">
      {/* The H1 is sourced from frontmatter, not hand-authored in the MDX
          body — see the SEO plan: a single source of truth keeps <title>,
          nav, breadcrumbs, and the visible H1 permanently in sync instead
          of relying on every .mdx file's leading heading matching by hand. */}
      <h1 className="mdx-h1">
        <span className="mdx-heading-text">{page.frontmatter.title}</span>
      </h1>
      <InteractiveDictProvider value={interactiveDict}>
        <MDX />
      </InteractiveDictProvider>
      <PageFooter next={next} page={pagePath} locale={locale} nextLabel={nextLabel} dict={pageActionsDict} />
      <JsonLd data={buildBreadcrumbList(locale, page.slug)} />
      <JsonLd data={buildTechArticle(locale, page, `${SITE_URL}${pagePath}`)} />
    </article>
  );
}
