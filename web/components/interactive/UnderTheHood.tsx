"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";

/**
 * Progressive disclosure: a short default explanation, and a button that
 * reveals `children` (typically a `DiagramExplorer` or `StepFlow`) for a
 * reader who wants the full mechanism. Pure composition — no new visual
 * system, reuses the `grid-template-rows` 0fr/1fr expand trick already
 * established by `ItemExplorer`'s pills/grid layouts.
 */
export interface UnderTheHoodProps {
  summary: string;
  children: ReactNode;
}

export default function UnderTheHood({ summary, children }: UnderTheHoodProps) {
  const [open, setOpen] = useState(false);
  const dict = useInteractiveDict().underTheHood;

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed text-text-primary">{summary}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-text-primary shadow-[0_4px_0_0_rgba(23,23,26,0.08)] transition-all duration-150 hover:bg-background"
      >
        <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
        {open ? dict.showLess : dict.showMore}
      </button>
      <div
        className={clsx(
          "grid grid-cols-1 transition-[grid-template-rows] duration-300 ease-out",
          open ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
