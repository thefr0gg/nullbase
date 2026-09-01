"use client";

import { Children, isValidElement, useId, useState } from "react";
import type { KeyboardEvent } from "react";
import clsx from "clsx";

/**
 * Groups a page's exercises (each already a self-contained
 * `OrderingExercise`/`PredictOutput` playground) behind a tab strip instead
 * of stacking them — a page with 3 exercises no longer needs 3 screens of
 * scrolling to reach the last one. Purely a layout wrapper: it renders
 * exactly one child at a time and knows nothing about what that child is,
 * so it works for any interactive primitive, not just exercises.
 */

export interface ExerciseTabsProps {
  children: React.ReactNode;
  /** Defaults to "Exercise 1", "Exercise 2", ... */
  labels?: string[];
}

export default function ExerciseTabs({ children, labels }: ExerciseTabsProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  const baseId = useId();

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((index + 1) % items.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((index - 1 + items.length) % items.length);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="my-8">
      <div role="tablist" className="flex flex-wrap gap-2">
        {items.map((_, index) => {
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          const isActive = active === index;
          return (
            <button
              key={tabId}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-electric-blue/40 bg-electric-blue/10 text-electric-blue"
                  : "border-border bg-surface text-text-secondary hover:bg-background",
              )}
            >
              {labels?.[index] ?? `Exercise ${index + 1}`}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={`${baseId}-panel-${index}`}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={active !== index}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
