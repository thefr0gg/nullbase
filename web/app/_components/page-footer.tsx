import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SidebarNode } from "@/lib/content/meta";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { PageActions } from "./page-actions";

interface Props {
  next: SidebarNode | null;
  /** Canonical (English) page path (e.g. "/en/http/status-codes/404") used
   *  by the API — always English regardless of `locale`, so likes/feedback
   *  consolidate across translations of the same content. */
  page: string;
  /** The locale actually being viewed — recorded on feedback submissions
   *  separately from `page`, since `page` alone no longer says which
   *  translation a report is about. */
  locale: Locale;
  nextLabel: string;
  dict: Dictionary["pageActions"];
}

/**
 * Bottom-of-page engagement box: one bordered container holding the "Next"
 * card (full width) and, below it, the interactive Like + Feedback cards
 * side by side (stacked on mobile).
 */
export function PageFooter({ next, page, locale, nextLabel, dict }: Props) {
  return (
    <div className="mt-12 rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Next page card */}
        {next && (
          <Link
            href={next.href}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {nextLabel}
              </span>
              {/* Not a heading: this card is UI chrome rendered inside the
                  article, not part of the page's own content outline — a
                  real heading tag here would inject an unrelated "next page
                  title" into the document's heading hierarchy. */}
              <p className="mt-1 text-lg font-semibold text-text-primary group-hover:text-electric-blue transition-colors">
                {next.title}
              </p>
              {next.description && (
                <p className="mt-1 text-sm text-text-secondary">
                  {next.description}
                </p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-electric-blue" />
          </Link>
        )}

        {/* Like + Feedback cards (wired to the API) */}
        <PageActions page={page} locale={locale} dict={dict} />
      </div>
    </div>
  );
}