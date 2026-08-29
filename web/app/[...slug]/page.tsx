import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { getPage, getAllSlugs, type CollectedPage } from "@/lib/content/loader";
import { getNextPage, slugToHref } from "@/lib/content/meta";
import { SITE_NAME } from "@/lib/site";
import { PageFooter } from "@/app/_components/page-footer";
import { AdUnit } from "@/components/ads/AdUnit";

// `dynamicParams = false` means only slugs returned by generateStaticParams
// are rendered — unknown paths fall through to a 404. Fast and cacheable.
// With `output: "export"` everything below runs once, at build time.
export const dynamicParams = false;

/**
 * Every content page is statically generated from the `/content` tree.
 * Adding an `.mdx` file automatically creates a prerendered route — no
 * routing code to touch. The required catch-all `[...slug]` handles every
 * path with at least one segment; `/` is served by `app/page.tsx`.
 */
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return { title: "Not found" };
  const href = slugToHref(slug);
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    alternates: {
      // Relative path — resolved against `metadataBase` (https://nullbase.wiki).
      canonical: href,
    },
    openGraph: {
      title: `${page.frontmatter.title} · nullbase`,
      description: page.frontmatter.description,
      url: href,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page: CollectedPage | null = getPage(slug);
  if (!page) notFound();

  const next = getNextPage(page.slug);
  return <ContentRenderer page={page} next={next} pagePath={slugToHref(page.slug)} />;
}

async function ContentRenderer({
  page,
  next,
  pagePath,
}: {
  page: CollectedPage;
  next: ReturnType<typeof getNextPage>;
  pagePath: string;
}) {
  // Dynamic import of the compiled `.mdx` (resolved by @next/mdx's loader).
  const mod = (await import(`../../content/${page.fileRel}.mdx`)) as {
    default: ComponentType;
  };
  const MDX = mod.default;
  return (
    <article className="mdx-prose w-full max-w-none break-words">
      <MDX />
      {/* Single non-intrusive ad per content page — sits after the body, above
          the next-page footer, so it never interrupts reading. */}
      <AdUnit />
      <PageFooter next={next} page={pagePath} />
    </article>
  );
}
