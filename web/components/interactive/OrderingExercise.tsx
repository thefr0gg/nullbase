"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Plus, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { codeTokenClassName, highlightCode, tokenizeCode, type CodeTokenType } from "./_code-tokens";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A "build the code" exercise: every item's `label` is tokenized into
 * individual keyword/operator/string/etc. pieces, which start out shuffled
 * in a word bank and get placed into a multi-line answer area — closer to a
 * Duolingo sentence-builder than a reorder-the-lines list, and each piece is
 * colored by what kind of code token it is via `_code-tokens`. The answer
 * area has its own line gutter (line numbers + a "+" to insert a new line),
 * since real code has line breaks that are themselves part of the puzzle —
 * each authored `item` is one intended line, so correctness checks that
 * pieces land in the right line groupings, not just the right flat order.
 * Clicking a piece is the primary, always-available interaction (keyboard-
 * and screen-reader-operable, no hover or drag required); native HTML5 drag
 * is layered on top for pointer users who prefer to drag pieces directly.
 */

export interface OrderingExerciseItem {
  id: string;
  label: string;
  /** Shown after submission if any piece from this item ended up misplaced. */
  explanation?: string;
}

export interface OrderingExerciseProps {
  prompt: string;
  /** Items in their initial (shuffled) display order. */
  items: OrderingExerciseItem[];
  /** Item ids in the correct order. */
  correctOrder: string[];
  title?: string;
}

interface Piece {
  id: string;
  text: string;
  type: CodeTokenType;
  itemId: string;
}

interface Line {
  id: string;
  pieces: string[];
}

/** Not a real piece — marks a line boundary when flattening lines/groups for
 *  comparison, so line breaks are checked alongside token order. */
const BREAK = "__BREAK__";

function buildPieces(items: OrderingExerciseItem[]): Piece[] {
  const pieces: Piece[] = [];
  for (const item of items) {
    tokenizeCode(item.label).forEach((token, index) => {
      pieces.push({ id: `${item.id}::${index}`, text: token.text, type: token.type, itemId: item.id });
    });
  }
  return pieces;
}

/** Fisher–Yates. Only ever called client-side (after mount, or in response
 *  to a click), never during the initial render — so the server-rendered
 *  and first-client-render markup match and React never has to reconcile a
 *  hydration mismatch. */
function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Drops empty lines, then flattens the rest with a BREAK between each —
 *  so a stray extra blank line never counts against the learner, but a
 *  break in the wrong place (or a missing one) does. */
function flattenGroups(groups: string[][]): string[] {
  const nonEmpty = groups.filter((g) => g.length > 0);
  const seq: string[] = [];
  nonEmpty.forEach((group, i) => {
    seq.push(...group);
    if (i < nonEmpty.length - 1) seq.push(BREAK);
  });
  return seq;
}

/** Same as `flattenGroups`, but also returns each piece's position in the
 *  flattened sequence, for per-piece correct/wrong coloring. */
function flattenWithIndex(groups: string[][]): { flat: string[]; indexOf: Map<string, number> } {
  const nonEmpty = groups.filter((g) => g.length > 0);
  const flat: string[] = [];
  const indexOf = new Map<string, number>();
  nonEmpty.forEach((group, i) => {
    group.forEach((id) => {
      indexOf.set(id, flat.length);
      flat.push(id);
    });
    if (i < nonEmpty.length - 1) flat.push(BREAK);
  });
  return { flat, indexOf };
}

type DragSource = { from: "bank" } | { from: "line"; lineId: string };

