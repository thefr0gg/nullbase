import Link from "next/link";
import { Badge } from "@/app/_components/ui";
import { ArrowLeft, Compass, FileQuestion } from "lucide-react";

/**
 * Custom 404 page ("Not Found"), rendered for any unmatched route or when a
 * page calls `notFound()`. Styled to match the site's developer-reference
 * theme: the error is presented as the HTTP `404 Not Found` status it
 * represents, with quick paths back into the content.
 *
 * `not-found` renders inside the root layout, so it inherits the sidebar,
 * header, and theming automatically.
 */
export default function NotFound() {
  return (
    <section className="flex flex-col gap-10 py-4">
      {/* Status code hero */}
      <header className="flex flex-col items-center text-center">
        <Badge color="red" className="mb-4">
          4xx Client error
        </Badge>
        <p
          aria-hidden="true"
          className="font-mono text-6xl font-bold leading-none text-text-primary sm:text-7xl"
        >
          4<span className="text-electric-blue">0</span>
          <span className="text-tangerine">4</span>
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-text-primary sm:text-3xl">
          Not Found
        </h1>
        <p className="mt-2 max-w-md text-text-secondary">
          The server did not find a current representation for the target
          resource — the page you&apos;re looking for doesn&apos;t exist here.
        </p>
      </header>

      {/* Styled HTTP response snippet */}
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface text-left shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-surface/60 px-4 py-2">
          <span className="font-mono text-xs text-text-secondary">
            HTTP — response
          </span>
          <FileQuestion className="h-4 w-4 text-text-secondary" />
        </div>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-text-primary">
          <span className="text-tangerine">HTTP/1.1</span>{" "}
          <span className="font-semibold text-danger">404 Not Found</span>
          {"\n"}
          Content-Type: text/html
          {"\n"}
          {"\n"}
          {"<"}h1{">"}Page not found{"<"}/h1{">"}
        </pre>
      </div>

      {/* Actions */}
      <nav
        aria-label="Useful pages"
        className="mx-auto flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-4 py-2 text-sm font-medium text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)] transition-all duration-150 hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.15)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.15)] focus-visible:ring-2 focus-visible:ring-electric-blue/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/http"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-[0_4px_0_0_rgba(23,23,26,0.08)] transition-all duration-150 hover:translate-y-[-1px] hover:bg-border hover:shadow-[0_6px_0_0_rgba(23,23,26,0.08)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.08)] focus-visible:ring-2 focus-visible:ring-electric-blue/40"
        >
          <Compass className="h-4 w-4" />
          Browse the HTTP reference
        </Link>
      </nav>
    </section>
  );
}