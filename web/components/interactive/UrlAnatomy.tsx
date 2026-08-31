import type { BadgeColor } from "@/app/_components/ui";
import { Ltr } from "./_shared";

/**
 * A hand-built "annotated string" diagram — not a sequence/flow, so Mermaid
 * (used for MermaidDiagram) isn't a fit. Renders a URL with each segment
 * underlined in its own color, plus a legend below explaining each part.
 * Server-renderable: no client state needed.
 */

export interface UrlAnatomyPart {
  text: string;
  label: string;
  color: BadgeColor;
}

export interface UrlAnatomyProps {
  parts: UrlAnatomyPart[];
}

// Tailwind needs literal class strings to scan for, not interpolated ones —
// same lookup pattern as `ui.tsx`'s Badge and `page.tsx`'s CARD_ACCENTS.
const BORDER_CLASSES: Record<BadgeColor, string> = {
  default: "border-text-secondary",
  blue: "border-electric-blue",
  green: "border-success",
  red: "border-danger",
  orange: "border-tangerine",
  purple: "border-violet",
};

const DOT_CLASSES: Record<BadgeColor, string> = {
  default: "bg-text-secondary",
  blue: "bg-electric-blue",
  green: "bg-success",
  red: "bg-danger",
  orange: "bg-tangerine",
  purple: "bg-violet",
};

export default function UrlAnatomy({ parts }: UrlAnatomyProps) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="overflow-x-auto">
        <Ltr as="div" className="whitespace-nowrap font-mono text-sm text-text-primary">
          {parts.map((part, i) => (
            <span key={i} className={`border-b-2 pb-1 ${BORDER_CLASSES[part.color]}`}>
              {part.text || " "}
            </span>
          ))}
        </Ltr>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {parts.map((part, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASSES[part.color]}`} />
            <Ltr className="font-mono text-text-primary">{part.text || "(none)"}</Ltr>
            <span className="text-text-secondary">— {part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
