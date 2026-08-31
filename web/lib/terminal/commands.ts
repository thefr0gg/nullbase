import { formatPath, getNode, resolvePath, type VfsState } from "./vfs";

/**
 * `CommandInterpreter` is injectable — the shipped `defaultInterpreter`
 * covers a small, real virtual filesystem plus a fake `git` subset (just
 * enough state to teach `status`/`add`/`commit`/`log`), but `InteractiveTerminal`
 * itself never assumes this specific implementation. A real sandboxed shell
 * backend could be swapped in later by implementing this same interface,
 * mirroring `lib/execution`'s `ExecutionProvider` pattern.
 */
export interface GitState {
  staged: string[];
  modified: string[];
  committed: string[];
  log: string[];
}

export interface TerminalState {
  vfs: VfsState;
  git: GitState;
}

export interface CommandResult {
  output: string[];
  error?: string;
  state: TerminalState;
  /** Signals the terminal to clear its scrollback (the `clear` command). */
  clear?: boolean;
}

export interface CommandInterpreter {
  run(input: string, state: TerminalState): CommandResult;
}

export function createInitialGitState(): GitState {
  return { staged: [], modified: ["README.md"], committed: [], log: [] };
}

function ls(state: TerminalState): CommandResult {
  const node = getNode(state.vfs.root, state.vfs.cwd);
  if (!node || node.type !== "dir") return { output: [], error: "not a directory", state };
  const names = Object.keys(node.children).sort();
  return { output: [names.join("  ")], state };
}

function cd(args: string[], state: TerminalState): CommandResult {
  const target = args[0] ?? "/";
  const resolved = resolvePath(state.vfs.cwd, target);
  if (!resolved) return { output: [], error: "no such file or directory", state };
  const node = getNode(state.vfs.root, resolved);
  if (!node) return { output: [], error: `cd: ${target}: No such file or directory`, state };
  if (node.type !== "dir") return { output: [], error: `cd: ${target}: Not a directory`, state };
  return { output: [], state: { ...state, vfs: { ...state.vfs, cwd: resolved } } };
}

function cat(args: string[], state: TerminalState): CommandResult {
  if (args.length === 0) return { output: [], error: "usage: cat <file>", state };
  const resolved = resolvePath(state.vfs.cwd, args[0]);
  const node = resolved && getNode(state.vfs.root, resolved);
  if (!node) return { output: [], error: `cat: ${args[0]}: No such file or directory`, state };
  if (node.type !== "file") return { output: [], error: `cat: ${args[0]}: Is a directory`, state };
  return { output: node.content.split("\n"), state };
}

function git(args: string[], state: TerminalState): CommandResult {
  const [sub, ...rest] = args;
  const g = state.git;
  switch (sub) {
    case "status": {
      const output = [
        g.modified.length ? `Changes not staged for commit:\n  modified: ${g.modified.join(", ")}` : "",
        g.staged.length ? `Changes to be committed:\n  ${g.staged.join(", ")}` : "",
        !g.modified.length && !g.staged.length ? "nothing to commit, working tree clean" : "",
      ].filter(Boolean);
      return { output, state };
    }
    case "add": {
      const target = rest[0];
      if (!target) return { output: [], error: "usage: git add <file>", state };
      const toStage = target === "." ? g.modified : g.modified.filter((f) => f === target);
      if (toStage.length === 0) return { output: [], error: `pathspec '${target}' did not match any files`, state };
      const nextGit: GitState = {
        ...g,
        staged: [...new Set([...g.staged, ...toStage])],
        modified: g.modified.filter((f) => !toStage.includes(f)),
      };
      return { output: [], state: { ...state, git: nextGit } };
    }
    case "commit": {
      const messageFlagIndex = rest.indexOf("-m");
      const rawMessage = messageFlagIndex >= 0 ? rest.slice(messageFlagIndex + 1).join(" ") : undefined;
      const message = rawMessage?.replace(/^"(.*)"$/, "$1");
      if (!message) return { output: [], error: "usage: git commit -m \"message\"", state };
      if (g.staged.length === 0) return { output: [], error: "nothing added to commit", state };
      const entry = `${message} (${g.staged.join(", ")})`;
      const nextGit: GitState = {
        ...g,
        committed: [...g.committed, ...g.staged],
        staged: [],
        log: [entry, ...g.log],
      };
      return { output: [`[main] ${message}`], state: { ...state, git: nextGit } };
    }
    case "log": {
      if (g.log.length === 0) return { output: ["(no commits yet)"], state };
      return { output: g.log, state };
    }
    default:
      return { output: [], error: `git: '${sub ?? ""}' is not a git command`, state };
  }
}

export const defaultInterpreter: CommandInterpreter = {
  run(input, state) {
    const [cmd, ...args] = input.trim().split(/\s+/).filter(Boolean);
    if (!cmd) return { output: [], state };
    switch (cmd) {
      case "pwd":
        return { output: [formatPath(state.vfs.cwd)], state };
      case "ls":
        return ls(state);
      case "cd":
        return cd(args, state);
      case "cat":
        return cat(args, state);
      case "git":
        return git(args, state);
      case "clear":
        return { output: [], state, clear: true };
      case "help":
        return { output: ["pwd, ls, cd, cat, git status|add|commit|log, clear"], state };
      default:
        return { output: [], error: `${cmd}: command not found`, state };
    }
  },
};
