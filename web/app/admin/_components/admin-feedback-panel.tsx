"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Badge, Button, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListFeedback, adminUpdateFeedbackStatus, type FeedbackRow } from "@/lib/admin-api";

type StatusFilter = "all" | "new" | "resolved" | "dismissed";
const PAGE_SIZE = 20;

const STATUS_BADGE: Record<FeedbackRow["status"], { color: "blue" | "green" | "default"; label: string }> = {
  new: { color: "blue", label: "New" },
  resolved: { color: "green", label: "Resolved" },
  dismissed: { color: "default", label: "Dismissed" },
};

export function AdminFeedbackPanel() {
  const [status, setStatus] = useState<StatusFilter>("new");
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // No setState before this — every update below happens after `await`, so
  // calling this from an effect never triggers a synchronous render loop.
  const fetchPage = useCallback(async (statusFilter: StatusFilter, nextOffset: number, replace: boolean) => {
    try {
      const result = await adminListFeedback({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: PAGE_SIZE,
        offset: nextOffset,
      });
      setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
      setTotal(result.total);
      setOffset(nextOffset);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load only, inlined rather than calling `fetchPage` — the
  // lint rule can't see through an intermediate function reference, only
  // a `.then/.catch/.finally` chain written directly in the effect body.
  useEffect(() => {
    adminListFeedback({ status: status === "all" ? undefined : status, limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setOffset(0);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load feedback.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch; filter changes go through selectStatus below.
  }, []);

  function selectStatus(next: StatusFilter) {
    setStatus(next);
    setLoading(true);
    void fetchPage(next, 0, true);
  }

  function loadMore() {
    setLoading(true);
    void fetchPage(status, offset + PAGE_SIZE, false);
  }

  async function updateStatus(id: number, next: FeedbackRow["status"]) {
    setUpdating(id);
    try {
      await adminUpdateFeedbackStatus(id, next);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: next } : item)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update that item.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["new", "resolved", "dismissed", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => selectStatus(s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              status === s
                ? "bg-electric-blue text-white"
                : "border border-border bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {s === "all" ? "All" : STATUS_BADGE[s].label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {items.length === 0 && !loading ? (
        <p className="text-sm text-text-secondary">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-text-secondary">{item.page_path}</span>
                <Badge color={STATUS_BADGE[item.status].color}>{STATUS_BADGE[item.status].label}</Badge>
              </div>
              {item.rating != null && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < item.rating! ? "fill-tangerine text-tangerine" : "text-border"}`}
                    />
                  ))}
                </div>
              )}
              {item.comment && <p className="text-sm text-text-primary">{item.comment}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                <span>
                  {item.email ? `${item.email} · ` : ""}
                  {new Date(item.created_at).toLocaleString()}
                </span>
                <div className="flex gap-1.5">
                  {(["new", "resolved", "dismissed"] as const)
                    .filter((s) => s !== item.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updating === item.id}
                        onClick={() => updateStatus(item.id, s)}
                        className="rounded-md border border-border px-2 py-0.5 text-text-secondary transition-colors hover:border-electric-blue/40 hover:text-electric-blue disabled:opacity-50"
                      >
                        Mark {STATUS_BADGE[s].label.toLowerCase()}
                      </button>
                    ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {items.length < total && (
        <Button variant="secondary" disabled={loading} onClick={loadMore}>
          {loading ? "Loading…" : `Load more (${items.length}/${total})`}
        </Button>
      )}
    </div>
  );
}
