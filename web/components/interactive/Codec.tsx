"use client";

import { useMemo, useState } from "react";
import { EyebrowLabel, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A live encode/decode tool — unlike every other primitive in this
 * directory, this one isn't simulating anything: `btoa`/`decodeURIComponent`
 * are the browser's real implementation, so there's no `SimulatedTag` here.
 * Purpose-built for format/encoding topics (Base64, URL Encoding) where the
 * interesting thing to explore is the transform itself, not a request/
 * response exchange — `RequestPlayground` doesn't fit that shape.
 *
 * English-only UI strings (matches `UrlAnatomy`/`MermaidDiagram`, the other
 * two primitives with no `useInteractiveDict()` wiring) — fine since the
 * content this ships on is English-only for now.
 */

export type CodecMode = "base64" | "url";

export interface CodecProps {
  mode: CodecMode;
  title?: string;
  defaultInput?: string;
}

const TRANSFORMS: Record<CodecMode, { encode: (s: string) => string; decode: (s: string) => string; label: string }> = {
  base64: {
    label: "Base64",
    encode: (s) => btoa(unescape(encodeURIComponent(s))),
    decode: (s) => decodeURIComponent(escape(atob(s))),
  },
  url: {
    label: "URL",
    encode: (s) => encodeURIComponent(s),
    decode: (s) => decodeURIComponent(s.replace(/\+/g, " ")),
  },
};

export default function Codec({ mode, title, defaultInput = "" }: CodecProps) {
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState(defaultInput);
  const transform = TRANSFORMS[mode];

  const output = useMemo(() => {
    try {
      return { value: transform[direction](input), error: null as string | null };
    } catch {
      return { value: "", error: `Not valid ${direction === "decode" ? transform.label : "text"} input.` };
    }
  }, [input, direction, transform]);

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="mb-3 flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? `${transform.label} encode / decode`}
          </EyebrowLabel>
          <div className="flex gap-1 rounded-full border border-border bg-background p-0.5">
            {(["encode", "decode"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors",
                  direction === d ? "bg-surface text-text-primary shadow-card" : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <EyebrowLabel as="label" className="mb-1.5">
          {direction === "encode" ? "Plain text" : `${transform.label}-encoded text`}
        </EyebrowLabel>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-24 w-full max-w-full resize-y rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15"
        />
      </PlaygroundSection>

      <PlaygroundSection>
        <EyebrowLabel as="label" className="mb-1.5">
          {direction === "encode" ? `${transform.label}-encoded output` : "Decoded output"}
        </EyebrowLabel>
        {output.error ? (
          <code className="block rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            {output.error}
          </code>
        ) : (
          <pre className="overflow-x-auto rounded-2xl border border-border bg-surface p-3 font-mono text-xs leading-6 text-text-primary">
            {output.value || " "}
          </pre>
        )}
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
