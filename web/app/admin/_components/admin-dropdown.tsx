"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export interface AdminDropdownOption {
  value: string;
  label: string;
}

/**
 * Custom-styled single-select dropdown for the admin panel — a trigger
 * button + an inline floating panel, replacing a bare native `<select>`
 * (which renders as an unstyled OS popup that clashes with the rest of the
 * app's design, especially in dark mode). Modeled on the public site's
 * `<LanguageSwitcher>` (same trigger/panel/checkmark shape), but without
 * a portal: every current use sits in plain page flow with nothing
 * clipping an absolutely-positioned panel below it.
 */
export function AdminDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: string;
  options: AdminDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
      >
        <span className="truncate">{current?.label ?? ariaLabel}</span>
        <ChevronDown className={clsx("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute start-0 top-full z-20 mt-1.5 max-h-72 w-max min-w-full overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-1.5 text-start text-xs transition-colors",
                  active ? "bg-electric-blue/10 text-electric-blue" : "text-text-primary hover:bg-background",
                )}
              >
                <span>{o.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
