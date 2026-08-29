import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { Badge } from "@/app/_components/ui";
import { getSidebarTree } from "@/lib/content/meta";
import { EyebrowLabel, JsonBlock } from "@/components/interactive/_shared";

/**
 * Custom 404 page ("Not Found"), rendered for any unmatched route or when a
 * page calls `notFound()`. Styled to match the site's developer-reference
 * theme: the error is presented as the HTTP `404 Not Found` status it
 * represents, using the same chrome (EyebrowLabel, Badge, JsonBlock) as
 * every interactive playground on the site, plus a live list of top-level
 * topics pulled from the real content tree instead of one hardcoded guess.
 *
 * `not-found` renders inside the root layout, so it inherits the sidebar,
 * header, and theming automatically.
 */
export default function NotFound() {
  const roots = getSidebarTree();

  return (
    <section className="flex flex-col items-center gap-10 py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Badge color="red">4xx Client Error</Badge>
        <p
          aria-hidden="true"
          className="font-mono text-6xl font-bold leading-none text-text-primary sm:text-7xl"
        >
          4<span className="text-electric-blue">0</span>
          <span className="text-tangerine">4</span>
        </p>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          Not Found
        </h1>
        <p className="max-w-md text-text-secondary">
          The server did not find a current representation for the target
          resource — the page you&apos;re looking for doesn&apos;t exist here.
        </p>
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface text-left shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-background/60 px-5 py-3">
          <EyebrowLabel as="span" className="mb-0">
            Response
          </EyebrowLabel>
          <Badge color="red">404 Not Found</Badge>
        </div>
        <div className="p-5">
          <JsonBlock
            text={JSON.stringify(
              { error: "Not Found", message: "No page matches this URL." },
              null,
              2,
            )}
          />
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-4 py-2 text-sm font-medium text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)] transition-all duration-150 hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.15)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.15)] focus-visible:ring-2 focus-visible:ring-electric-blue/40"
      >
        <Home className="h-4 w-4" />
        Back to home
      </Link>

      {roots.length > 0 && (
        <div className="w-full max-w-2xl">
          <EyebrowLabel as="p" className="mb-3 text-center">
            Or browse a topic
          </EyebrowLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {roots.map((node) => (
              <Link
                key={node.href}
                href={node.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="font-medium text-text-primary group-hover:text-electric-blue">
                  {node.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary group-hover:text-electric-blue" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
