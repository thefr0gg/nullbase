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

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={topic ? `Search ${topic}…` : "Search topics…"}
          className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
      </div>

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-card">
          {results.map((r) => (
            <li key={r.slug.join("/")}>
              <Link
                href={"/" + r.slug.join("/")}
                onMouseDown={(e) => e.preventDefault()}
                className="block rounded-lg px-3 py-2 hover:bg-electric-blue/10"
              >
                <span className="block text-sm font-medium text-text-primary">
                  {r.title}
                </span>
                {r.description && (
                  <span className="block truncate text-xs text-text-secondary">
                    {r.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}