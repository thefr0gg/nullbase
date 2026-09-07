import Link from "next/link";
import { Home } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

/**
 * Shared 404 body, rendered from both `app/[locale]/not-found.tsx` (the
 * common case — a bad slug under a valid locale, with full sidebar/header
 * chrome via the locale layout) and `app/(root)/not-found.tsx` (the rare
 * case of a totally unrecognized top-level segment, with no chrome to
 * inherit from). Deliberately minimal — a numeral, a short message, and a
 * way back — rather than styled as an HTTP response.
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
    <section className="flex flex-col items-center gap-6 py-20 text-center">
      <p
        aria-hidden="true"
        className="font-mono text-7xl font-bold leading-none tracking-tight text-text-primary sm:text-8xl"
      >
        4<span className="text-electric-blue">0</span>4
      </p>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">{t.heading}</h1>
        <p className="max-w-sm text-sm text-text-secondary">{t.description}</p>
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
