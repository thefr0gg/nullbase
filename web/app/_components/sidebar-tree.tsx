"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { SidebarNode } from "@/lib/content/meta";
import type { Dictionary } from "@/lib/i18n/types";
import { format } from "@/lib/i18n/format";

type NavDict = Pick<Dictionary["nav"], "collapseNode" | "expandNode">;

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
  dict,
  onNavigate,
}: {
  tree: SidebarNode[];
  pathname: string;
  dict: NavDict;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1 text-sm">
      {tree.map((node, i) => (
        <SidebarTreeItem
          key={node.href}
          node={node}
          pathname={pathname}
          dict={dict}
          onNavigate={onNavigate}
          // Only top-level categories get a leading number, matching the
          // mockup's "Contents" list — nested pages don't.
          number={i + 1}
        />
      ))}
    </ul>
  );
}

function SidebarTreeItem({
  node,
  pathname,
  dict,
  onNavigate,
  number,
}: {
  node: SidebarNode;
  pathname: string;
  dict: NavDict;
  onNavigate?: () => void;
  number?: number;
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
            "flex w-full items-center gap-2.5 truncate rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
            active
              ? "bg-electric-blue/12 text-electric-blue shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-electric-blue)_35%,transparent)]"
              : "text-text-secondary hover:bg-background hover:text-text-primary",
          )}
        >
          {number != null && (
            <span className="w-4 shrink-0 font-mono text-[10px] text-text-secondary">
              {String(number).padStart(2, "0")}
            </span>
          )}
          <span className="truncate">{node.title}</span>
          {number == null && node.interactive && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric-blue" aria-hidden="true" />
          )}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={format(open ? dict.collapseNode : dict.expandNode, { title: node.title })}
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
        <ul className="mt-1 ms-4 space-y-1 border-s border-border ps-3">
          {node.children.map((child) => (
            <SidebarTreeItem key={child.href} node={child} pathname={pathname} dict={dict} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}
