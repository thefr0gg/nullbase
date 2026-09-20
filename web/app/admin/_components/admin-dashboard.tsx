"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LogOut, MessageSquare, ThumbsUp, Monitor } from "lucide-react";
import { Button } from "@/app/_components/ui";
import { LogoMark } from "@/app/_components/logo-mark";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { adminLogout } from "@/lib/admin-api";
import { useAdminAuth } from "./use-admin-auth";
import { AdminFeedbackPanel } from "./admin-feedback-panel";
import { AdminLikesPanel } from "./admin-likes-panel";
import { AdminSessionsPanel } from "./admin-sessions-panel";

const NAV_ITEMS = [
  { key: "feedback", label: "Feedback", icon: MessageSquare },
  { key: "likes", label: "Likes", icon: ThumbsUp },
  { key: "sessions", label: "Sessions", icon: Monitor },
] as const;
type NavKey = (typeof NAV_ITEMS)[number]["key"];

const THEME_DICT = {
  theme: { enableDark: "Enable dark mode", enableLight: "Enable light mode" },
};

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

export function AdminDashboard({ pageTitles }: { pageTitles: Record<string, string> }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const [active, setActive] = useState<NavKey>("feedback");

  async function logout() {
    await adminLogout();
    router.replace("/admin/login");
  }

  if (loading || !admin) {
    return <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>;
  }

  // The admin panel only lives on its own admin.nullbase.wiki subdomain in
  // production (see web/src/worker.ts's Host-based rewrite) — locally,
  // next dev doesn't run that rewrite, so it's just /admin on the same
  // localhost origin as the main site. Same reasoning as AdminPanelLink,
  // just pointed the other direction.
  const isLocalDev = LOCAL_HOSTNAMES.has(window.location.hostname);
  const homeHref = isLocalDev ? "/" : "https://nullbase.wiki";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl p-1 -m-1 transition-colors hover:bg-background/80"
        >
          <LogoMark className="h-9 w-9" />
          <div>
            <h1 className="font-mono text-lg font-semibold text-text-primary">nullbase</h1>
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-text-secondary">Admin Panel</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden text-xs text-text-secondary sm:inline">{admin.email}</span>
          <a
            href={homeHref}
            aria-label="Back to site"
            title="Back to site"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue"
          >
            <Home className="h-4 w-4" />
          </a>
          <ThemeToggle dict={THEME_DICT} bare />
          <Button variant="ghost" onClick={logout} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 sm:flex-row">
        <aside className="flex shrink-0 gap-1 overflow-x-auto sm:w-44 sm:flex-col sm:gap-0.5 sm:overflow-visible">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:w-full ${
                active === key
                  ? "bg-electric-blue/10 text-electric-blue"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </aside>

        <div className="min-w-0 flex-1">
          {active === "feedback" && <AdminFeedbackPanel pageTitles={pageTitles} />}
          {active === "likes" && <AdminLikesPanel pageTitles={pageTitles} />}
          {active === "sessions" && <AdminSessionsPanel />}
        </div>
      </div>
    </div>
  );
}
