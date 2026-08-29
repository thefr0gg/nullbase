"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { SidebarNode } from "@/lib/content/meta";

interface Props {
  tree: SidebarNode[];
}

/**
 * Desktop-only left sidebar (md+). Mobile uses <MobileNav />.
 *
 * - Sticky + full-height so it scrolls independently of the page body.
 * - Filters the tree to the current topic (first URL segment) so the nav
 *   reflects the section you're browsing. On the homepage, shows all topics.
 */
export function SidebarNav({ tree }: Props) {
  const pathname = usePathname();
  const topic = pathname.split("/").filter(Boolean)[0] ?? null;
  const visible = topic ? filterToTopic(tree, topic) : tree;

  return (
    <nav className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-border bg-surface/90 backdrop-blur-md md:block">
      <div className="px-4 pb-3 pt-6">
        <Link href="/" className="block rounded-xl p-2 transition-colors hover:bg-background/80">
          <div className="flex items-center gap-3">
            <img
              src="/nullbase-logo-dark.svg"
              alt="nullbase logo"
              className="h-9 w-9"
            />
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
      <ul className="space-y-1 px-3 pb-10 pt-2 text-sm">
        {visible.map((node) => (
          <SidebarItem key={node.href} node={node} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}

/** Return only the subtree whose root matches the given topic slug. */
function filterToTopic(tree: SidebarNode[], topic: string): SidebarNode[] {
  const match = tree.find((n) => n.slug[0] === topic);
  return match ? [match] : tree;
}

function SidebarItem({
  node,
  pathname,
}: {
  node: SidebarNode;
  pathname: string;
}) {
  const active =
    pathname === node.href ||
    pathname.startsWith(node.href.replace(/\/$/, "") + "/");

  const hasChildren = !!node.children?.length;
  const [open, setOpen] = useState(active);

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={node.href}
          className={clsx(
            "block w-full rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
            active
              ? "bg-electric-blue/12 text-electric-blue shadow-[inset_0_0_0_1px_rgba(59,130,246,0.12)]"
              : "text-text-secondary hover:bg-background hover:text-text-primary",
          )}
        >
          {node.title}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse section" : "Expand section"}
            className={clsx(
              "rounded-lg p-1.5 transition-colors",
              active ? "text-electric-blue" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="mt-2 ml-4 space-y-1 border-l border-border pl-3">
          {node.children.map((child) => (
            <SidebarItem key={child.href} node={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}
