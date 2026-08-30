"use client";

import { useRef } from "react";
import clsx from "clsx";

/**
 * A minimal syntax-highlighted code editor: a real `<textarea>` (so typing,
 * selection, and the caret all behave normally) with its text made
 * transparent, stacked exactly on top of a read-only `<pre>` rendering the
 * same text through `highlight()` — the standard "invisible textarea over a
 * highlighted overlay" trick, not a full editor library. Consistent with
 * this site's existing hand-rolled `highlightJson` (`_shared.tsx`) rather
 * than pulling in a dependency like CodeMirror for one editable field.
 *
 * No `resize-y`, unlike this directory's plain textareas — a native resize
 * handle only resizes the textarea itself, not the `<pre>` stacked under it
 * or the line-number gutter beside it, so the height is fixed with its own
 * scroll instead, and both panes' scroll positions are kept in sync.
 */
export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Returns the value, HTML-escaped and wrapped in highlighting `<span>`s —
   *  same contract as `_shared.tsx`'s `highlightJson`. */
  highlight: (text: string) => string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

export function CodeEditor({ value, onChange, highlight, placeholder, className, ...aria }: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const lineCount = value.split("\n").length;

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }

  return (
    <div
      className={clsx(
        "flex h-40 overflow-hidden rounded-2xl border border-border bg-background font-mono text-xs leading-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="select-none overflow-hidden border-e border-border bg-background/60 px-2 py-3 text-end text-text-secondary"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre px-3 py-3 text-text-primary"
          dangerouslySetInnerHTML={{ __html: highlight(value) + "\n" }}
        />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          {...(aria["aria-label"] ? { "aria-label": aria["aria-label"] } : {})}
          className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 text-transparent caret-text-primary outline-none"
        />
      </div>
    </div>
  );
}
