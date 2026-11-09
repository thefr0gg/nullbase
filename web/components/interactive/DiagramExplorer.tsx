"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import clsx from "clsx";
import type { BadgeColor } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { DetailPanel, EyebrowLabel, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A clickable node/arrow flow — "Browser -> DNS -> DNS Server", each node
 * expandable in place to an explanation. Deliberately a simple top-to-bottom
 * stack rather than a general graph-layout engine: it covers every linear
 * process this site actually needs to show (a request's path through a
 * system, a lifecycle's stages) without requiring an author to think in
 * terms of node coordinates or edge routing, and a vertical flow reads
 * identically under RTL — nothing about "down" flips with the page
 * direction, unlike a left-to-right diagram would.
 *
 * For a process with actual branching/cyclical transitions (not just a
 * straight pipeline), use `StateMachine` instead.
 */

export interface DiagramNode {
  id: string;
  label: string;
  detail: ReactNode;
  color?: BadgeColor;
}

export interface DiagramRow {
  /** Usually one node; more than one renders side by side (a fan-out/in
   *  point in the flow, e.g. several possible next steps). */
  nodes: DiagramNode[];
  /** Optional label on the arrow leading into this row, e.g. a message name. */
  connectorLabel?: string;
}

export interface DiagramExplorerProps {
  rows: DiagramRow[];
  title?: string;
}

const NODE_TINT_CLASSES: Record<BadgeColor, string> = {
  default: "border-border bg-surface text-text-secondary hover:bg-border",
  blue: "border-electric-blue/25 bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/15",
  green: "border-success/25 bg-success/10 text-success hover:bg-success/15",
  red: "border-danger/25 bg-danger/10 text-danger hover:bg-danger/15",
  orange: "border-tangerine/25 bg-tangerine/10 text-tangerine hover:bg-tangerine/15",
  purple: "border-violet/25 bg-violet/10 text-violet hover:bg-violet/15",
};

const NODE_SOLID_CLASSES: Record<BadgeColor, string> = {
  default: "bg-electric-blue text-white",
  blue: "bg-electric-blue text-white",
  green: "bg-success text-white",
  red: "bg-danger text-white",
  orange: "bg-tangerine text-white",
  purple: "bg-violet text-white",
};

export default function DiagramExplorer({ rows, title }: DiagramExplorerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dict = useInteractiveDict().diagramExplorer;

  const selected = rows.flatMap((r) => r.nodes).find((n) => n.id === selectedId);

  return (
    <PlaygroundShell>
      <PlaygroundSection tone="muted" divider="bottom">
        <EyebrowLabel as="span" className="mb-0">
          {title ?? dict.defaultTitle}
        </EyebrowLabel>
      </PlaygroundSection>
      <PlaygroundSection>
        <div className="flex flex-col items-center gap-1">
          {rows.map((row, i) => {
            const rowHasSelection = row.nodes.some((n) => n.id === selectedId);
            return (
              <div key={i} className="flex w-full flex-col items-center gap-1">
                {i > 0 && (
                  <div className="flex flex-col items-center py-0.5 text-text-secondary">
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    {row.connectorLabel && (
                      <span className="font-mono text-[0.7rem]">{row.connectorLabel}</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {row.nodes.map((node) => {
                    const isSelected = selectedId === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedId(isSelected ? null : node.id)}
                        aria-expanded={isSelected}
                        className={clsx(
                          "rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-[0_4px_0_0_var(--shadow-ink-soft)] transition-all duration-150",
                          isSelected
                            ? clsx("border-transparent shadow-none", NODE_SOLID_CLASSES[node.color ?? "default"])
                            : NODE_TINT_CLASSES[node.color ?? "default"],
                        )}
                      >
                        {node.label}
                      </button>
                    );
                  })}
                </div>
                {rowHasSelection && selected && (
                  <DetailPanel className="mt-1 w-full max-w-md p-4 text-sm text-text-secondary">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-text-primary">{selected.label}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        {dict.closeDetail}
                      </button>
                    </div>
                    {selected.detail}
                  </DetailPanel>
                )}
              </div>
            );
          })}
        </div>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
