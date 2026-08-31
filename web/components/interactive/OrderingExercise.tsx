"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A reorder-to-the-correct-sequence exercise ("put the HTTP request
 * components in order"). Up/down buttons are the primary, always-available
 * way to reorder — keyboard-operable, no hover dependency — with native
 * HTML5 drag layered on top as a progressive enhancement for pointer users
 * who prefer it; nothing here requires drag to actually complete the
 * exercise.
 */

export interface OrderingExerciseItem {
  id: string;
  label: string;
  /** Shown after submission if this item ended up in the wrong position. */
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

export default function OrderingExercise({ prompt, items, correctOrder, title }: OrderingExerciseProps) {
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dict = useInteractiveDict().exercise;

  const byId = new Map(items.map((i) => [i.id, i]));
  const allCorrect = submitted && order.every((id, i) => id === correctOrder[i]);

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSubmitted(false);
  }

  function onDrop(e: DragEvent<HTMLLIElement>, targetIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setSubmitted(false);
  }

  function retry() {
    setOrder(items.map((i) => i.id));
    setSubmitted(false);
    setRevealed(false);
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
        <ol className="flex flex-col gap-2">
          {order.map((id, index) => {
            const item = byId.get(id);
            if (!item) return null;
            const isCorrectPosition = submitted ? correctOrder[index] === id : undefined;
            return (
              <li
                key={id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, index)}
                className={clsx(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5",
                  submitted
                    ? isCorrectPosition
                      ? "border-success/30 bg-success/5"
                      : "border-danger/30 bg-danger/5"
                    : "border-border bg-surface",
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-text-secondary/60" aria-hidden="true" />
                <Ltr className="min-w-0 flex-1 truncate font-mono text-sm text-text-primary">{item.label}</Ltr>
                {submitted &&
                  (isCorrectPosition ? (
                    <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                  ))}
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={dict.moveUp}
                    className="rounded p-0.5 text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === order.length - 1}
                    aria-label={dict.moveDown}
                    className="rounded p-0.5 text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        {submitted && (
          <DetailPanel className={clsx("mt-3 p-4 text-sm", allCorrect ? "border-success/30" : "border-danger/30")}>
            <p className={clsx("font-semibold", allCorrect ? "text-success" : "text-danger")}>
              {allCorrect ? dict.correct : dict.incorrect}
            </p>
            {!allCorrect && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                {order.map((id, i) =>
                  correctOrder[i] !== id && byId.get(id)?.explanation ? (
                    <li key={id}>{byId.get(id)?.explanation}</li>
                  ) : null,
                )}
              </ul>
            )}
          </DetailPanel>
        )}

        {revealed && (
          <DetailPanel className="mt-3 p-4">
            <EyebrowLabel>{dict.correctOrderLabel}</EyebrowLabel>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-text-primary">
              {correctOrder.map((id) => (
                <li key={id}>
                  <Ltr className="font-mono">{byId.get(id)?.label}</Ltr>
                </li>
              ))}
            </ol>
          </DetailPanel>
        )}
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center gap-2">
        <Button variant="primary" onClick={() => setSubmitted(true)} className="text-sm">
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
