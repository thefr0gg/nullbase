"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { SearchEntry } from "@/lib/content/loader";

interface Props {
  index: SearchEntry[];
}

interface IndexedEntry {
  entry: SearchEntry;
  href: string;
  titleLower: string;
  descLower: string;
  contentLower: string;
}

const MAX_RESULTS = 8;
const PREVIEW_LENGTH = 120;
const PREVIEW_LEAD = 30; // chars kept before the match inside a preview

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps every case-insensitive occurrence of `query` in `text` with <mark>. */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "ig"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-tangerine/30 px-0.5 text-text-primary">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** A short excerpt of `content` centered on the first match of `query`. */
function getPreview(content: string, contentLower: string, query: string): string {
  if (!content) return "";
  const q = query.trim().toLowerCase();
  const matchIndex = q ? contentLower.indexOf(q) : -1;
  if (matchIndex === -1) {
    return content.length > PREVIEW_LENGTH
      ? `${content.slice(0, PREVIEW_LENGTH - 1).trimEnd()}…`
      : content;
  }
  const start = Math.max(0, matchIndex - PREVIEW_LEAD);
  const end = Math.min(content.length, matchIndex + q.length + (PREVIEW_LENGTH - PREVIEW_LEAD));
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = `…${snippet}`;
  if (end < content.length) snippet = `${snippet}…`;
  return snippet;
}

/** Ranks a title match above a description match above a content match, and
 *  an exact/prefix title match above a mid-string one. */
function scoreMatch(e: IndexedEntry, q: string): number {
  let score = 0;
  if (e.titleLower === q) score += 100;
  else if (e.titleLower.startsWith(q)) score += 40;
  else if (e.titleLower.includes(q)) score += 20;

  if (e.descLower.includes(q)) score += 6;
  if (e.contentLower.includes(q)) score += 1;

  return score;
}

/**
 * Navbar search with topic scoping:
 *  - On a topic page (e.g. /http/...), searches only within that topic's content.
 *  - On the home page, searches topic names AND all topic content.
 * Results are shown in a dropdown, ranked by where the match was found, with
 * the matched text highlighted; fully keyboard-navigable (arrows/Enter/Esc).
 */
export function SearchBar({ index }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const topic = pathname.split("/").filter(Boolean)[0] ?? null;

  // Lowercased once per index load, not per keystroke — typing only ever
  // does cheap `.includes()` calls against already-normalized strings.
  const indexed = useMemo<IndexedEntry[]>(
    () =>
      index.map((entry) => ({
        entry,
        href: "/" + entry.slug.join("/"),
        titleLower: entry.title.toLowerCase(),
        descLower: (entry.description ?? "").toLowerCase(),
        contentLower: entry.content.toLowerCase(),
      })),
    [index],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scoped = topic ? indexed.filter((e) => e.entry.slug[0] === topic) : indexed;
    return scoped
      .map((e) => ({ e, score: scoreMatch(e, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((r) => r.e);
  }, [query, indexed, topic]);

  const showDropdown = focused && query.trim() !== "";
  // Defensive clamp: `results` can shrink (e.g. topic changes) without a
  // fresh keystroke resetting `activeIndex` for us.
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, results.length - 1));

  const go = (href: string) => {
    setFocused(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (!showDropdown || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[safeActiveIndex];
      if (target) go(target.href);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0); // fresh keystroke -> re-select the top result
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={onKeyDown}
          placeholder={topic ? `Search ${topic}…` : "Search topics…"}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && results[safeActiveIndex] ? `search-result-${safeActiveIndex}` : undefined
          }
          className="w-full rounded-full border border-border bg-background/80 py-2.5 pl-9 pr-3 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-colors placeholder:text-text-secondary focus:border-electric-blue/60 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-electric-blue/12"
        />
      </div>

      {showDropdown && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card"
        >
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-text-secondary">
              No results for &ldquo;{query.trim()}&rdquo;.
            </li>
          ) : (
            results.map((r, i) => {
              const topicName = r.entry.slug[0]
                ? r.entry.slug[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : null;
              const preview = getPreview(r.entry.content, r.contentLower, query);
              const showPreview = preview && preview.toLowerCase() !== r.titleLower;

              return (
                <li key={r.entry.slug.join("/")} id={`search-result-${i}`} role="option" aria-selected={i === safeActiveIndex}>
                  <Link
                    href={r.href}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      setFocused(false);
                      setQuery("");
                    }}
                    className={clsx(
                      "block rounded-xl px-3 py-2.5 transition-colors",
                      i === safeActiveIndex ? "bg-electric-blue/10" : "hover:bg-electric-blue/10",
                    )}
                  >
                    {!topic && topicName && (
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                        {topicName}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-sm font-medium text-text-primary">
                      {highlight(r.entry.title, query)}
                    </span>
                    {showPreview && (
                      <span className="mt-0.5 block truncate text-xs text-text-secondary">
                        {highlight(preview, query)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
