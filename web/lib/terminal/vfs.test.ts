import { describe, expect, it } from "vitest";
import { dir, file, formatPath, getNode, resolvePath } from "./vfs";

const fs = dir({
  home: dir({
    user: dir({
      "notes.txt": file("hello"),
    }),
  }),
});

describe("resolvePath", () => {
  it("resolves an absolute path", () => {
    expect(resolvePath(["home", "user"], "/home")).toEqual(["home"]);
  });

  it("resolves a relative path from cwd", () => {
    expect(resolvePath(["home"], "user")).toEqual(["home", "user"]);
  });

  it("collapses '..' segments", () => {
    expect(resolvePath(["home", "user"], "..")).toEqual(["home"]);
  });

  it("returns undefined for '..' past root", () => {
    expect(resolvePath([], "..")).toBeUndefined();
  });

  it("ignores '.' segments", () => {
    expect(resolvePath(["home"], "./user")).toEqual(["home", "user"]);
  });
});

describe("getNode", () => {
  it("finds a nested file", () => {
    const node = getNode(fs, ["home", "user", "notes.txt"]);
    expect(node).toEqual({ type: "file", content: "hello" });
  });

  it("finds a directory", () => {
    const node = getNode(fs, ["home", "user"]);
    expect(node?.type).toBe("dir");
  });

  it("returns undefined for a path that doesn't exist", () => {
    expect(getNode(fs, ["nope"])).toBeUndefined();
  });
});

describe("formatPath", () => {
  it("formats the root", () => {
    expect(formatPath([])).toBe("/");
  });

  it("formats a nested path", () => {
    expect(formatPath(["home", "user"])).toBe("/home/user");
  });
});
