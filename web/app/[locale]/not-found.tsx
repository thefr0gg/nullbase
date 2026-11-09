"use client";

import { usePathname } from "next/navigation";
import { NotFoundContent } from "@/app/_components/not-found-content";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Rendered for any unmatched slug under a valid `/<locale>/...` prefix (the
 * common 404 case). A client component — `not-found.tsx` isn't handed route
 * params, so the locale is read from the URL itself via `usePathname()`,
 * the same pattern `<SearchBar>`'s topic-scoping already uses. Renders
 * inside the locale layout, so it inherits the sidebar/header/theming.
 */
export default function NotFound() {
  const pathname = usePathname();
  const first = pathname.split("/").filter(Boolean)[0];
  const locale = first && isLocale(first) ? first : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <NotFoundContent homeHref={`/${locale}`} dict={dict} />
    </div>
  );
}
