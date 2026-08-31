import type { ElementType, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Badge } from "@/app/_components/ui";

/**
 * Shared visual chrome for every interactive primitive (`StepFlow`,
 * `RequestPlayground`, `ItemExplorer`, ...). Extracted so all 6 primitives —
 * plus the two protocols/legacy shapes they generalize — share one visual
 * identity instead of each re-deriving the same Tailwind class soup.
 *
 * Everything here is a server-renderable layout component (no state, no
 * "use client") — the primitives that use these add their own interactivity.
 */

/** The outer "big interactive playground" shell — rounded-3xl is reserved
 *  site-wide for this one shape (see mdx.css / ui.tsx conventions). */
export function PlaygroundShell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "my-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A horizontal strip inside a `PlaygroundShell` — the request-line / body /
 *  response sections in the existing playgrounds all use this pattern. */
export function PlaygroundSection({
  children,
  divider = "none",
  tone = "default",
  className,
}: {
  children: ReactNode;
  divider?: "top" | "bottom" | "none";
  tone?: "default" | "muted";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "p-4 sm:p-5",
        divider === "top" && "border-t border-border",
        divider === "bottom" && "border-b border-border",
        tone === "muted" && "bg-background/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small uppercase meta label — "Request line", "Headers", "Response"... */
export function EyebrowLabel({
  as = "p",
  children,
  className,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        "block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-secondary",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** A lighter, nested "card within the shell" — response bodies, detail
 *  panels, header-list boxes. rounded-2xl, one size down from the shell. */
export function DetailPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-2xl border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

/**
 * Every interactive widget on the site is simulated, never a real network
 * call or real code execution — one consistent small marker so a learner
 * never mistakes a widget for the real thing.
 *
 * `label` defaults to English rather than reading the i18n context itself,
 * so this stays a plain server-renderable component (no "use client") —
 * callers that already have `useInteractiveDict()` (RequestPlayground) pass
 * `dict.simulated` in; `legacy.tsx`'s components don't, and fall back to
 * English, matching their overall out-of-scope status for this pass.
 */
export function SimulatedTag({ className, label = "Simulated" }: { className?: string; label?: string }) {
  return (
    <Badge color="default" className={clsx("shrink-0", className)}>
      {label}
    </Badge>
  );
}

/**
 * Forces left-to-right rendering for a technical value (a URL, header, path,
 * command, identifier) shown inside an interactive component, regardless of
 * the surrounding page's `dir` — mirrors `app/mdx.css`'s `.mdx-pre-plain`/
 * `.mdx-code-inline` treatment of Shiki-rendered fences, which the
 * interactive-component library doesn't inherit since it isn't part of that
 * MDX pipeline. Use the `block` variant for a `<pre>`/multi-line snippet,
 * the default `inline` variant for a single value inside a line of prose.
 */
export function Ltr({
  children,
  as = "span",
  className,
  ...props
}: { children?: ReactNode; as?: ElementType; className?: string } & HTMLAttributes<HTMLElement>) {
  const Tag = as;
  return (
    <Tag dir="ltr" className={clsx("[unicode-bidi:isolate]", className)} {...props}>
      {children}
    </Tag>
  );
}

const JSON_TOKEN_RE =
  /"(?:\\.|[^"\\])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Colors a JSON string's keys/strings/numbers/booleans/null. The escape
 * pass runs *before* the tokenizer, over the whole string — every `<`/`>`
 * in the input (e.g. something a learner typed into a request body that
 * got echoed back) is already a harmless entity by the time the regex
 * looks for tokens to wrap, so the only tags this ever produces are our
 * own static-class `<span>`s. Safe to feed directly to
 * `dangerouslySetInnerHTML` as a result.
 */
function highlightJson(raw: string): string {
  const escaped = escapeHtml(raw);
  return escaped.replace(JSON_TOKEN_RE, (match) => {
    if (match.startsWith('"')) {
      return `<span class="${/:\s*$/.test(match) ? "text-electric-blue" : "text-success"}">${match}</span>`;
    }
    if (match === "true" || match === "false") {
      return `<span class="text-violet">${match}</span>`;
    }
    if (match === "null") {
      return `<span class="text-text-secondary">${match}</span>`;
    }
    return `<span class="text-tangerine">${match}</span>`;
  });
}

/** Syntax-highlighted JSON block for simulated response bodies. */
export function JsonBlock({ text, className }: { text: string; className?: string }) {
  return (
    <pre
      className={clsx("overflow-auto font-mono text-[11px] leading-6 text-text-primary", className)}
      dangerouslySetInnerHTML={{ __html: highlightJson(text) }}
    />
  );
}
