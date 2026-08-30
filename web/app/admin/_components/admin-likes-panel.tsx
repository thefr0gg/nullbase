"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListLikes, type LikesRow } from "@/lib/admin-api";

const PAGE_SIZE = 25;

export function AdminLikesPanel() {
  const [items, setItems] = useState<LikesRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);

  // No setState before this — everything below happens after `await`, so
  // calling this from an effect never triggers a synchronous render loop.
  const fetchPage = useCallback(async (nextOffset: number, replace: boolean) => {
    try {
      const result = await adminListLikes({ limit: PAGE_SIZE, offset: nextOffset });
      setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
      setTotal(result.total);
      setOffset(nextOffset);
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
        setOffset(0);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load likes.");
      })
      .finally(() => setLoading(false));
  }, []);

  function loadMore() {
    setLoading(true);
    void fetchPage(offset + PAGE_SIZE, false);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-danger">{error}</p>}

      {items.length === 0 && !loading ? (
        <p className="text-sm text-text-secondary">No pages have been liked yet.</p>
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
              {items.map((row) => (
                <tr key={row.page_path} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-text-primary">{row.page_path}</td>
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

      {items.length < total && (
        <Button variant="secondary" disabled={loading} onClick={loadMore}>
          {loading ? "Loading…" : `Load more (${items.length}/${total})`}
        </Button>
      )}
    </div>
  );
}
