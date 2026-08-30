"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/app/_components/ui";
import type { BadgeColor } from "@/app/_components/ui";
import { DetailPanel, EyebrowLabel, SimulatedTag } from "./_shared";

/**
 * Generalizes the site's original `StatusCodeExplorer` "pick one, see
 * detail" pattern beyond HTTP status codes, and covers side-by-side
 * comparisons and glossaries via `layout` instead of being separate
 * components — they're all the same underlying shape: a small list of
 * items, each with the same kind of detail.
 */

export interface ItemExplorerItem {
  id: string;
  label: string;
  color?: BadgeColor;
  /** Shown in the detail panel (pills/grid) when this item is selected/open. */
  detail?: ReactNode;
  /** Extra cells rendered when layout="table", keyed by `tableColumns[].key`. */
  columns?: Record<string, ReactNode>;
}

// Tailwind needs literal class strings to scan for, not interpolated ones —
// same lookup pattern as `ui.tsx`'s Badge and `UrlAnatomy.tsx`.
const PILL_TINT_CLASSES: Record<BadgeColor, string> = {
  default: "border-border bg-surface text-text-secondary hover:bg-border",
  blue: "border-electric-blue/25 bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/15",
  green: "border-success/25 bg-success/10 text-success hover:bg-success/15",
  red: "border-danger/25 bg-danger/10 text-danger hover:bg-danger/15",
  orange: "border-tangerine/25 bg-tangerine/10 text-tangerine hover:bg-tangerine/15",
  purple: "border-violet/25 bg-violet/10 text-violet hover:bg-violet/15",
};

const PILL_SOLID_CLASSES: Record<BadgeColor, string> = {
  default: "bg-electric-blue text-white",
  blue: "bg-electric-blue text-white",
  green: "bg-success text-white",
  red: "bg-danger text-white",
  orange: "bg-tangerine text-white",
  purple: "bg-violet text-white",
};

export interface ItemExplorerProps {
  items: ItemExplorerItem[];
  /** pills = existing status-code-style pick-one-see-detail (default);
   *  table = static side-by-side comparison (SQL vs NoSQL, TCP vs UDP...);
   *  grid = glossary cards that expand in place on click. */
  layout?: "pills" | "table" | "grid";
  defaultId?: string;
  /** Column headers for layout="table" — keys match `items[].columns`. */
  tableColumns?: { key: string; label: string }[];
  title?: string;
}

export default function ItemExplorer({
  items,
  layout = "pills",
  defaultId,
  tableColumns = [],
  title,
}: ItemExplorerProps) {
  if (layout === "table") {
    return <TableLayout items={items} columns={tableColumns} title={title} />;
  }
  if (layout === "grid") {
    return <GridLayout items={items} title={title} />;
  }
  return <PillsLayout items={items} defaultId={defaultId} title={title} />;
}

