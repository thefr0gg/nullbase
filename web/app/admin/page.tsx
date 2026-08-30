"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/app/_components/ui";
import { adminLogout } from "@/lib/admin-api";
import { useAdminAuth } from "./_components/use-admin-auth";
import { AdminFeedbackPanel } from "./_components/admin-feedback-panel";
import { AdminLikesPanel } from "./_components/admin-likes-panel";
import { AdminSessionsPanel } from "./_components/admin-sessions-panel";

const TABS = ["Feedback", "Likes", "Sessions"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDashboardPage() {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Feedback");

  async function logout() {
    await adminLogout();
    router.replace("/admin/login");
  }

  if (loading || !admin) {
    return <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">nullbase admin</h1>
          <p className="text-xs text-text-secondary">{admin.email}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </header>

      <nav className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-electric-blue text-electric-blue"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Feedback" && <AdminFeedbackPanel />}
      {tab === "Likes" && <AdminLikesPanel />}
      {tab === "Sessions" && <AdminSessionsPanel />}
    </div>
  );
}
