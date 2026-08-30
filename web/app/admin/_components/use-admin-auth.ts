"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminRefresh, type AdminIdentity } from "@/lib/admin-api";

/**
 * The access token lives only in memory (see `lib/admin-api.ts`), so every
 * full page load starts with none — this silently exchanges the httpOnly
 * refresh cookie for a fresh one via `POST /admin/refresh`, without asking
 * the admin to re-enter credentials. Redirects to `/admin/login` only if
 * that fails (no session, or the refresh token itself expired/was revoked).
 */
export function useAdminAuth(): { admin: AdminIdentity | null; loading: boolean } {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminRefresh().then((result) => {
      if (cancelled) return;
      if (result) {
        setAdmin(result);
        setLoading(false);
      } else {
        router.replace("/admin/login");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { admin, loading };
}