function PillsLayout({
  items,
  defaultId,
  title,
}: {
  items: ItemExplorerItem[];
  defaultId?: string;
  title?: string;
}) {
  const initialId = defaultId ?? items[0]?.id;
  const [activeId, setActiveId] = useState<string | undefined>(initialId);
  const [loading, setLoading] = useState(false);
  // Pre-populated (not undefined) so the detail panel is already visible on
  // load — otherwise one pill shows as "selected" yet nothing is displayed,
  // which reads as broken rather than as an invitation to click the others.
  const [shownId, setShownId] = useState<string | undefined>(initialId);

  async function pick(id: string) {
    // Clicking the pill that's already open closes it instead of re-running
    // the reveal — otherwise there was no way to close one at all.
    if (activeId === id && shownId === id) {
      setActiveId(undefined);
      setShownId(undefined);
      return;
    }
    setActiveId(id);
    setLoading(true);
    setShownId(undefined);
    // Brief pause so picking an item feels like it triggered a lookup —
    // pure theater, computed entirely client-side either way.
    await new Promise((resolve) => setTimeout(resolve, 250));
    setShownId(id);
    setLoading(false);
  }

  const active = items.find((i) => i.id === activeId);

  return (
    <div className="my-6 grid grid-cols-1 gap-4">
      {title && (
        <div className="flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title}
          </EyebrowLabel>
          <SimulatedTag />
        </div>
      )}
      <div className="flex min-w-0 flex-wrap gap-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isShown = shownId === item.id;
          return (
            <div
              key={item.id}
              // No `basis-0`/animated width here: a flex-wrap row never needs
              // an item to shrink below its content (items that don't fit
              // just wrap), so the collapsed state needs no explicit sizing
              // at all — it's just its natural button width. That in turn
              // means `overflow-hidden` can stay on unconditionally (nothing
              // to fight with the automatic-min-width heuristic), avoiding
              // the two-competing-transitions glitch a `basis-0 -> basis-full`
              // animation caused: closing pills briefly left an empty
              // full-width box hanging where the content had already
              // collapsed but the wrapper hadn't caught up yet.
              className={clsx(
                "overflow-hidden rounded-2xl",
                isShown && "basis-full border border-border bg-surface shadow-card",
              )}
            >
              <button
                type="button"
                onClick={() => pick(item.id)}
                disabled={loading}
                className={clsx(
                  "inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium transition-all duration-150 disabled:opacity-60",
                  isShown
                    ? "w-full justify-between px-4 py-3 text-text-primary"
                    : isActive
                      ? clsx("rounded-xl px-3.5 py-1.5 shadow-[0_4px_0_0_rgba(23,23,26,0.15)]", PILL_SOLID_CLASSES[item.color ?? "default"])
                      : clsx("rounded-xl border px-3.5 py-1.5 shadow-[0_4px_0_0_rgba(23,23,26,0.08)]", PILL_TINT_CLASSES[item.color ?? "default"]),
                )}
              >
                {isShown ? <Badge color={item.color ?? "default"}>{item.label}</Badge> : item.label}
                {item.detail && (
                  <ChevronDown className={clsx("h-3 w-3 shrink-0", isActive && !isShown ? "text-white" : "text-text-secondary")} />
                )}
              </button>
              {item.detail && (
                <div
                  className={clsx(
                    // `grid-template-columns` (even `minmax(0,1fr)`) only
                    // constrains width once the box has a *definite*
                    // available width — during the intrinsic/max-content
                    // measurement a flex item with `flex-basis:auto` needs
                    // (to size itself to its button when collapsed), 1fr
                    // tracks behave like `auto` and still take on the full
                    // unwrapped content width. `max-w-0` when collapsed is
                    // what actually zeroes its contribution to that
                    // measurement — without it, a wide-but-invisible detail
                    // block was stretching the whole pill open, forcing
                    // one-per-row wrapping even while every pill but the
                    // active one had nothing visible expanded.
                    "grid grid-cols-1 overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                    isShown ? "grid-rows-[1fr]" : "grid-rows-[0fr] max-w-0",
                  )}
                >
                  <div className="min-w-0 overflow-hidden">
                    <div className="border-t border-border px-4 pb-4 pt-3 text-sm text-text-secondary">
                      {item.detail ?? active?.detail}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableLayout({
  items,
  columns,
  title,
}: {
  items: ItemExplorerItem[];
  columns: { key: string; label: string }[];
  title?: string;
}) {
  return (
    <div className="my-6">
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title}
          </EyebrowLabel>
        </div>
      )}
      <DetailPanel className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-background/60">
              <th className="border-b border-border px-4 py-2.5 text-start text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                &nbsp;
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap border-b border-border px-4 py-2.5 text-start text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-secondary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="last:[&>td]:border-b-0">
                <td className="border-b border-border px-4 py-2.5 font-semibold text-text-primary">
                  <Badge color={item.color ?? "default"}>{item.label}</Badge>
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="border-b border-border px-4 py-2.5 text-text-primary">
                    {item.columns?.[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DetailPanel>
    </div>
  );
}

function GridLayout({ items, title }: { items: ItemExplorerItem[]; title?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="my-6 grid grid-cols-1 gap-4">
      {title && (
        <EyebrowLabel as="span" className="mb-0">
          {title}
        </EyebrowLabel>
      )}
      <div className="grid grid-flow-row-dense gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const active = openId === item.id;
          return (
            <div
              key={item.id}
              className={clsx(
                "overflow-hidden rounded-2xl border shadow-card transition-all duration-150",
                active
                  ? "border-electric-blue bg-electric-blue/5 sm:col-span-2 lg:col-span-3"
                  : "border-border bg-surface hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(active ? null : item.id)}
                aria-expanded={active}
                className="flex w-full items-center justify-between gap-2 p-4 text-start"
              >
                <Badge color={item.color ?? "default"}>{item.label}</Badge>
                {item.detail && (
                  active ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-electric-blue" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-text-secondary" />
                  )
                )}
              </button>
              {item.detail && (
                <div
                  className={clsx(
                    "grid grid-cols-1 transition-[grid-template-rows] duration-300 ease-out",
                    active ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-w-0 overflow-hidden">
                    <div className="border-t border-border px-4 pb-4 pt-3 text-sm text-text-secondary">
                      {item.detail}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
