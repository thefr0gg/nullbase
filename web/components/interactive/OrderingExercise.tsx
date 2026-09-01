"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { codeTokenClassName, tokenizeCode, type CodeTokenType } from "./_code-tokens";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A "build the code" exercise: every item's `label` is tokenized into
 * individual keyword/operator/string/etc. pieces, which start out in a word
 * bank and get placed one at a time into an answer area — closer to a
 * Duolingo sentence-builder than a reorder-the-lines list, and each piece is
 * colored by what kind of code token it is via `_code-tokens`. Clicking a
 * piece is the primary, always-available interaction (keyboard- and
 * screen-reader-operable, no hover or drag required); native HTML5 drag is
 * layered on top for pointer users who prefer to drag pieces directly.
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

function buildPieces(items: OrderingExerciseItem[]): Piece[] {
  const pieces: Piece[] = [];
  for (const item of items) {
    tokenizeCode(item.label).forEach((token, index) => {
      pieces.push({ id: `${item.id}::${index}`, text: token.text, type: token.type, itemId: item.id });
    });
  }
  return pieces;
}

type DragSource = { from: "bank" | "placed"; id: string };

export default function OrderingExercise({ prompt, items, correctOrder, title }: OrderingExerciseProps) {
  const dict = useInteractiveDict().exercise;

  const allPieces = useMemo(() => buildPieces(items), [items]);
  const pieceById = useMemo(() => new Map(allPieces.map((p) => [p.id, p])), [allPieces]);
  const correctPieceOrder = useMemo(() => {
    const seq: string[] = [];
    for (const itemId of correctOrder) {
      for (const piece of allPieces) {
        if (piece.itemId === itemId) seq.push(piece.id);
      }
    }
    return seq;
  }, [allPieces, correctOrder]);

  const [bank, setBank] = useState<string[]>(() => allPieces.map((p) => p.id));
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);

  const isComplete = placed.length === allPieces.length;
  const allCorrect = submitted && isComplete && placed.every((id, i) => id === correctPieceOrder[i]);

  function place(id: string, atIndex?: number) {
    setBank((prev) => prev.filter((x) => x !== id));
    setPlaced((prev) => {
      const next = prev.filter((x) => x !== id);
      next.splice(atIndex ?? next.length, 0, id);
      return next;
    });
    setSubmitted(false);
  }

  function unplace(id: string) {
    setPlaced((prev) => prev.filter((x) => x !== id));
    setBank((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSubmitted(false);
  }

  function retry() {
    setBank(allPieces.map((p) => p.id));
    setPlaced([]);
    setSubmitted(false);
    setRevealed(false);
  }

  function onDropOnAnswer(e: DragEvent, atIndex?: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSource) return;
    place(dragSource.id, atIndex);
    setDragSource(null);
  }

  function onDropOnBank(e: DragEvent) {
    e.preventDefault();
    if (dragSource?.from === "placed") unplace(dragSource.id);
    setDragSource(null);
  }

  const wrongItemIds = useMemo(() => {
    if (!submitted || allCorrect) return new Set<string>();
    const ids = new Set<string>();
    placed.forEach((id, i) => {
      if (id !== correctPieceOrder[i]) {
        const piece = pieceById.get(id);
        if (piece) ids.add(piece.itemId);
      }
    });
    return ids;
  }, [submitted, allCorrect, placed, correctPieceOrder, pieceById]);

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
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropOnAnswer(e)}
          className={clsx(
            "mt-2 flex min-h-14 flex-wrap items-start gap-1.5 rounded-xl border border-dashed p-3",
            submitted
              ? allCorrect
                ? "border-success/30 bg-success/5"
                : "border-danger/30 bg-danger/5"
              : "border-border bg-surface",
          )}
        >
          {placed.length === 0 && <p className="text-xs text-text-secondary">{dict.emptyAnswer}</p>}
          {placed.map((id, index) => {
            const piece = pieceById.get(id)!;
            const state = submitted ? (id === correctPieceOrder[index] ? "correct" : "wrong") : undefined;
            return (
              <button
                key={id}
                type="button"
                draggable
                onDragStart={() => setDragSource({ from: "placed", id })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropOnAnswer(e, index)}
                onClick={() => unplace(id)}
                aria-label={`Remove "${piece.text}" from your answer`}
                className={chipClassName(piece.type, state)}
              >
                <Ltr>{piece.text}</Ltr>
              </button>
            );
          })}
        </div>
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
                onDragStart={() => setDragSource({ from: "bank", id })}
                onClick={() => place(id)}
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
          <DetailPanel className="p-4">
            <EyebrowLabel>{dict.correctOrderLabel}</EyebrowLabel>
            <Ltr as="pre" className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6">
              {correctOrder.map((itemId, i) => (
                <span key={itemId}>
                  {items.find((it) => it.id === itemId)?.label}
                  {i < correctOrder.length - 1 ? "\n" : ""}
                </span>
              ))}
            </Ltr>
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
