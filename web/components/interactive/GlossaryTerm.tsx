"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import { glossaries } from "@/lib/glossary";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";

/**
 * Opt-in inline term explanation: `<GlossaryTerm id="tcp">TCP</GlossaryTerm>`.
 * Nothing becomes interactive automatically — an author wraps only the
 * specific mentions worth explaining. Opens on click or keyboard activation
 * (not hover-only), and fails open (renders plain `children`, no button) if
 * `id` has no entry in the current locale's glossary map — a missing
 * translation should never break the surrounding article.
 *
 * Locale is read from the URL rather than threaded through another context
 * provider: `usePathname()` already gives every client component the
 * `/{locale}/...` path this site's static export always renders under.
 */
export interface GlossaryTermProps {
  id: string;
  children: ReactNode;
}

export default function GlossaryTerm({ id, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dict = useInteractiveDict().glossary;

  const segment = pathname?.split("/")[1];
  const locale: Locale = (locales as readonly string[]).includes(segment ?? "") ? (segment as Locale) : defaultLocale;
  const entry = glossaries[locale][id];

  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded underline decoration-dotted decoration-text-secondary underline-offset-4 outline-none transition-colors hover:decoration-electric-blue focus-visible:ring-2 focus-visible:ring-electric-blue/40"
      >
        {children}
      </button>
      {open && (
        <span
          role="note"
          className="absolute start-0 top-full z-20 mt-1.5 w-64 rounded-2xl border border-border bg-surface p-3 text-sm shadow-card"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-semibold text-text-primary">{entry.term}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.closeDefinition}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
          <span className="mt-1 block text-text-secondary">{entry.definition}</span>
          {entry.href && (
            <a href={entry.href} className="mt-2 inline-block text-xs font-medium text-electric-blue hover:underline">
              {dict.learnMore} →
            </a>
          )}
        </span>
      )}
    </span>
  );
}
