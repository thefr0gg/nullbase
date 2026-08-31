/**
 * A plain in-memory filesystem tree — no real FS access, ever. `cwd` is a
 * path segment array from the root (`[]` = `/`), kept as state outside the
 * tree itself so the tree can be treated as immutable, author-provided data.
 */
export interface VfsFile {
  type: "file";
  content: string;
}

export interface VfsDir {
  type: "dir";
  children: Record<string, VfsNode>;
}

export type VfsNode = VfsFile | VfsDir;

export interface VfsState {
  root: VfsDir;
  cwd: string[];
}

export function formatPath(cwd: string[]): string {
  return cwd.length === 0 ? "/" : `/${cwd.join("/")}`;
}

/** Resolves a path (absolute if it starts with "/", otherwise relative to
 *  `from`) to its segment array, collapsing "." and ".." — returns
 *  `undefined` only for a ".." past root, which callers treat as a no-op. */
export function resolvePath(from: string[], input: string): string[] | undefined {
  const absolute = input.startsWith("/");
  const parts = (absolute ? input.slice(1) : input).split("/").filter(Boolean);
  const segments = absolute ? [] : [...from];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (segments.length === 0) return undefined;
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return segments;
}

export function getNode(root: VfsDir, segments: string[]): VfsNode | undefined {
  let node: VfsNode = root;
  for (const part of segments) {
    if (node.type !== "dir") return undefined;
    const child: VfsNode | undefined = node.children[part];
    if (!child) return undefined;
    node = child;
  }
  return node;
}

export function dir(children: Record<string, VfsNode>): VfsDir {
  return { type: "dir", children };
}

export function file(content: string): VfsFile {
  return { type: "file", content };
}
