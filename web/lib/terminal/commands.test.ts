import { describe, expect, it } from "vitest";
import { dir, file } from "./vfs";
import { createInitialGitState, defaultInterpreter, type TerminalState } from "./commands";

function makeState(): TerminalState {
  return {
    vfs: {
      root: dir({
        "README.md": file("hello"),
        projects: dir({}),
      }),
      cwd: [],
    },
    git: createInitialGitState(),
  };
}

describe("defaultInterpreter", () => {
  it("pwd reports the current directory", () => {
    const result = defaultInterpreter.run("pwd", makeState());
    expect(result.output).toEqual(["/"]);
  });

  it("ls lists entries in the current directory", () => {
    const result = defaultInterpreter.run("ls", makeState());
    expect(result.output[0]).toContain("README.md");
    expect(result.output[0]).toContain("projects");
  });

  it("cd changes the working directory", () => {
    const result = defaultInterpreter.run("cd projects", makeState());
    expect(result.state.vfs.cwd).toEqual(["projects"]);
  });

  it("cd into a nonexistent directory errors and leaves state unchanged", () => {
    const state = makeState();
    const result = defaultInterpreter.run("cd nope", state);
    expect(result.error).toMatch(/No such file or directory/);
    expect(result.state.vfs.cwd).toEqual(state.vfs.cwd);
  });

  it("cat prints a file's contents", () => {
    const result = defaultInterpreter.run("cat README.md", makeState());
    expect(result.output).toEqual(["hello"]);
  });

  it("cat on a directory errors", () => {
    const result = defaultInterpreter.run("cat projects", makeState());
    expect(result.error).toMatch(/Is a directory/);
  });

  it("an unknown command reports 'command not found'", () => {
    const result = defaultInterpreter.run("frobnicate", makeState());
    expect(result.error).toMatch(/command not found/);
  });

  it("git status starts with a modified file", () => {
    const result = defaultInterpreter.run("git status", makeState());
    expect(result.output.join("\n")).toMatch(/modified/);
  });

  it("git add stages a modified file", () => {
    const result = defaultInterpreter.run("git add README.md", makeState());
    expect(result.state.git.staged).toEqual(["README.md"]);
    expect(result.state.git.modified).toEqual([]);
  });

  it("git commit fails with nothing staged", () => {
    const result = defaultInterpreter.run('git commit -m "test"', makeState());
    expect(result.error).toMatch(/nothing added to commit/);
  });

  it("a full add-then-commit cycle records the commit in the log", () => {
    let state = makeState();
    state = defaultInterpreter.run("git add README.md", state).state;
    const commitResult = defaultInterpreter.run('git commit -m "Initial commit"', state);
    expect(commitResult.error).toBeUndefined();
    expect(commitResult.state.git.staged).toEqual([]);
    expect(commitResult.state.git.committed).toEqual(["README.md"]);
    expect(commitResult.state.git.log[0]).toContain("Initial commit");
  });

  it("clear signals the terminal to wipe its scrollback", () => {
    const result = defaultInterpreter.run("clear", makeState());
    expect(result.clear).toBe(true);
  });
});
