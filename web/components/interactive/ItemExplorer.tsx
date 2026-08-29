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
              className={clsx(
                "rounded-2xl transition-all duration-150",
                // `overflow-hidden` must stay off the collapsed state: per spec
                // a flex item's automatic min-width (which is what lets it sit
                // at its natural content width despite `basis-0`) only applies
                // when the item's overflow is `visible` — adding it here
                // unconditionally shrank every collapsed pill to zero width.
                isShown ? "basis-full overflow-hidden border border-border bg-surface shadow-card" : "basis-0",
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
                      ? "rounded-xl bg-electric-blue px-3.5 py-1.5 text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)]"
                      : "rounded-xl border border-border bg-surface px-3.5 py-1.5 text-text-primary shadow-[0_4px_0_0_rgba(23,23,26,0.08)] hover:bg-border",
                )}
              >
                {item.label}
                {item.detail && (
                  <ChevronDown className={clsx("h-3 w-3 shrink-0", isActive && !isShown ? "text-white" : "text-text-secondary")} />
                )}
              </button>
              {item.detail && (
                <div
                  className={clsx(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isShown ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
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
              <th className="border-b border-border px-4 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                &nbsp;
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-secondary"
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
                active ? "border-electric-blue bg-electric-blue/5 sm:col-span-2 lg:col-span-3" : "border-border bg-surface hover:-translate-y-0.5",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(active ? null : item.id)}
                aria-expanded={active}
                className="flex w-full items-center justify-between gap-2 p-4 text-left"
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
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    active ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
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
