"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/_components/ui";
import { useStepFlowLabels } from "@/lib/i18n/step-flow-context";
import { DetailPanel, EyebrowLabel, PlaygroundSection, PlaygroundShell } from "./_shared";

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
}

export default function StepFlow({ steps, title }: StepFlowProps) {
  const [index, setIndex] = useState(0);
  const labels = useStepFlowLabels();
  const total = steps.length;
  const step = steps[index];
  if (!step) return null;

  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? "Step-by-step"}
          </EyebrowLabel>
          <span className="text-xs font-medium text-text-secondary">
            Step {index + 1} of {total}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Steps">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Step ${i + 1}: ${s.title}`}
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
              <pre className="font-mono text-xs leading-6 text-text-primary">{step.detail}</pre>
            </DetailPanel>
          )}
        </div>
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={atStart}
          className="text-sm"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {labels.previous}
        </Button>
        <Button
          variant="primary"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={atEnd}
          className="text-sm"
        >
          {labels.next}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
