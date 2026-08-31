"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, RotateCcw, StepForward } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/app/_components/ui";
import type { BadgeColor } from "@/app/_components/ui";
import { format } from "@/lib/i18n/format";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A clickable, steppable state machine — TCP's CLOSED/CONNECTED lifecycle,
 * an HTTP request's states, a WebSocket connection, an auth flow, a Git
 * ref's states. States are shown as a set of pills (the current one
 * highlighted); transitions are shown as a separate list of "from -> to"
 * buttons a learner fires directly — clicking one only moves `current` if
 * it's actually valid from where the machine is right now, which teaches
 * the machine's real shape (not every transition is available from every
 * state) without needing arrow/graph-layout math.
 */

export interface StateMachineState {
  id: string;
  label: string;
  detail: ReactNode;
  color?: BadgeColor;
}

export interface StateMachineTransition {
  from: string;
  to: string;
  /** e.g. "connect()", "SYN received" */
  label: string;
  detail?: ReactNode;
}

export interface StateMachineProps {
  states: StateMachineState[];
  transitions: StateMachineTransition[];
  initial: string;
  title?: string;
}

const STATE_TINT_CLASSES: Record<BadgeColor, string> = {
  default: "border-border bg-surface text-text-secondary",
  blue: "border-electric-blue/25 bg-electric-blue/10 text-electric-blue",
  green: "border-success/25 bg-success/10 text-success",
  red: "border-danger/25 bg-danger/10 text-danger",
  orange: "border-tangerine/25 bg-tangerine/10 text-tangerine",
  purple: "border-violet/25 bg-violet/10 text-violet",
};

export default function StateMachine({ states, transitions, initial, title }: StateMachineProps) {
  const [current, setCurrent] = useState(initial);
  const [selected, setSelected] = useState<
    { kind: "state"; id: string } | { kind: "transition"; index: number } | null
  >(null);
  const dict = useInteractiveDict().stateMachine;

  const available = transitions.filter((t) => t.from === current);

  function fire(index: number) {
    const t = transitions[index];
    if (!t || t.from !== current) return;
    setCurrent(t.to);
    setSelected({ kind: "transition", index });
  }

  function step() {
    if (available.length > 0) fire(transitions.indexOf(available[0]));
  }

  function reset() {
    setCurrent(initial);
    setSelected(null);
  }

  const selectedState = selected?.kind === "state" ? states.find((s) => s.id === selected.id) : undefined;
  const selectedTransition = selected?.kind === "transition" ? transitions[selected.index] : undefined;

  return (
    <PlaygroundShell>
      <PlaygroundSection tone="muted" divider="bottom" className="flex items-center justify-between gap-2">
        <EyebrowLabel as="span" className="mb-0">
          {title ?? dict.defaultTitle}
        </EyebrowLabel>
        <span className="text-xs text-text-secondary">
          {dict.currentStateLabel}: <span className="font-semibold text-text-primary">{current}</span>
        </span>
      </PlaygroundSection>

      <PlaygroundSection>
        <div className="flex flex-wrap gap-2">
          {states.map((s) => {
            const isCurrent = s.id === current;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected({ kind: "state", id: s.id })}
                aria-current={isCurrent ? "true" : undefined}
                className={clsx(
                  "rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-all duration-150",
                  STATE_TINT_CLASSES[s.color ?? "default"],
                  isCurrent && "ring-2 ring-electric-blue ring-offset-2 ring-offset-surface",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {transitions.map((t, i) => {
            const isAvailable = t.from === current;
            return (
              <button
                key={i}
                type="button"
                disabled={!isAvailable}
                onClick={() => fire(i)}
                aria-label={format(dict.transitionAriaLabel, { from: t.from, to: t.to })}
                className={clsx(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm transition-all duration-150",
                  isAvailable
                    ? "border-border bg-surface text-text-primary hover:border-electric-blue/40 hover:bg-electric-blue/5"
                    : "border-border/60 bg-background/40 text-text-secondary/60",
                )}
              >
                <span className="font-mono text-xs">{t.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
                <span className="font-mono text-xs">{t.to}</span>
                <Ltr className="ms-auto text-xs text-text-secondary">{t.label}</Ltr>
              </button>
            );
          })}
        </div>

        {(selectedState || selectedTransition) && (
          <DetailPanel className="mt-4 p-4 text-sm text-text-secondary">
            {selectedState?.detail}
            {selectedTransition?.detail}
          </DetailPanel>
        )}
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted" className="flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={reset} className="text-sm">
          <RotateCcw className="h-4 w-4" />
          {dict.reset}
        </Button>
        <Button variant="primary" onClick={step} disabled={available.length === 0} className="text-sm">
          <StepForward className="h-4 w-4" />
          {dict.step}
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
