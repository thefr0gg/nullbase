"use client";

import { useEffect, useState } from "react";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { Badge, Card } from "@/app/_components/ui";
import { ApiError } from "@/lib/api";
import { adminListSessions, adminRevokeSession, type AdminSession } from "@/lib/admin-api";
import { parseUserAgent } from "@/lib/user-agent";
import { AdminLoading } from "./admin-loading";

const DEVICE_ICON = { desktop: Laptop, mobile: Smartphone, tablet: Tablet };

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

  async function revoke(id: number, label: string) {
    if (!window.confirm(`Revoke the session on ${label}? That device will be signed out immediately.`)) {
      return;
    }
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
        <AdminLoading />
      ) : (
        sessions.map((session) => {
          const { os, device, icon } = parseUserAgent(session.userAgent);
          const Icon = DEVICE_ICON[icon];
          return (
            <Card key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary" title={session.userAgent ?? undefined}>
                      {os} · {device}
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
                  onClick={() => revoke(session.id, `${os} · ${device}`)}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                >
                  {revoking === session.id ? "Revoking…" : "Revoke"}
                </button>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
