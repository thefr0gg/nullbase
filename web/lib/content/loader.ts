import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CollectedPage, PageFrontmatter } from "./schema";
import { PageFrontmatterSchema } from "./schema";
import type { Locale } from "@/lib/i18n/config";

/** Absolute path to the content root for one locale — `content/<locale>/`.
 *  Adding a new locale is just a new sibling directory here; nothing else
 *  in this file changes. */
function contentRoot(locale: Locale): string {
  return path.join(process.cwd(), "content", locale);
}

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
function fileToSlug(root: string, fileAbs: string): string[] {
  const rel = path.relative(root, fileAbs).replace(/\.mdx$/, "");
  const parts = rel.split(path.sep);
  if (parts.length && parts[parts.length - 1] === "index") parts.pop();
  return parts;
}

/** Forward-slash relative path (no extension) used in dynamic `import()`. */
function fileToRel(root: string, fileAbs: string): string {
  const rel = path.relative(root, fileAbs).replace(/\.mdx$/, "");
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

/**
 * Top-level content folders that are a living reference for site authors —
 * "here's every interactive primitive we have, working, with real data" —
 * rather than public reference material. Available at `/interactive-demos`
 * in `next dev` so anyone building new content can see what already exists
 * before reaching for a new component; excluded entirely from the
 * production build (not statically generated, not in the sidebar/search
 * index/sitemap) so it never ships to real visitors.
 */
const INTERNAL_ONLY_ROOTS = new Set(["interactive-demos"]);

function isInternalOnly(slug: string[]): boolean {
  return slug.length > 0 && INTERNAL_ONLY_ROOTS.has(slug[0]);
}

/**
 * Cache keyed by locale, holding both the parsed pages and the freshness
 * signature (see `treeSignature`) they were built from. In production the
 * content tree never changes during a single build, so the signature check
 * below is skipped entirely. In dev, `getPage`/`getAllPages` run on every
 * request (`generateStaticParams`, `generateMetadata`, and the page itself
 * each call in) — re-walking and re-parsing the ~1000+ .mdx files on every
 * one of those calls made dev noticeably slow. Comparing a cheap signature
 * (file count + max mtime) lets a request reuse the cached parse until a
 * file actually changes, without losing "edits show up on next request."
 */
const cache = new Map<Locale, { pages: CollectedPage[]; signature: string }>();

/** Cheap freshness check: total file count plus the newest mtime across the
 *  tree. Doesn't need to read file contents, just `stat` each one — a
 *  content edit changes mtime, an add/delete changes the count. */
function treeSignature(root: string): string {
  let count = 0;
  let maxMtime = 0;
  const walk = (dir: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        count++;
        const mtime = fs.statSync(full).mtimeMs;
        if (mtime > maxMtime) maxMtime = mtime;
      }
    }
  };
  walk(root);
  return `${count}:${maxMtime}`;
}

function loadPages(locale: Locale): CollectedPage[] {
  const root = contentRoot(locale);
  if (!fs.existsSync(root)) return [];
  const files = readMdxFiles(root);
  let pages: CollectedPage[] = files.map((file) => ({
    slug: fileToSlug(root, file),
    frontmatter: parseFrontmatter(fs.readFileSync(file, "utf-8")),
    fileRel: fileToRel(root, file),
  }));
  if (process.env.NODE_ENV === "production") {
    pages = pages.filter((p) => !isInternalOnly(p.slug));
  }
  return pages;
}

export function getAllPages(locale: Locale): CollectedPage[] {
  const cached = cache.get(locale);
  if (cached && process.env.NODE_ENV === "production") return cached.pages;

  const root = contentRoot(locale);
  if (cached) {
    const signature = fs.existsSync(root) ? treeSignature(root) : "0:0";
    if (signature === cached.signature) return cached.pages;
  }

  const pages = loadPages(locale);
  const signature = fs.existsSync(root) ? treeSignature(root) : "0:0";
  cache.set(locale, { pages, signature });
  return pages;
}

/** Find a page by slug array, or `null` if it does not exist in this locale. */
export function getPage(locale: Locale, slug: string[]): CollectedPage | null {
  const all = getAllPages(locale);
  const target = JSON.stringify(slug);
  return all.find((p) => JSON.stringify(p.slug) === target) ?? null;
}

export function getAllSlugs(locale: Locale): string[][] {
  return getAllPages(locale).map((p) => p.slug);
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
 * Build a search index from one locale's content tree. Runs at build time
 * (server-side); the result is passed to the client `<SearchBar />` for
 * instant, dependency-free search across topic names and page content.
 */
export function getSearchIndex(locale: Locale): SearchEntry[] {
  const root = contentRoot(locale);
  if (!fs.existsSync(root)) return [];
  const files = readMdxFiles(root);
  return files
    .map((file) => {
      const source = fs.readFileSync(file, "utf-8");
      const { data, content } = matter(source);
      const parsed = PageFrontmatterSchema.safeParse(data);
      const slug = fileToSlug(root, file);
      return {
        slug,
        title: parsed.success ? parsed.data.title : slug.join("/"),
        description: parsed.success ? parsed.data.description : undefined,
        content: cleanForSearch(content),
      };
    })
    .filter((entry) => process.env.NODE_ENV !== "production" || !isInternalOnly(entry.slug));
}
