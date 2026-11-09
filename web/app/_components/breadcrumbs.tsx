import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { resolveBreadcrumbTrail } from "@/lib/content/meta";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  slug: string[];
}

/**
 * Visible pill-styled breadcrumb trail above an article's H1. Previously
 * this trail only existed as invisible JSON-LD (see
 * lib/seo/structured-data.ts's buildBreadcrumbList, which shares the same
 * resolveBreadcrumbTrail helper so the two never drift apart).
 */
export function Breadcrumbs({ locale, slug }: Props) {
  const trail = resolveBreadcrumbTrail(locale, slug);
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13.5px]">
      {trail.map((entry, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={entry.href} className="flex items-center gap-2">
            {isLast ? (
              <span className="rounded-full bg-electric-blue px-2.5 py-1 font-medium text-[#0a0a0c]">
                {entry.title}
              </span>
            ) : (
              <Link
                href={entry.href}
                className="rounded-full border border-border-strong bg-background/60 px-2.5 py-1 text-text-secondary transition-colors hover:border-electric-blue hover:text-electric-blue"
              >
                {entry.title}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="h-3 w-3 shrink-0 rtl:rotate-180 text-text-secondary" aria-hidden="true" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
