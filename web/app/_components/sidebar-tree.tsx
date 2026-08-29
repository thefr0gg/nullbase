"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { SidebarNode } from "@/lib/content/meta";

/**
 * Shared tree renderer for both the desktop sidebar and the mobile drawer —
 * previously each had its own near-identical copy of this logic, which had
 * quietly drifted apart (desktop auto-expanded the active category on
 * mount, mobile never did).
 *
 * Every top-level category is always rendered — earlier, the desktop
 * sidebar filtered the tree down to only the current topic, which made
 * every OTHER category disappear entirely the moment you navigated into
 * one. With 15 categories and ~150 subtopics planned, hiding the rest of
 * the site while browsing one section doesn't scale — instead, every
 * branch on the path from the root to the current page auto-expands, and
 * every other branch collapses to a single line, exactly like the
 * navigation lists most docs sites (Stripe, Vercel, MDN) use.
 */

function isNodeActive(node: SidebarNode, pathname: string): boolean {
  return pathname === node.href || pathname.startsWith(node.href.replace(/\/$/, "") + "/");
}

/** True if this node — or anything nested under it, at any depth — is the
 *  current page. Used to decide which branches start expanded. */
function containsActive(node: SidebarNode, pathname: string): boolean {
  if (isNodeActive(node, pathname)) return true;
  return node.children.some((child) => containsActive(child, pathname));
}

export function SidebarTree({
  tree,
  pathname,
  onNavigate,
}: {
  tree: SidebarNode[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {tree.map((node) => (
        <SidebarTreeItem key={node.href} node={node} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function SidebarTreeItem({
  node,
  pathname,
  onNavigate,
}: {
  node: SidebarNode;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNodeActive(node, pathname);
  const hasChildren = node.children.length > 0;
  // Lazy-initialized once per mount: expand this branch if the current page
  // lives anywhere inside it. Toggling stays purely local after that — it
  // doesn't fight the user for control as they browse other pages/sections.
  const [open, setOpen] = useState(() => containsActive(node, pathname));

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={node.href}
          onClick={onNavigate}
          className={clsx(
            "block w-full truncate rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
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
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? `Collapse ${node.title}` : `Expand ${node.title}`}
            aria-expanded={open}
            className={clsx(
              "shrink-0 rounded-lg p-1.5 transition-colors",
              active ? "text-electric-blue" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="mt-1 ml-4 space-y-1 border-l border-border pl-3">
          {node.children.map((child) => (
            <SidebarTreeItem key={child.href} node={child} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}
