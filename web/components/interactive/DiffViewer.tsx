"use client";

import { useState } from "react";
import clsx from "clsx";
import { highlightJs } from "./CodePlayground";
import { PlaygroundShell, PlaygroundSection, EyebrowLabel, WidgetBadge } from "./_shared";

/**
 * A before/after code diff, split or unified. No diff-viewer primitive
 * existed anywhere in the system before this — the line-level diff below is
 * a small LCS (longest-common-subsequence) implementation, enough for the
 * short snippets this widget is used for; nothing warrants pulling in a
 * diff library for that.
 */

export interface DiffViewerProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

type LineOp = "ctx" | "del" | "add";
interface DiffLine {
  op: LineOp;
  text: string;
}

/** Classic LCS line diff — O(n*m), fine for the handful-of-lines snippets
 *  this widget renders. Returns a flat op sequence (not grouped by hunk). */
function diffLines(beforeText: string, afterText: string): DiffLine[] {
  const a = beforeText.split("\n");
  const b = afterText.split("\n");
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: "ctx", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ op: "del", text: a[i] });
      i++;
    } else {
      out.push({ op: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ op: "del", text: a[i++] });
  while (j < m) out.push({ op: "add", text: b[j++] });
  return out;
}

/** Pairs adjacent del/add runs for the split view so removed/added lines
 *  land side by side rather than stacked — e.g. a 3-line deletion next to
 *  a 7-line addition shows 7 aligned rows, the extra 4 blank on the left. */
function pairForSplit(lines: DiffLine[]): { left: DiffLine | null; right: DiffLine | null }[] {
  const rows: { left: DiffLine | null; right: DiffLine | null }[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].op === "ctx") {
      rows.push({ left: lines[i], right: lines[i] });
      i++;
      continue;
    }
    const dels: DiffLine[] = [];
    while (i < lines.length && lines[i].op === "del") dels.push(lines[i++]);
    const adds: DiffLine[] = [];
    while (i < lines.length && lines[i].op === "add") adds.push(lines[i++]);
    const max = Math.max(dels.length, adds.length);
    for (let k = 0; k < max; k++) {
      rows.push({ left: dels[k] ?? null, right: adds[k] ?? null });
    }
  }
  return rows;
}

export default function DiffViewer({ before, after, beforeLabel = "before", afterLabel = "after", title }: DiffViewerProps) {
  const [mode, setMode] = useState<"split" | "unified">("split");
  const lines = diffLines(before, after);
  const added = lines.filter((l) => l.op === "add").length;
  const removed = lines.filter((l) => l.op === "del").length;

  return (
    <PlaygroundShell accent="coral">
      <PlaygroundSection divider="bottom" tone="muted" className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <WidgetBadge n="04" accent="coral" />
          <EyebrowLabel as="span" className="mb-0">
            {title ?? "diff"}
            {" "}
            <span className="text-electric-blue">+{added}</span>{" "}
            <span className="text-tangerine">−{removed}</span>
          </EyebrowLabel>
        </div>
        <div className="flex gap-0.5 rounded-[10px] border border-border-strong bg-black/30 p-[3px]">
          {(["split", "unified"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={clsx(
                "rounded-[7px] px-3 py-1 text-sm font-medium capitalize transition-colors",
                mode === m ? "bg-electric-blue text-[#0a0a0c]" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </PlaygroundSection>

      <div className="m-4 overflow-x-auto rounded-xl border border-border bg-black/40 font-mono text-[13px] leading-6 sm:m-5">
        {mode === "split" ? (
          <div className="min-w-[640px]">
            <div className="grid grid-cols-2 gap-0.5 border-b border-border text-[10.5px] uppercase tracking-[0.06em]">
              <span className="px-3 py-2 text-tangerine">{beforeLabel}</span>
              <span className="px-3 py-2 text-electric-blue">{afterLabel}</span>
            </div>
            {pairForSplit(lines).map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-0.5">
                <DiffCell line={row.left} marker="−" markerColor="text-tangerine" bg="bg-tangerine/10" />
                <DiffCell line={row.right} marker="+" markerColor="text-electric-blue" bg="bg-electric-blue/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="min-w-max py-1">
            {lines.map((line, i) => (
              <div
                key={i}
                className={clsx(
                  "grid grid-cols-[20px_minmax(0,1fr)] items-start gap-2 px-3",
                  line.op === "add" && "bg-electric-blue/10",
                  line.op === "del" && "bg-tangerine/10",
                )}
              >
                <span
                  className={clsx(
                    "font-semibold",
                    line.op === "add" ? "text-electric-blue" : line.op === "del" ? "text-tangerine" : "text-transparent",
                  )}
                >
                  {line.op === "add" ? "+" : line.op === "del" ? "−" : "·"}
                </span>
                <span
                  className="whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: highlightJs(line.text) }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PlaygroundShell>
  );
}

function DiffCell({
  line,
  marker,
  markerColor,
  bg,
}: {
  line: DiffLine | null;
  marker: string;
  markerColor: string;
  bg: string;
}) {
  if (!line) return <div className="min-h-[1.5rem] bg-white/[0.02]" />;
  return (
    <div className={clsx("grid grid-cols-[16px_minmax(0,1fr)] items-start gap-2 px-3 py-0.5", line.op !== "ctx" && bg)}>
      <span className={clsx("font-semibold", line.op === "ctx" ? "text-transparent" : markerColor)}>
        {line.op === "ctx" ? "·" : marker}
      </span>
      <span className="whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightJs(line.text) }} />
    </div>
  );
}
