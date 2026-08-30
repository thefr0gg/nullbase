"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Laptop, Smartphone, Tablet, TriangleAlert, X } from "lucide-react";
import { Badge, Button, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListSessions, adminRevokeSession, type AdminSession } from "@/lib/admin-api";
import { parseUserAgent } from "@/lib/user-agent";
import { useHasMounted } from "@/lib/use-has-mounted";
import { AdminLoading } from "./admin-loading";

const DEVICE_ICON = { desktop: Laptop, mobile: Smartphone, tablet: Tablet };
const CONFIRM_WORD = "REVOKE";

interface PendingRevoke {
  id: number;
  label: string;
}

export function AdminSessionsPanel() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingRevoke | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const mounted = useHasMounted();

  // No setState before this — everything below happens after `await`, so
  // calling this from an effect never triggers a synchronous render loop.
  useEffect(() => {
    adminListSessions()
      .then((result) => {
        setSessions(result);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Could not load sessions.");
      })
      .finally(() => setLoading(false));
  }, []);

  function openConfirm(id: number, label: string) {
    setPending({ id, label });
    setConfirmText("");
  }

  function closeConfirm() {
    setPending(null);
    setConfirmText("");
  }

  async function confirmRevoke() {
    if (!pending || confirmText !== CONFIRM_WORD) return;
    const { id } = pending;
    setRevoking(id);
    closeConfirm();
    try {
      await adminRevokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not revoke that session.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-secondary">
        Every device currently signed in. Revoking a session logs it out immediately.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
      {loading ? (
        <AdminLoading />
      ) : (
        sessions.map((session) => {
          const { os, device, icon } = parseUserAgent(session.userAgent);
          const Icon = DEVICE_ICON[icon];
          const label = `${os} · ${device}`;
          return (
            <Card key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary" title={session.userAgent ?? undefined}>
                      {label}
                    </span>
                    {session.current && <Badge color="blue">This device</Badge>}
                  </div>
                  <span className="text-xs text-text-secondary">
                    Last active {new Date(session.lastUsedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {!session.current && (
                <button
                  type="button"
                  disabled={revoking === session.id}
                  onClick={() => openConfirm(session.id, label)}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                >
                  {revoking === session.id ? "Revoking…" : "Revoke"}
                </button>
              )}
            </Card>
          );
        })
      )}

      {/* Portaled, custom confirm — a browser `confirm()` can't be styled
          and is trivial to blast through by reflexively hitting Enter;
          revoking a session is destructive (immediate sign-out on that
          device) so it gets a real dialog that requires typing the action
          word out, not just a click. */}
      {pending &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} aria-hidden="true" />
            <Card className="relative w-full max-w-sm text-start shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">Revoke session</h3>
                </div>
                <button
                  type="button"
                  onClick={closeConfirm}
                  aria-label="Close"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary">
                This immediately signs out <span className="font-medium text-text-primary">{pending.label}</span>.
                Type <span className="font-mono font-semibold text-danger">{CONFIRM_WORD}</span> to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && confirmText === CONFIRM_WORD) void confirmRevoke();
                }}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={CONFIRM_WORD}
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-danger"
              />
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  disabled={confirmText !== CONFIRM_WORD}
                  onClick={confirmRevoke}
                  className="inline-flex items-center justify-center rounded-xl bg-danger px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Revoke session
                </button>
                <Button type="button" variant="ghost" onClick={closeConfirm}>
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
