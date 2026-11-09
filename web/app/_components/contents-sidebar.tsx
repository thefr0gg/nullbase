"use client";

import { usePathname } from "next/navigation";
import type { SidebarNode } from "@/lib/content/meta";
import type { Dictionary } from "@/lib/i18n/types";
import { SidebarTree } from "./sidebar-tree";

interface Props {
  tree: SidebarNode[];
  dict: Dictionary["nav"];
  allTopicsLabel: string;
  allTopicsHref: string;
  runnableLabel: string;
}

/**
 * The mockup's "Contents" aside — inline in the content column on content
 * pages only (not the homepage, which has no sidebar at all). Replaces the
 * old <SidebarNav>'s tree-hosting role; the logo/wordmark that used to live
 * there moved into the floating header instead (see [locale]/layout.tsx).
 *
 * Shares <SidebarTree> with <MobileNav> so numbering/dot indicators and
 * active-branch auto-expand stay identical between the two.
 */
export function ContentsSidebar({ tree, dict, allTopicsLabel, allTopicsHref, runnableLabel }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 self-start lg:block" style={{ position: "sticky", top: "5.5rem" }}>
      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border-[1.5px] border-border-strong glass-panel p-3.5">
        <span className="mb-2.5 ms-2 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-secondary">
          {dict.contents}
        </span>
        <a
          href={allTopicsHref}
          className="block w-full truncate rounded-xl px-2.5 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
        >
          {allTopicsLabel}
        </a>
        <div className="mt-1">
          <SidebarTree tree={tree} pathname={pathname} dict={dict} />
        </div>
        <span className="mt-4 flex items-center gap-2 ms-2.5 font-mono text-[10.5px] text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-electric-blue" aria-hidden="true" />
          {runnableLabel}
        </span>
      </div>
    </aside>
  );
}
