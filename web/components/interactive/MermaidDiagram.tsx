"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "@/lib/theme";
import { EyebrowLabel } from "./_shared";

/**
 * Renders a Mermaid diagram client-side. `chart` is always an author-written
 * literal in a `.mdx` file (never user/runtime input), so handing the
 * library's own SVG output to `dangerouslySetInnerHTML` is safe — nothing
 * here ever reflects a value someone typed into the page.
 *
 * `mermaid` is dynamically imported inside the effect (not a top-level
 * import) so its ~600KB only loads on pages that actually render a diagram,
 * instead of bundling it into every page's JS.
 */
export interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export default function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const theme = useTheme();
  const id = useId().replace(/:/g, "-");
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme === "dark" ? "dark" : "default",
        fontFamily: "var(--font-jakarta), sans-serif",
      });
      const { svg: rendered } = await mermaid.render(`mermaid-${id}`, chart);
      if (!cancelled) setSvg(rendered);
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card">
      {title && (
        <EyebrowLabel as="span" className="mb-3">
          {title}
        </EyebrowLabel>
      )}
      <div className="overflow-x-auto">
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="h-32 animate-pulse rounded-xl bg-background" />
        )}
      </div>
    </div>
  );
}
