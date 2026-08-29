import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card } from "@/app/_components/ui";
import type { BadgeColor } from "@/app/_components/ui";
import { getSidebarTree, type SidebarNode } from "@/lib/content/meta";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "nullbase — developer reference",
    description: "A fast, interactive reference for developers.",
    url: "/", // resolved against `metadataBase` -> https://nullbase.wiki/
    siteName: SITE_NAME,
    type: "website",
  },
};

// Full 15-category roadmap, in the order the site will fill it in. Anything
// already present as a root in the content tree is dropped from the "Coming
// soon" list below — this array needs no maintenance as topics land, only
// as the roadmap itself changes.
const PLANNED_CATEGORIES = [
  "Web Fundamentals",
  "Web APIs",
  "Web Platform",
  "Data & Serialization",
  "Databases",
  "Networking",
  "Security",
  "Backend",
  "DevOps & Infrastructure",
  "Developer Tools",
  "Cloudflare",
  "Programming Languages",
  "Software Architecture",
  "Operating Systems",
  "Computer Science",
];

const CARD_ACCENTS: { badge: BadgeColor; border: string }[] = [
  { badge: "blue", border: "border-t-electric-blue" },
  { badge: "purple", border: "border-t-violet" },
  { badge: "orange", border: "border-t-tangerine" },
  { badge: "green", border: "border-t-success" },
];

function countPages(node: SidebarNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countPages(child), 0);
}

// First couple of levels of quick links under a category — enough to show
// what's inside without trying to render the whole subtree on the homepage.
function quickLinks(node: SidebarNode, limit = 5): SidebarNode[] {
  const flat: SidebarNode[] = [];
  const walk = (n: SidebarNode) => {
    for (const child of n.children) {
      flat.push(child);
      if (flat.length >= limit) return;
      walk(child);
    }
  };
  walk(node);
  return flat.slice(0, limit);
}

export default function HomePage() {
  const roots = getSidebarTree();
  const builtTitles = new Set(roots.map((r) => r.title.toLowerCase()));
  const upcoming = PLANNED_CATEGORIES.filter(
    (name) => !builtTitles.has(name.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-5">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          Look it up. See it{" "}
          <code className="rounded-md bg-[color-mix(in_oklch,var(--color-electric-blue)_14%,var(--surface))] px-2 py-0.5 font-mono text-electric-blue">
            work()
          </code>
        </h1>
        <p className="max-w-xl text-lg text-text-secondary">
          Every entry pairs a plain-language explanation with something you
          can actually poke at — a request you can send, a handshake you can
          step through, a header you can build. No account, no tracking, no
          fluff.
        </p>
        {roots.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={roots[0].href}
              className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-4 py-2 text-sm font-medium text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)] transition-all hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.15)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.15)]"
            >
              Start with {roots[0].title}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-text-secondary">
              {roots.reduce((sum, r) => sum + countPages(r), 0)} pages and
              counting
            </span>
          </div>
        )}
      </header>

      {roots.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Browse by topic
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
                  className={`flex flex-col gap-4 border-t-4 ${accent.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={node.href} className="group">
                        <h3 className="text-xl font-medium text-text-primary group-hover:text-electric-blue">
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
                        {total} {total === 1 ? "page" : "pages"}
                      </Badge>
                    )}
                  </div>

                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-lg border border-border bg-background/60 px-2.5 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-electric-blue/40 hover:text-electric-blue"
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
                    Explore {node.title}
                    <ArrowRight className="h-3.5 w-3.5" />
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
            Coming soon
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {upcoming.map((name) => (
              <span
                key={name}
                className="rounded-xl border border-dashed border-border px-3.5 py-2 text-sm text-text-secondary"
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
