import Link from "next/link";
import { ArrowRight, ThumbsUp, MessageSquare } from "lucide-react";
import type { SidebarNode } from "@/lib/content/meta";

interface Props {
  next: SidebarNode | null;
}

/**
 * Bottom-of-page navigation + engagement row for content pages.
 *  - "Next" card links to the following page in document order.
 *  - "I like this page" and "Feedback" buttons are non-functional placeholders
 *    for now (no handlers wired up).
 */
export function PageFooter({ next }: Props) {
  return (
    <div className="mt-12 flex flex-col gap-6">
      {/* Next page card */}
      {next && (
        <Link
          href={next.href}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Next
            </span>
            <h3 className="mt-1 text-lg font-semibold text-text-primary group-hover:text-electric-blue transition-colors">
              {next.title}
            </h3>
            {next.description && (
              <p className="mt-1 text-sm text-text-secondary">
                {next.description}
              </p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-electric-blue" />
        </Link>
      )}

      {/* Like + feedback (non-functional) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="I like this page"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue"
        >
          <ThumbsUp className="h-4 w-4" />
          I like this page
        </button>
        <button
          type="button"
          aria-label="Send feedback"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-tangerine/10 hover:text-tangerine"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </button>
      </div>
    </div>
  );
}