"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import clsx from "clsx";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { useHasMounted } from "@/lib/use-has-mounted";
import type { Dictionary } from "@/lib/i18n/types";

interface Props {
  currentLocale: Locale;
  /** slug (joined with "/", "" for home) -> locales that have a translation
   *  of it. Built once per request in the layout from every locale's
   *  content tree — see app/[locale]/layout.tsx. */
  localesForSlug: Record<string, Locale[]>;
  dict: Dictionary;
}

/**
 * Header language switcher. Modeled on <MobileNav>'s portal-dropdown
 * pattern for consistency: a trigger button in the header, a panel
 * portaled to `document.body` so it isn't clipped by the header's
 * `backdrop-blur` containing block.
 *
 * Clicking a locale that has a real translation of the current page jumps
 * straight to it; clicking one that doesn't falls back to that locale's
 * homepage (the "don't generate untranslated routes" decision — there is
 * no page to link to yet, so this is the honest fallback rather than a
 * dead link).
 */
export function LanguageSwitcher({ currentLocale, localesForSlug, dict }: Props) {
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
  const pathname = usePathname();
  const router = useRouter();

  // Strip the leading "/<locale>" segment to recover the page's slug.
  const segments = pathname.split("/").filter(Boolean);
  const slugKey = segments.slice(1).join("/");
  const availableIn = new Set(localesForSlug[slugKey] ?? []);

  function go(target: Locale) {
    setOpen(false);
    try {
      localStorage.setItem("preferred-locale", target);
    } catch {
      /* private mode / blocked storage — persistence is a nice-to-have */
    }
    const hasTranslation = target === currentLocale || availableIn.has(target);
    router.push(hasTranslation ? `/${target}/${slugKey}`.replace(/\/$/, "") : `/${target}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={dict.language.switchLanguage}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden text-xs font-medium uppercase sm:inline">{currentLocale}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
            <PanelAnchor>
              <div
                role="listbox"
                aria-label={dict.language.switchLanguage}
                className="w-48 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-card"
                onClick={(e) => e.stopPropagation()}
              >
                {locales.map((l) => {
                  const active = l === currentLocale;
                  const translated = l === currentLocale || availableIn.has(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => go(l)}
                      className={clsx(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors",
                        active ? "bg-electric-blue/10 text-electric-blue" : "text-text-primary hover:bg-background",
                      )}
                    >
                      <span>{localeMeta[l].label}</span>
                      {active ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : !translated ? (
                        <span className="shrink-0 text-[0.65rem] text-text-secondary">
                          {dict.language.notTranslatedYet}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </PanelAnchor>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Positions the portaled panel under the top-right header area — simple
 *  fixed placement rather than measuring the trigger's rect, since the
 *  switcher only ever lives in one place (the sticky header). */
function PanelAnchor({ children }: { children: ReactNode }) {
  return (
    <div className="absolute end-3 top-14 sm:end-6" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
