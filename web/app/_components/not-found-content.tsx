import Link from "next/link";
import { Home } from "lucide-react";
import { Badge } from "@/app/_components/ui";
import { EyebrowLabel, JsonBlock } from "@/components/interactive/_shared";
import type { Dictionary } from "@/lib/i18n/types";

/**
 * Shared 404 body, rendered from both `app/[locale]/not-found.tsx` (the
 * common case — a bad slug under a valid locale, with full sidebar/header
 * chrome via the locale layout) and `app/(root)/not-found.tsx` (the rare
 * case of a totally unrecognized top-level segment, with no chrome to
 * inherit from). Styled as the HTTP `404 Not Found` status it represents,
 * using the same chrome (EyebrowLabel, Badge, JsonBlock) as every
 * interactive playground on the site.
 */
export function NotFoundContent({
  homeHref,
  dict,
}: {
  homeHref: string;
  dict: Pick<Dictionary, "notFound">;
}) {
  const t = dict.notFound;
  return (
    <section className="flex flex-col items-center gap-10 py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Badge color="red">{t.badge}</Badge>
        <p
          aria-hidden="true"
          className="font-mono text-6xl font-bold leading-none text-text-primary sm:text-7xl"
        >
          4<span className="text-electric-blue">0</span>
          <span className="text-tangerine">4</span>
        </p>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">{t.heading}</h1>
        <p className="max-w-md text-text-secondary">{t.description}</p>
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface text-start shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-background/60 px-5 py-3">
          <EyebrowLabel as="span" className="mb-0">
            {t.responseLabel}
          </EyebrowLabel>
          <Badge color="red">{t.statusBadge}</Badge>
        </div>
        <div className="p-5">
          <JsonBlock
            text={JSON.stringify(
              { error: t.jsonError, message: t.jsonMessage },
              null,
              2,
            )}
          />
        </div>
      </div>

      <Link
        href={homeHref}
        className="inline-flex items-center gap-2 rounded-xl bg-electric-blue px-4 py-2 text-sm font-medium text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)] transition-all duration-150 hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.15)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.15)] focus-visible:ring-2 focus-visible:ring-electric-blue/40"
      >
        <Home className="h-4 w-4" />
        {t.backToHome}
      </Link>
    </section>
  );
}
