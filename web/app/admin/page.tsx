import { getPageTitleMap } from "@/lib/content/admin-titles";
import { AdminDashboard } from "./_components/admin-dashboard";

/**
 * Server component wrapper: `getPageTitleMap()` walks the content tree via
 * `node:fs`, which only exists at build time — it must be computed here
 * and passed down as a plain prop, never imported from the "use client"
 * dashboard itself (see lib/content/admin-titles.ts).
 */
export default function AdminDashboardPage() {
  const pageTitles = getPageTitleMap();
  return <AdminDashboard pageTitles={pageTitles} />;
}
