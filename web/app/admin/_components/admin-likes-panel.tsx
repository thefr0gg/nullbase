"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListLikes, type LikesRow } from "@/lib/admin-api";
import { AdminLoading } from "./admin-loading";
import { AdminPagination } from "./admin-pagination";

// A real page size, not "load everything" — each page fetch loads and
// renders only its own chunk. The tradeoff: search/sort below only ever
// operate on the currently-loaded page, not the whole table (page titles
// only exist in the frontend content tree, not the likes table, so there's
// no server-side search to fall back on) — acceptable since the point of
// paginating is to stop loading every row up front.
const PAGE_SIZE = 20;

type SortDirection = "desc" | "asc";

export function AdminLikesPanel({ pageTitles }: { pageTitles: Record<string, string> }) {
  const [items, setItems] = useState<LikesRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortDirection>("desc");

  // No setState before this — everything below happens after `await`, so
  // calling this from an effect never triggers a synchronous render loop.
  const fetchPage = useCallback(async (nextPage: number) => {
    try {
      const result = await adminListLikes({ limit: PAGE_SIZE, offset: (nextPage - 1) * PAGE_SIZE });
      setItems(result.items);
      setTotal(result.total);
      setPage(nextPage);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load likes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Inlined rather than calling `fetchPage` — the lint rule can't see
  // through an intermediate function reference, only a
  // `.then/.catch/.finally` chain written directly in the effect body.
  useEffect(() => {
    adminListLikes({ limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setPage(1);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load likes.");
      })
      .finally(() => setLoading(false));
  }, []);

  function goToPage(next: number) {
    setLoading(true);
    void fetchPage(next);
  }

  // The server already returns count DESC — sort here is just picking
  // which direction to read that (already-loaded page) in, plus the
  // title-based search, both scoped to the current page only (see the
  // PAGE_SIZE comment above).
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((row) => {
          const title = pageTitles[row.page_path] ?? row.page_path;
          return title.toLowerCase().includes(q) || row.page_path.toLowerCase().includes(q);
        })
      : items;
    const sorted = [...filtered].sort((a, b) => (sort === "desc" ? b.count - a.count : a.count - b.count));
    return sorted;
  }, [items, query, sort, pageTitles]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this page by title…"
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
          />
        </div>
        <button
          type="button"
          onClick={() => setSort((s) => (s === "desc" ? "asc" : "desc"))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          {sort === "desc" ? <ArrowDownAZ className="h-3.5 w-3.5" /> : <ArrowUpAZ className="h-3.5 w-3.5" />}
          {sort === "desc" ? "Highest first" : "Lowest first"}
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading && items.length === 0 ? (
        <AdminLoading />
      ) : visible.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {query ? "No pages match that search." : "No pages have been liked yet."}
        </p>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-2 font-medium">Page</th>
                <th className="px-4 py-2 font-medium">Likes</th>
                <th className="px-4 py-2 font-medium">Last liked</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.page_path} className="border-b border-border last:border-0">
                  <td className="max-w-xs truncate px-4 py-2 text-sm font-medium text-text-primary">
                    {pageTitles[row.page_path] ?? row.page_path}
                  </td>
                  <td className="px-4 py-2 tabular-nums text-text-primary">{row.count}</td>
                  <td className="px-4 py-2 text-xs text-text-secondary">
                    {new Date(row.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={goToPage} disabled={loading} />
    </div>
  );
}