export default function OrderingExercise({ prompt, items, correctOrder, title }: OrderingExerciseProps) {
  const dict = useInteractiveDict().exercise;
  const lineCounter = useRef(1);

  const allPieces = useMemo(() => buildPieces(items), [items]);
  const pieceById = useMemo(() => new Map(allPieces.map((p) => [p.id, p])), [allPieces]);
  const correctGroups = useMemo(
    () => correctOrder.map((itemId) => allPieces.filter((p) => p.itemId === itemId).map((p) => p.id)),
    [allPieces, correctOrder],
  );
  const correctFlat = useMemo(() => flattenGroups(correctGroups), [correctGroups]);

  const [bank, setBank] = useState<string[]>(() => allPieces.map((p) => p.id));
  const [lines, setLines] = useState<Line[]>(() => [{ id: "line-0", pieces: [] }]);
  const [activeLineId, setActiveLineId] = useState("line-0");
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  // The id of whatever piece is currently being dragged, tracked alongside
  // `dragSource` so drop handlers know both *what* and *where it came from*.
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);

  // Scramble the bank once on mount, client-side only — see `shuffle`'s doc.
  // The bank order isn't state synchronized *from* an external system, it's
  // randomized once after hydration specifically so the server-rendered and
  // first-client-render markup can match; a client-only re-shuffle is the
  // deliberate exception react-hooks/set-state-in-effect otherwise guards
  // against.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above: intentional client-only randomization to dodge a hydration mismatch, not synchronizing with an external system
    setBank((prev) => shuffle(prev));
  }, []);

  const { flat: userFlat, indexOf: userIndexOf } = useMemo(
    () => flattenWithIndex(lines.map((l) => l.pieces)),
    [lines],
  );
  const isComplete = bank.length === 0;
  const allCorrect =
    submitted && isComplete && userFlat.length === correctFlat.length && userFlat.every((v, i) => v === correctFlat[i]);

  function removePieceFromLines(id: string, current: Line[]): Line[] {
    return current.map((line) => ({ ...line, pieces: line.pieces.filter((p) => p !== id) }));
  }

  function place(id: string, targetLineId: string, atIndex?: number) {
    setLines((prev) => {
      const cleared = removePieceFromLines(id, prev);
      return cleared.map((line) => {
        if (line.id !== targetLineId) return line;
        const pieces = [...line.pieces];
        pieces.splice(atIndex ?? pieces.length, 0, id);
        return { ...line, pieces };
      });
    });
    setBank((prev) => prev.filter((x) => x !== id));
    setSubmitted(false);
  }

  function unplace(id: string) {
    setLines((prev) => removePieceFromLines(id, prev));
    setBank((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSubmitted(false);
  }

  function addLine() {
    const newLine: Line = { id: `line-${lineCounter.current++}`, pieces: [] };
    setLines((prev) => [...prev, newLine]);
    setActiveLineId(newLine.id);
  }

  function removeLine(lineId: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== lineId) : prev));
    setActiveLineId((prev) => (prev === lineId ? "line-0" : prev));
  }

  function retry() {
    lineCounter.current = 1;
    setBank(shuffle(allPieces.map((p) => p.id)));
    setLines([{ id: "line-0", pieces: [] }]);
    setActiveLineId("line-0");
    setSubmitted(false);
    setRevealed(false);
  }

  function onDropOnLine(e: DragEvent, lineId: string, atIndex?: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSource) return;
    const id = draggedPieceId;
    if (id) place(id, lineId, atIndex);
    setDragSource(null);
  }

  function onDropOnBank(e: DragEvent) {
    e.preventDefault();
    if (dragSource?.from === "line" && draggedPieceId) unplace(draggedPieceId);
    setDragSource(null);
  }

  const wrongItemIds = useMemo(() => {
    if (!submitted || allCorrect) return new Set<string>();
    const ids = new Set<string>();
    for (const [pieceId, index] of userIndexOf) {
      if (correctFlat[index] !== pieceId) {
        const piece = pieceById.get(pieceId);
        if (piece) ids.add(piece.itemId);
      }
    }
    return ids;
  }, [submitted, allCorrect, userIndexOf, correctFlat, pieceById]);

  function chipClassName(type: CodeTokenType, state?: "correct" | "wrong") {
    return clsx(
      "cursor-pointer select-none rounded-lg border px-2 py-1 font-mono text-xs leading-5 transition-colors",
      state === "correct" && "border-success/40 bg-success/10",
      state === "wrong" && "border-danger/40 bg-danger/10",
      !state && "border-border bg-background hover:border-electric-blue/40 hover:bg-electric-blue/5",
      codeTokenClassName(type),
    );
  }

  return (
    <PlaygroundShell>
      <PlaygroundSection tone="muted" divider="bottom">
        <EyebrowLabel as="span" className="mb-0">
          {title ?? dict.yourOrderLabel}
        </EyebrowLabel>
        <p className="mt-2 text-sm text-text-primary">{prompt}</p>
      </PlaygroundSection>

      <PlaygroundSection>
        <EyebrowLabel>{dict.yourOrderLabel}</EyebrowLabel>
        <div
          className={clsx(
            "mt-2 overflow-hidden rounded-xl border border-dashed",
            submitted
              ? allCorrect
                ? "border-success/30 bg-success/5"
                : "border-danger/30 bg-danger/5"
              : "border-border bg-surface",
          )}
        >
          {lines.map((line, lineIndex) => (
            <div
              key={line.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropOnLine(e, line.id)}
              onClick={() => setActiveLineId(line.id)}
              className={clsx(
                "flex min-h-11 items-start gap-2 border-b border-border/60 px-2 py-1.5 last:border-b-0",
                activeLineId === line.id && !submitted && "bg-electric-blue/5",
              )}
            >
              <div className="flex shrink-0 items-center gap-1 pt-0.5">
                {lineIndex === lines.length - 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addLine();
                    }}
                    aria-label="Add new line"
                    title="Add new line"
                    className="rounded p-0.5 text-text-secondary transition-colors hover:bg-background hover:text-electric-blue"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="block h-[18px] w-[18px]" aria-hidden="true" />
                )}
                <span className="w-5 select-none text-right font-mono text-[0.7rem] text-text-secondary/70">
                  {lineIndex + 1}
                </span>
                {lines.length > 1 && line.pieces.length === 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLine(line.id);
                    }}
                    aria-label="Remove this line"
                    title="Remove this line"
                    className="rounded p-0.5 text-text-secondary transition-colors hover:bg-background hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex min-h-7 flex-1 flex-wrap items-center gap-1.5">
                {line.pieces.map((id, pieceIndex) => {
                  const piece = pieceById.get(id)!;
                  const idx = userIndexOf.get(id);
                  const state = submitted && idx !== undefined ? (correctFlat[idx] === id ? "correct" : "wrong") : undefined;
                  return (
                    <button
                      key={id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDragSource({ from: "line", lineId: line.id });
                        setDraggedPieceId(id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDropOnLine(e, line.id, pieceIndex)}
                      onClick={(e) => {
                        e.stopPropagation();
                        unplace(id);
                      }}
                      aria-label={`Remove "${piece.text}" from your answer`}
                      className={chipClassName(piece.type, state)}
                    >
                      <Ltr>{piece.text}</Ltr>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {lines.every((l) => l.pieces.length === 0) && (
          <p className="mt-2 text-xs text-text-secondary">{dict.emptyAnswer}</p>
        )}
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted">
        <EyebrowLabel>{dict.bankLabel}</EyebrowLabel>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropOnBank}
          className="mt-2 flex min-h-14 flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-3"
        >
          {bank.length === 0 && <p className="text-xs text-text-secondary">&nbsp;</p>}
          {bank.map((id) => {
            const piece = pieceById.get(id)!;
            return (
              <button
                key={id}
                type="button"
                draggable
                onDragStart={() => {
                  setDragSource({ from: "bank" });
                  setDraggedPieceId(id);
                }}
                onClick={() => place(id, activeLineId)}
                aria-label={`Add "${piece.text}" to your answer`}
                className={chipClassName(piece.type)}
              >
                <Ltr>{piece.text}</Ltr>
              </button>
            );
          })}
        </div>
      </PlaygroundSection>

      {submitted && (
        <PlaygroundSection divider="top">
          <DetailPanel className={clsx("p-4 text-sm", allCorrect ? "border-success/30" : "border-danger/30")}>
            <p className={clsx("font-semibold", allCorrect ? "text-success" : "text-danger")}>
              {allCorrect ? dict.correct : dict.incorrect}
            </p>
            {!allCorrect && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                {items
                  .filter((item) => wrongItemIds.has(item.id) && item.explanation)
                  .map((item) => (
                    <li key={item.id}>{item.explanation}</li>
                  ))}
              </ul>
            )}
          </DetailPanel>
        </PlaygroundSection>
      )}

      {revealed && (
        <PlaygroundSection divider="top">
          <DetailPanel className="overflow-hidden p-0">
            <EyebrowLabel className="p-4 pb-0">{dict.correctOrderLabel}</EyebrowLabel>
            <div className="mt-2 pb-3">
              {correctOrder.map((itemId, i) => (
                <div key={itemId} className="flex items-start gap-2 px-4 py-1">
                  <span className="w-5 shrink-0 select-none text-right font-mono text-[0.7rem] text-text-secondary/70">
                    {i + 1}
                  </span>
                  <Ltr
                    as="pre"
                    className="whitespace-pre-wrap font-mono text-sm leading-6 text-text-primary"
                    dangerouslySetInnerHTML={{ __html: highlightCode(items.find((it) => it.id === itemId)?.label ?? "") }}
                  />
                </div>
              ))}
            </div>
          </DetailPanel>
        </PlaygroundSection>
      )}

      <PlaygroundSection divider="top" tone="muted" className="flex items-center gap-2">
        <Button variant="primary" onClick={() => setSubmitted(true)} disabled={!isComplete} className="text-sm">
          {dict.submit}
        </Button>
        <Button variant="secondary" onClick={retry} className="text-sm">
          {dict.retry}
        </Button>
        <Button variant="ghost" onClick={() => setRevealed(true)} className="ms-auto text-sm">
          {dict.showAnswer}
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
