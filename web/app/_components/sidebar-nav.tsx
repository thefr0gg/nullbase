"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarNode } from "@/lib/content/meta";
import { SidebarTree } from "./sidebar-tree";
import { LogoMark } from "./logo-mark";

interface Props {
  tree: SidebarNode[];
}

/**
 * Desktop-only left sidebar (md+). Mobile uses <MobileNav />.
 *
 * Always shows every top-level category — see sidebar-tree.tsx for why
 * this no longer filters down to just the current topic. Sticky +
 * full-height so it scrolls independently of the page body.
 */
export function SidebarNav({ tree }: Props) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-border bg-surface/90 backdrop-blur-md md:block">
      <div className="px-4 pb-3 pt-6">
        <Link href="/" className="block rounded-xl p-2 transition-colors hover:bg-background/80">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <div className="min-w-0">
              <div className="font-mono text-lg font-semibold text-text-primary">
                nullbase
              </div>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-text-secondary">
                developer reference
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="px-3 pb-10 pt-2">
        <SidebarTree tree={tree} pathname={pathname} />
      </div>
    </nav>
  );
}
