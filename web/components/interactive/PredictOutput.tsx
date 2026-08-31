"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { highlightJs } from "./CodePlayground";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A "what does this log?" quiz: a fixed code snippet, multiple-choice
 * options, one correct answer, an explanation, and the real output —
 * entirely data-driven so it drops into MDX as one tag plus a data object.
 */

export interface PredictOutputProps {
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  actualOutput: string;
  title?: string;
}

export default function PredictOutput({
  code,
  options,
  correctIndex,
  explanation,
  actualOutput,
  title,
}: PredictOutputProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const dict = useInteractiveDict().predictOutput;

  const isCorrect = submitted && selected === correctIndex;

  function retry() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <PlaygroundShell>
      {title && (
        <PlaygroundSection tone="muted" divider="bottom">
          <EyebrowLabel as="span" className="mb-0">
            {title}
          </EyebrowLabel>
        </PlaygroundSection>
      )}
      <PlaygroundSection>
        <DetailPanel className="overflow-x-auto bg-background p-3">
          <Ltr
            as="pre"
            className="whitespace-pre font-mono text-xs leading-6 text-text-primary"
            dangerouslySetInnerHTML={{ __html: highlightJs(code) }}
          />
        </DetailPanel>

        <fieldset className="mt-4">
          <legend className="sr-only">{dict.submit}</legend>
          <div className="flex flex-col gap-2">
            {options.map((option, i) => {
              const isSelected = selected === i;
              const showAsCorrect = submitted && i === correctIndex;
              const showAsWrong = submitted && isSelected && i !== correctIndex;
              return (
                <label
                  key={i}
                  className={clsx(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-150",
                    showAsCorrect
                      ? "border-success/40 bg-success/5"
                      : showAsWrong
                        ? "border-danger/40 bg-danger/5"
                        : isSelected
                          ? "border-electric-blue/40 bg-electric-blue/5"
                          : "border-border bg-surface hover:bg-background/60",
                  )}
                >
                  <input
                    type="radio"
                    name="predict-output"
                    checked={isSelected}
                    onChange={() => {
                      setSelected(i);
                      setSubmitted(false);
                    }}
                    className="h-4 w-4 accent-electric-blue"
                  />
                  <Ltr className="font-mono text-text-primary">{option}</Ltr>
                  {showAsCorrect && <Check className="ms-auto h-4 w-4 shrink-0 text-success" aria-hidden="true" />}
                  {showAsWrong && <X className="ms-auto h-4 w-4 shrink-0 text-danger" aria-hidden="true" />}
                </label>
              );
            })}
          </div>
        </fieldset>

        {submitted && (
          <DetailPanel className={clsx("mt-3 p-4 text-sm", isCorrect ? "border-success/30" : "border-danger/30")}>
            <p className={clsx("font-semibold", isCorrect ? "text-success" : "text-danger")}>
              {isCorrect ? dict.correct : dict.incorrect}
            </p>
            <p className="mt-1.5 text-text-secondary">{explanation}</p>
            <p className="mt-2 text-xs text-text-secondary">
              {dict.actualOutputLabel}: <Ltr className="font-mono text-text-primary">{actualOutput}</Ltr>
            </p>
          </DetailPanel>
        )}
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center gap-2">
        <Button variant="primary" onClick={() => setSubmitted(true)} disabled={selected === null} className="text-sm">
          {dict.submit}
        </Button>
        <Button variant="secondary" onClick={retry} className="text-sm">
          {dict.retry}
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
