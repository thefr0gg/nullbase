"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListSessions, adminRevokeSession, type AdminSession } from "@/lib/admin-api";

export function AdminSessionsPanel() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true); // true until the first fetch resolves
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<number | null>(null);

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

  async function revoke(id: number) {
    setRevoking(id);
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
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : (
        sessions.map((session) => (
          <Card key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="max-w-xs truncate text-sm text-text-primary">
                  {session.userAgent ?? "Unknown device"}
                </span>
                {session.current && <Badge color="blue">This device</Badge>}
              </div>
              <span className="text-xs text-text-secondary">
                Last active {new Date(session.lastUsedAt).toLocaleString()}
              </span>
            </div>
            {!session.current && (
              <button
                type="button"
                disabled={revoking === session.id}
                onClick={() => revoke(session.id)}
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
              >
                {revoking === session.id ? "Revoking…" : "Revoke"}
              </button>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
