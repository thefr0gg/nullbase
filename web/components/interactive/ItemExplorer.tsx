"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Badge, Button } from "@/app/_components/ui";
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
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id);
  const [loading, setLoading] = useState(false);
  const [shownId, setShownId] = useState<string | undefined>(undefined);

  async function pick(id: string) {
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
  const shown = items.find((i) => i.id === shownId);

  return (
    <div className="my-6 grid gap-4">
      {title && (
        <div className="flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title}
          </EyebrowLabel>
          <SimulatedTag />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item.id}
            onClick={() => pick(item.id)}
            disabled={loading}
            variant={activeId === item.id ? "primary" : "ghost"}
            className="text-xs"
          >
            {item.label}
          </Button>
        ))}
      </div>
      {shown && (
        <DetailPanel className="p-4 shadow-[0_12px_24px_-8px_rgba(59,130,246,0.12)]">
          <Badge color={shown.color ?? "blue"}>{shown.label}</Badge>
          <div className="mt-3">{shown.detail ?? active?.detail}</div>
        </DetailPanel>
      )}
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
    <div className="my-6">
      {title && (
        <EyebrowLabel as="span" className="mb-3">
          {title}
        </EyebrowLabel>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Badge color={item.color ?? "default"}>{item.label}</Badge>
              {open && item.detail && <div className="mt-3 text-sm text-text-secondary">{item.detail}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
