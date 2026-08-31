"use client";

import { useRef, useState } from "react";
import { Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import {
  createInitialGitState,
  defaultInterpreter,
  type CommandInterpreter,
  type TerminalState,
} from "@/lib/terminal/commands";
import { formatPath, type VfsDir } from "@/lib/terminal/vfs";
import { DetailPanel, EyebrowLabel, Ltr, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A simulated terminal over an in-memory filesystem (`lib/terminal/vfs.ts`)
 * — never a real shell. `interpreter` is injectable (defaults to
 * `defaultInterpreter`) so a real sandboxed backend could stand in later
 * without changing this component, mirroring `CodePlayground`'s
 * `ExecutionProvider` pattern.
 */
export interface InteractiveTerminalProps {
  initialFs: VfsDir;
  initialCwd?: string[];
  title?: string;
  /** If set, turns this into a checked exercise: the learner must run these
   *  commands, in order, to complete it. */
  expectedCommands?: string[];
  interpreter?: CommandInterpreter;
}

interface Line {
  kind: "input" | "output" | "error";
  text: string;
  cwd?: string;
}

export default function InteractiveTerminal({
  initialFs,
  initialCwd = [],
  title,
  expectedCommands,
  interpreter = defaultInterpreter,
}: InteractiveTerminalProps) {
  const initialState: TerminalState = {
    vfs: { root: initialFs, cwd: initialCwd },
    git: createInitialGitState(),
  };
  const [state, setState] = useState(initialState);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const commandHistory = useRef<string[]>([]);
  const dict = useInteractiveDict().terminal;

  const isExercise = Boolean(expectedCommands && expectedCommands.length > 0);
  const complete = isExercise && progress >= (expectedCommands?.length ?? 0);

  function submit() {
    const trimmed = input.trim();
    if (!trimmed) return;
    commandHistory.current.push(trimmed);
    setHistoryIndex(null);

    const cwdLabel = formatPath(state.vfs.cwd);
    const result = interpreter.run(trimmed, state);
    setState(result.state);

    setLines((prev) => {
      const next = result.clear
        ? []
        : [
            ...prev,
            { kind: "input" as const, text: trimmed, cwd: cwdLabel },
            ...result.output.map((text) => ({ kind: "output" as const, text })),
          ];
      if (result.error) next.push({ kind: "error", text: result.error });
      return next;
    });

    if (isExercise && expectedCommands && !complete && trimmed === expectedCommands[progress]) {
      setProgress((p) => p + 1);
    }

    setInput("");
  }

  function reset() {
    setState(initialState);
    setLines([]);
    setInput("");
    setProgress(0);
    setShowHint(false);
    commandHistory.current = [];
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const hist = commandHistory.current;
      if (hist.length === 0) return;
      const nextIndex = historyIndex === null ? hist.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(hist[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const hist = commandHistory.current;
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= hist.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(hist[nextIndex]);
      }
    }
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
        <DetailPanel className="overflow-hidden bg-background">
          <Ltr as="div" className="max-h-72 overflow-y-auto p-3 font-mono text-xs leading-6">
            {lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.kind === "error"
                    ? "text-danger"
                    : line.kind === "input"
                      ? "text-text-primary"
                      : "whitespace-pre-wrap text-text-secondary"
                }
              >
                {line.kind === "input" ? (
                  <>
                    <span className="text-success">{line.cwd}</span> <span className="text-electric-blue">$</span>{" "}
                    {line.text}
                  </>
                ) : (
                  line.text
                )}
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="text-success">{formatPath(state.vfs.cwd)}</span>
              <span className="text-electric-blue">$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label={dict.inputAriaLabel}
                className="min-w-0 flex-1 bg-transparent text-text-primary outline-none"
              />
            </div>
          </Ltr>
        </DetailPanel>

        {isExercise && (
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <span className={complete ? "text-success" : "text-text-secondary"}>
              {complete ? dict.exerciseComplete : `${progress}/${expectedCommands?.length}`}
            </span>
            {!complete && (
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="text-text-secondary underline decoration-dotted hover:text-text-primary"
              >
                {dict.hint}
              </button>
            )}
          </div>
        )}
        {isExercise && showHint && !complete && expectedCommands && (
          <Ltr as="p" className="mt-1 font-mono text-xs text-text-secondary">
            {expectedCommands[progress]}
          </Ltr>
        )}
      </PlaygroundSection>

      <PlaygroundSection divider="top" tone="muted">
        <Button variant="secondary" onClick={reset} className="text-sm">
          {dict.reset}
        </Button>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
