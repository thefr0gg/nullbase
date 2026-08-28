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
    <nav className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-surface/80 md:block">
      <ul className="space-y-1 px-3 py-10 text-sm">
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
            "block w-full rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
            active
              ? "bg-electric-blue/12 text-electric-blue"
              : "text-text-secondary hover:bg-surface hover:text-text-primary",
          )}
        >
          {node.title}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse section" : "Expand section"}
            className="rounded-md p-1 text-text-secondary hover:text-text-primary"
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
        <ul className="mt-1 ml-4 space-y-1 border-l border-border pl-3">
          {node.children.map((child) => (
            <SidebarItem key={child.href} node={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}
