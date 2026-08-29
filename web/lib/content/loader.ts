import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CollectedPage, PageFrontmatter } from "./schema";
import { PageFrontmatterSchema } from "./schema";

/** Absolute path to the `/content` directory (the single source of truth). */
export const CONTENT_ROOT = path.join(process.cwd(), "content");

/** A parsed content page plus its location on disk. */
export type { CollectedPage, PageFrontmatter } from "./schema";

function readMdxFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      readMdxFiles(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      acc.push(full);
    }
  }
  return acc;
}

/** Convert an absolute `.mdx` path into a slug array (trailing `index` dropped). */
function fileToSlug(fileAbs: string): string[] {
  const rel = path.relative(CONTENT_ROOT, fileAbs).replace(/\.mdx$/, "");
  const parts = rel.split(path.sep);
  if (parts.length && parts[parts.length - 1] === "index") parts.pop();
  return parts;
}

/** Forward-slash relative path (no extension) used in dynamic `import()`. */
function fileToRel(fileAbs: string): string {
  const rel = path.relative(CONTENT_ROOT, fileAbs).replace(/\.mdx$/, "");
  return rel.split(path.sep).join("/");
}

function parseFrontmatter(source: string): PageFrontmatter {
  const { data } = matter(source);
  const parsed = PageFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter: ${parsed.error.message}`);
  }
  return parsed.data;
}

// Build-time cache: the content tree never changes during a single build, but
// `getPage` is called from `generateStaticParams`, `generateMetadata` and the
// page itself. In dev we bypass the cache so edits are picked up immediately.
let cache: CollectedPage[] | null = null;

export function getAllPages(): CollectedPage[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!fs.existsSync(CONTENT_ROOT)) {
    cache = [];
    return cache;
  }
  const files = readMdxFiles(CONTENT_ROOT);
  const pages: CollectedPage[] = files.map((file) => ({
    slug: fileToSlug(file),
    frontmatter: parseFrontmatter(fs.readFileSync(file, "utf-8")),
    fileRel: fileToRel(file),
  }));
  cache = pages;
  return pages;
}

/** Find a page by slug array, or `null` if it does not exist. */
export function getPage(slug: string[]): CollectedPage | null {
  const all = getAllPages();
  const target = JSON.stringify(slug);
  return all.find((p) => JSON.stringify(p.slug) === target) ?? null;
}

export function getAllSlugs(): string[][] {
  return getAllPages().map((p) => p.slug);
}

/** A lightweight, serializable entry used by the client-side search bar. */
export interface SearchEntry {
  slug: string[];
  title: string;
  description?: string;
  /**
   * Searchable prose extracted from the MDX body — fenced code blocks, JSX
   * component invocations (`<HttpRequest .../>`), and Markdown punctuation
   * are stripped, and whitespace is collapsed. This runs once at build time
   * so matching/highlighting on the client never has to re-clean or re-scan
   * raw MDX syntax, and so the JSON shipped to the browser is smaller.
   */
  content: string;
}

/**
 * Strip fenced code blocks, JSX/HTML tags, and Markdown punctuation from raw
 * MDX prose, leaving plain searchable text. Code fences are removed whole
 * (their contents are wire-format examples/ASCII diagrams, not prose worth
 * matching against a plain-English query); tags are stripped but the text
 * between an opening/closing pair (e.g. inside a raw `<h2>...</h2>`) is kept.
 */
function cleanForSearch(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    // List-item bullet markers ("- " / "* " at the start of a line) — strip
    // before newlines collapse below, or they'd survive as a stray " - "
    // wherever a list item happened to fall inside a preview snippet.
    .replace(/^[-*]\s+/gm, "")
    .replace(/[`*_#|[\]()>]/g, " ")
    // Table separator rows (`|---|:--|`) and `---` hr rules survive the
    // punctuation strip above as bare runs of dashes — drop those too so a
    // preview snippet never reads as a wall of "----------".
    .replace(/-{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build a search index from the content tree. Runs at build time (server-side);
 * the result is passed to the client `<SearchBar />` for instant, dependency-free
 * search across topic names and page content.
 */
export function getSearchIndex(): SearchEntry[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const files = readMdxFiles(CONTENT_ROOT);
  return files.map((file) => {
    const source = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(source);
    const parsed = PageFrontmatterSchema.safeParse(data);
    return {
      slug: fileToSlug(file),
      title: parsed.success ? parsed.data.title : fileToSlug(file).join("/"),
      description: parsed.success ? parsed.data.description : undefined,
      content: cleanForSearch(content),
    };
  });
}
