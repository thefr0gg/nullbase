"use client";

import { useState } from "react";
import { Check, Copy, Play, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { getExecutionProvider } from "@/lib/execution/providers";
import { TIMEOUT_ERROR, type ExecutionResult } from "@/lib/execution/types";
import { CodeEditor } from "./CodeEditor";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell, SimulatedTag } from "./_shared";

/**
 * A runnable code editor. The editing surface is the site's existing
 * `CodeEditor` (textarea-over-highlighted-`<pre>`, no execution logic of
 * its own); running code goes through `lib/execution`'s provider registry,
 * so this component knows nothing about *how* a language actually runs —
 * today that's a sandboxed iframe for JavaScript only (see
 * `js-iframe-provider.ts`); other languages show as disabled/"coming soon"
 * rather than silently vanishing from the picker, so the UI stays honest
 * about what it can currently do.
 */

const KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "async", "await", "new", "class", "extends", "typeof", "true", "false",
  "null", "undefined", "this", "try", "catch", "throw", "switch", "case",
  "break", "continue", "import", "export", "default",
];
const TOKEN_RE = new RegExp(
  [
    "(\\/\\/[^\\n]*)",
    "(\\/\\*[\\s\\S]*?\\*\\/)",
    "('(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\"|`(?:\\\\.|[^`\\\\])*`)",
    "(\\b\\d+(?:\\.\\d+)?\\b)",
    `(\\b(?:${KEYWORDS.join("|")})\\b)`,
  ].join("|"),
  "g",
);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Exported so `PredictOutput` (a read-only code snippet) can reuse it
 *  instead of a third near-duplicate JS highlighter. */
export function highlightJs(raw: string): string {
  return escapeHtml(raw).replace(TOKEN_RE, (match, comment, blockComment, string, number, keyword) => {
    if (comment || blockComment) return `<span class="text-text-secondary italic">${match}</span>`;
    if (string) return `<span class="text-success">${match}</span>`;
    if (number) return `<span class="text-tangerine">${match}</span>`;
    if (keyword) return `<span class="text-electric-blue font-semibold">${match}</span>`;
    return match;
  });
}

export interface CodePlaygroundProps {
  language?: string;
  /** Additional languages to list in the picker even without a provider yet
   *  — shown disabled with a "Coming soon" hint. */
  languages?: string[];
  initialCode: string;
  title?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  typescript: "TypeScript",
};

export default function CodePlayground({
  language = "javascript",
  languages,
  initialCode,
  title,
}: CodePlaygroundProps) {
  const [activeLanguage, setActiveLanguage] = useState(language);
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const dict = useInteractiveDict().codePlayground;

  const allLanguages = Array.from(new Set([language, ...(languages ?? [])]));
  const provider = getExecutionProvider(activeLanguage);

  async function run() {
    if (!provider) return;
    setStatus("running");
    setResult(null);
    const r = await provider.run(code);
    setResult(r);
    setStatus("idle");
  }

  function reset() {
    setCode(initialCode);
    setResult(null);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — button just never shows "Copied".
    }
  }

  const errorMessage = result?.error === TIMEOUT_ERROR ? dict.timeoutError : result?.error;

  return (
    <PlaygroundShell>
      <PlaygroundSection tone="muted" divider="bottom" className="flex flex-wrap items-center justify-between gap-2">
        <EyebrowLabel as="span" className="mb-0">
          {title ?? dict.languageLabel}
        </EyebrowLabel>
        <div className="flex items-center gap-2">
          {allLanguages.length > 1 && (
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              aria-label={dict.languageLabel}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary"
            >
              {allLanguages.map((lang) => (
                <option key={lang} value={lang} disabled={!getExecutionProvider(lang)}>
                  {LANGUAGE_LABELS[lang] ?? lang}
                  {!getExecutionProvider(lang) ? ` (${dict.comingSoon})` : ""}
                </option>
              ))}
            </select>
          )}
          <SimulatedTag />
        </div>
      </PlaygroundSection>

      <PlaygroundSection>
        <CodeEditor
          value={code}
          onChange={setCode}
          highlight={highlightJs}
          aria-label={title ?? dict.languageLabel}
          className="h-48"
        />
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center gap-2">
        <Button variant="primary" onClick={run} disabled={!provider || status === "running"} className="text-sm">
          <Play className="h-4 w-4" />
          {status === "running" ? dict.running : dict.run}
        </Button>
        <Button variant="secondary" onClick={reset} className="text-sm">
          <RotateCcw className="h-4 w-4" />
          {dict.reset}
        </Button>
        <Button variant="ghost" onClick={copy} className="ms-auto text-sm">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? dict.copied : dict.copy}
        </Button>
      </PlaygroundSection>

      {status === "running" && (
        <PlaygroundSection divider="top">
          <p className="text-sm text-text-secondary">{dict.loadingSandbox}</p>
        </PlaygroundSection>
      )}

      {result && status !== "running" && (
        <PlaygroundSection divider="top">
          <EyebrowLabel>{dict.outputLabel}</EyebrowLabel>
          <DetailPanel className="mt-2 overflow-x-auto bg-background p-3">
            <Ltr
              as="pre"
              className={clsx("whitespace-pre-wrap font-mono text-xs leading-6", "text-text-primary")}
            >
              {result.stdout || dict.emptyOutput}
            </Ltr>
          </DetailPanel>
          {(result.stderr || errorMessage) && (
            <DetailPanel className="mt-2 overflow-x-auto border-danger/30 bg-danger/5 p-3">
              <EyebrowLabel className="mb-1 text-danger">{dict.errorLabel}</EyebrowLabel>
              <Ltr as="pre" className="whitespace-pre-wrap font-mono text-xs leading-6 text-danger">
                {errorMessage || result.stderr}
              </Ltr>
            </DetailPanel>
          )}
        </PlaygroundSection>
      )}
    </PlaygroundShell>
  );
}
