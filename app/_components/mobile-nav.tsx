"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import clsx from "clsx";
import type { SidebarNode } from "@/lib/content/meta";

interface Props {
  tree: SidebarNode[];
}

/**
 * Mobile navigation (<md): a hamburger button (rendered in the header) that
 * opens a slide-in drawer with the full sidebar tree. Hidden on md+.
 */
export function MobileNav({ tree }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] overflow-y-auto border-r border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-base font-semibold text-text-primary">
                nullbase
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1 px-3 py-4 text-sm">
              {tree.map((node) => (
                <SidebarItem
                  key={node.href}
                  node={node}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarItem({
  node,
  pathname,
  onNavigate,
}: {
  node: SidebarNode;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    pathname === node.href ||
    pathname.startsWith(node.href.replace(/\/$/, "") + "/");

  const hasChildren = !!node.children?.length;
  const [open, setOpen] = useState(false);

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={node.href}
          onClick={onNavigate}
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
            <SidebarItem
              key={child.href}
              node={child}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
