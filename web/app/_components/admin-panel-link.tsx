"use client";

import { ShieldCheck } from "lucide-react";
import { useHasMounted } from "@/lib/use-has-mounted";
import { hasAdminFlag } from "@/lib/admin-session";

/**
 * Site-wide navbar link to the admin panel, visible only when an admin is
 * (probably) logged in — see `lib/admin-session.ts`. `useHasMounted()`
 * guards the `document.cookie` read so this never mismatches between the
 * static server render (which has no cookie context) and the client,
 * same pattern as `<ThemeToggle>`/`<MobileNav>`.
 */
export function AdminPanelLink() {
  const mounted = useHasMounted();
  if (!mounted || !hasAdminFlag()) return null;

  return (
    <a
      href="https://admin.nullbase.wiki"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-electric-blue/10 px-2.5 text-xs font-medium text-electric-blue transition-colors hover:bg-electric-blue/15"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Admin panel</span>
    </a>
  );
}
