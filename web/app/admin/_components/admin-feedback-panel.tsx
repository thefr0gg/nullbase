"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, Trash2, TriangleAlert, X } from "lucide-react";
import { Badge, Button, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminDeleteFeedback, adminListFeedback, adminUpdateFeedbackStatus, type FeedbackRow } from "@/lib/admin-api";
import { FEEDBACK_TYPES, FEEDBACK_TYPE_LABELS, type FeedbackType } from "@/lib/feedback-types";
import { useHasMounted } from "@/lib/use-has-mounted";
import { AdminLoading } from "./admin-loading";
import { AdminPagination } from "./admin-pagination";
import { AdminDropdown } from "./admin-dropdown";

type StatusFilter = "all" | "new" | "resolved" | "dismissed";
type TypeFilter = "all" | FeedbackType;
const PAGE_SIZE = 20;

const STATUS_BADGE: Record<FeedbackRow["status"], { color: "blue" | "green" | "default"; label: string }> = {
  new: { color: "blue", label: "New" },
  resolved: { color: "green", label: "Resolved" },
  dismissed: { color: "default", label: "Dismissed" },
};

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...FEEDBACK_TYPES.map((t) => ({ value: t, label: FEEDBACK_TYPE_LABELS[t] })),
];

export function AdminFeedbackPanel({ pageTitles }: { pageTitles: Record<string, string> }) {
  const [status, setStatus] = useState<StatusFilter>("new");
  const [type, setType] = useState<TypeFilter>("all");
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeedbackRow | null>(null);
  const mounted = useHasMounted();

  // No setState before this — every update below happens after `await`, so
  // calling this from an effect never triggers a synchronous render loop.
  // Always replaces `items` (never appends) — each page is its own chunk,
  // not accumulated onto the previous ones.
  const fetchPage = useCallback(
    async (statusFilter: StatusFilter, typeFilter: TypeFilter, nextPage: number) => {
      try {
        const result = await adminListFeedback({
          status: statusFilter === "all" ? undefined : statusFilter,
          type: typeFilter === "all" ? undefined : typeFilter,
          limit: PAGE_SIZE,
          offset: (nextPage - 1) * PAGE_SIZE,
        });
        setItems(result.items);
        setTotal(result.total);
        setPage(nextPage);
        setError(null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load feedback.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load only, inlined rather than calling `fetchPage` — the
  // lint rule can't see through an intermediate function reference, only
  // a `.then/.catch/.finally` chain written directly in the effect body.
  useEffect(() => {
    adminListFeedback({ status: status === "all" ? undefined : status, limit: PAGE_SIZE, offset: 0 })
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setPage(1);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load feedback.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch; filter changes go through selectStatus/selectType below.
  }, []);

  function selectStatus(next: StatusFilter) {
    setStatus(next);
    setLoading(true);
    void fetchPage(next, type, 1);
  }

  function selectType(next: TypeFilter) {
    setType(next);
    setLoading(true);
    void fetchPage(status, next, 1);
  }

  function goToPage(next: number) {
    setLoading(true);
    void fetchPage(status, type, next);
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

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setDeleting(id);
    setPendingDelete(null);
    try {
      await adminDeleteFeedback(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete that item.");
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        <AdminDropdown
          value={type}
          options={TYPE_OPTIONS}
          onChange={(v) => selectType(v as TypeFilter)}
          ariaLabel="Filter by feedback type"
          className="w-full sm:w-44"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading && items.length === 0 ? (
        <AdminLoading />
      ) : items.length === 0 ? (
        <p className="text-sm text-text-secondary">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-text-primary">
                  {pageTitles[item.page_path] ?? item.page_path}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {item.locale && (
                    <Badge color="default" className="uppercase">
                      {item.locale}
                    </Badge>
                  )}
                  {item.type && <Badge color="purple">{FEEDBACK_TYPE_LABELS[item.type]}</Badge>}
                  <Badge color={STATUS_BADGE[item.status].color}>{STATUS_BADGE[item.status].label}</Badge>
                </div>
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
                <span className="min-w-0 break-words">
                  {item.email ? `${item.email} · ` : ""}
                  {new Date(item.created_at).toLocaleString()}
                </span>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {(["new", "resolved", "dismissed"] as const)
                    .filter((s) => s !== item.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updating === item.id || deleting === item.id}
                        onClick={() => updateStatus(item.id, s)}
                        className="rounded-md border border-border px-2 py-0.5 text-text-secondary transition-colors hover:border-electric-blue/40 hover:text-electric-blue disabled:opacity-50"
                      >
                        Mark {STATUS_BADGE[s].label.toLowerCase()}
                      </button>
                    ))}
                  <button
                    type="button"
                    disabled={deleting === item.id}
                    onClick={() => setPendingDelete(item)}
                    aria-label="Delete feedback"
                    title="Delete feedback"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={goToPage} disabled={loading} />

      {/* Portaled, custom confirm — matches the sessions panel's pattern of
          never using browser confirm() for a destructive action. */}
      {pendingDelete &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPendingDelete(null)} aria-hidden="true" />
            <Card className="relative w-full max-w-sm text-start shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">Delete feedback</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary">
                This permanently deletes the feedback for{" "}
                <span className="font-medium text-text-primary">
                  {pageTitles[pendingDelete.page_path] ?? pendingDelete.page_path}
                </span>
                . This can&apos;t be undone.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="inline-flex items-center justify-center rounded-xl bg-danger px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
                <Button type="button" variant="ghost" onClick={() => setPendingDelete(null)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  );
}
