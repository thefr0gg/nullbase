"use client";

import { LayoutDashboard } from "lucide-react";
import { useHasMounted } from "@/lib/use-has-mounted";
import { hasAdminFlag } from "@/lib/admin-session";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

/**
 * Site-wide navbar link to the admin panel, visible only when an admin is
 * (probably) logged in — see `lib/admin-session.ts`. `useHasMounted()`
 * guards the `document.cookie`/`window.location` reads so this never
 * mismatches between the static server render (which has neither) and the
 * client, same pattern as `<ThemeToggle>`/`<MobileNav>`.
 *
 * The admin panel only lives on its own `admin.nullbase.wiki` subdomain in
 * production (see `web/src/worker.ts`'s Host-based rewrite) — locally,
 * `next dev` doesn't run that Worker rewrite at all, so the admin routes
 * are just `/admin` on the same `localhost` origin. Linking to the real
 * production subdomain from a local dev session would take you clean out
 * of your local environment.
 */
export function AdminPanelLink() {
  const mounted = useHasMounted();
  if (!mounted || !hasAdminFlag()) return null;

  const isLocalDev = LOCAL_HOSTNAMES.has(window.location.hostname);
  const href = isLocalDev ? "/admin" : "https://admin.nullbase.wiki";

  return (
    <a
      href={href}
      aria-label="Admin panel"
      title="Admin panel"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue"
    >
      <LayoutDashboard className="h-4 w-4" />
    </a>
  );
}
