"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchEntry } from "@/lib/content/loader";

interface Props {
  index: SearchEntry[];
}

/**
 * Navbar search with topic scoping:
 *  - On a topic page (e.g. /http/...), searches only within that topic's content.
 *  - On the home page, searches topic names AND all topic content.
 * Results are shown in a dropdown and link to the matching page.
 */
export function SearchBar({ index }: Props) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const topic = pathname.split("/").filter(Boolean)[0] ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scoped = topic ? index.filter((e) => e.slug[0] === topic) : index;
    return scoped
      .map((e) => {
        const title = e.title.toLowerCase();
        const desc = (e.description ?? "").toLowerCase();
        const content = e.content.toLowerCase();
        let score = 0;
        if (title.includes(q)) score += 10;
        if (desc.includes(q)) score += 5;
        if (content.includes(q)) score += 1;
        return { entry: e, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.entry);
  }, [query, index, topic]);

  const showDropdown = focused && results.length > 0;

  const getPreview = (content: string, term: string) => {
    const cleaned = content
      .replace(/[`*_#[\]()>]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return "";

    const needle = term.trim().toLowerCase();
    const lowered = cleaned.toLowerCase();
    const matchIndex = needle ? lowered.indexOf(needle) : -1;
    const start = matchIndex > -1 ? Math.max(0, matchIndex - 30) : 0;
    const end = matchIndex > -1 ? Math.min(cleaned.length, matchIndex + needle.length + 50) : Math.min(cleaned.length, 120);
    const snippet = cleaned.slice(start, end).trim();

    if (!snippet) return cleaned.slice(0, 120).trim();
    return snippet.length > 120 ? `${snippet.slice(0, 117).trimEnd()}…` : snippet;
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={topic ? `Search ${topic}…` : "Search topics…"}
          className="w-full rounded-full border border-border bg-background/80 py-2.5 pl-9 pr-3 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-colors placeholder:text-text-secondary focus:border-electric-blue/60 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-electric-blue/12"
        />
      </div>

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-card">
          {results.map((r) => {
            const topicName = r.slug[0]
              ? r.slug[0].replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
              : null;
            const preview = getPreview(r.content, query);

            return (
              <li key={r.slug.join("/")}>
                <Link
                  href={"/" + r.slug.join("/")}
                  onMouseDown={(e) => e.preventDefault()}
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-electric-blue/10"
                >
                  {topic ? (
                    <span className="block text-sm text-text-primary">{preview || r.title}</span>
                  ) : (
                    <>
                      {topicName && (
                        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                          {topicName}
                        </span>
                      )}
                      <span className="mt-0.5 block text-sm text-text-primary">
                        {preview || r.title}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}