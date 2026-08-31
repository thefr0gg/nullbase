"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { format } from "@/lib/i18n/format";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

const AUTOPLAY_INTERVAL_MS = 2600;

/**
 * Clickable, step-by-step process walkthrough — the one genuinely new
 * primitive in the system (the other two, RequestPlayground/ItemExplorer,
 * generalize components that already existed). Used for any ordered process
 * with discrete stages: a TCP/TLS handshake, a DNS resolution walk, an OAuth
 * authorization-code flow, a CI/CD pipeline, a DB transaction lifecycle...
 *
 * Step data for anything beyond a handful of short steps should live in a
 * colocated `.ts` file next to the `.mdx` page and be imported in, not
 * written as an inline JSX array literal — see the content-authoring
 * convention in the interactive-learning-system plan.
 */

// A broad, curated set spanning every language a step's `detail` snippet
// actually uses across the site's content — HTTP request lines, JSON, JS
// (Service/Web Worker callbacks), CSS rules, and the occasional SQL
// migration statement. Case-sensitive on purpose: these are static,
// author-written snippets in a known casing, not arbitrary user input, so
// there's no need to risk false-positives against ordinary prose ("Return",
// "Class") the way a case-insensitive match would.
const DETAIL_KEYWORDS = [
  "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "TRACE", "CONNECT",
  "HTTP", "Bearer", "SYN", "ACK", "FIN",
  "SELECT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "CREATE", "TABLE",
  "ALTER", "ADD", "COLUMN", "DROP", "WHERE", "PRIMARY", "KEY",
  "const", "let", "var", "function", "return", "if", "else", "async", "await",
  "new", "class", "extends", "typeof", "true", "false", "null", "undefined", "self",
];

const DETAIL_TOKEN_RE = new RegExp(
  [
    "(\\/\\/[^\\n]*)", // line comment
    "(\\/\\*[\\s\\S]*?\\*\\/)", // block comment
    "(^--[^\\n]*$)", // SQL-style "-- comment", only at the start of a line
    "('[^']*'|\"[^\"]*\")", // string
    "(\\b\\d+(?:\\.\\d+)?\\b)", // number
    `(\\b(?:${DETAIL_KEYWORDS.join("|")})\\b)`, // keyword
    "(\\b[\\w-]+(?=:))", // a header/property name immediately before a colon
  ].join("|"),
  "gm",
);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Same regex-tokenize-the-escaped-string approach as `_shared.tsx`'s
 *  `highlightJson` and `SqlPlayground.tsx`'s `highlightSql`, generalized to
 *  the mixed-language snippets a StepFlow step's `detail` panel shows. */
function highlightDetail(raw: string): string {
  const escaped = escapeHtml(raw);
  return escaped.replace(
    DETAIL_TOKEN_RE,
    (match, lineComment, blockComment, sqlComment, string, number, keyword, property) => {
      if (lineComment || blockComment || sqlComment) {
        return `<span class="text-text-secondary italic">${match}</span>`;
      }
      if (string) return `<span class="text-success">${match}</span>`;
      if (number) return `<span class="text-tangerine">${match}</span>`;
      if (keyword) return `<span class="text-electric-blue font-semibold">${match}</span>`;
      if (property) return `<span class="text-violet">${match}</span>`;
      return match;
    },
  );
}

export interface StepFlowStep {
  title: string;
  description: string;
  /** Who/what is acting in this step, e.g. "Client", "Resolver", "Server". */
  actor?: string;
  /** Optional short code/data snapshot shown in a monospace panel. */
  detail?: string;
}

export interface StepFlowProps {
  steps: StepFlowStep[];
  title?: string;
  /** Show a Play/Pause control that auto-advances through the steps.
   *  Off by default — most StepFlow content reads better step-at-a-time. */
  autoPlay?: boolean;
}

export default function StepFlow({ steps, title, autoPlay = false }: StepFlowProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dict = useInteractiveDict().stepFlow;
  const total = steps.length;
  const step = steps[index];

  const atStart = index === 0;
  const atEnd = index === total - 1;

  // Respect the user's reduced-motion preference by never auto-advancing —
  // stepping remains fully available via the Next button either way. Only
  // ever schedules a timeout here (never calls setState synchronously in
  // the effect body itself) — reaching the end just stops scheduling the
  // next tick, rather than needing to reset `playing` from inside the effect.
  const isPlaying = playing && !atEnd;
  useEffect(() => {
    if (!isPlaying) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => Math.min(total - 1, i + 1)), AUTOPLAY_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [isPlaying, index, total]);

  if (!step) return null;

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? dict.defaultTitle}
          </EyebrowLabel>
          <span className="text-xs font-medium text-text-secondary">
            {format(dict.stepOf, { current: index + 1, total })}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5" role="tablist" aria-label={dict.stepsAriaLabel}>
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={format(dict.stepAriaLabel, { n: i + 1, title: s.title })}
              onClick={() => setIndex(i)}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors duration-150",
                i <= index ? "bg-electric-blue" : "bg-border",
              ].join(" ")}
            />
          ))}
        </div>
      </PlaygroundSection>

      <PlaygroundSection>
        <div className="transition-opacity duration-150" key={index}>
          {step.actor && (
            <span className="mb-2 inline-block rounded-full border border-border bg-background px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-text-secondary">
              {step.actor}
            </span>
          )}
          <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{step.description}</p>
          {step.detail && (
            <DetailPanel className="mt-3 overflow-x-auto bg-background p-3">
              <Ltr
                as="pre"
                className="font-mono text-xs leading-6 text-text-primary"
                dangerouslySetInnerHTML={{ __html: highlightDetail(step.detail) }}
              />
            </DetailPanel>
          )}
        </div>
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
          disabled={atStart}
          className="text-sm"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {dict.previous}
        </Button>
        {autoPlay && (
          <Button
            variant="ghost"
            onClick={() => {
              if (isPlaying) {
                setPlaying(false);
                return;
              }
              if (atEnd) setIndex(0);
              setPlaying(true);
            }}
            aria-label={isPlaying ? dict.pause : dict.play}
            className="text-sm"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? dict.pause : dict.play}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.min(total - 1, i + 1));
          }}
          disabled={atEnd}
          className="text-sm"
        >
          {dict.next}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
