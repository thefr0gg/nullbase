"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { SidebarNode } from "@/lib/content/meta";
import { SidebarTree } from "./sidebar-tree";
import { LogoMark } from "./logo-mark";

interface Props {
  tree: SidebarNode[];
}

const noopSubscribe = () => () => {};

/** True only once the client has hydrated — portals need a real DOM node,
 *  which doesn't exist during SSR/the hydration render itself. This is the
 *  React-recommended replacement for the old `useEffect(() =>
 *  setMounted(true), [])` idiom (which trips the "no setState synchronously
 *  in an effect" lint rule despite being the correct pattern here). */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Mobile navigation (<md): a hamburger button (rendered in the header) that
 * opens a slide-in drawer with the full sidebar tree. Hidden on md+.
 *
 * Shares <SidebarTree> with the desktop sidebar so both stay behaviorally
 * identical (same active-branch auto-expand, same "every category always
 * visible" fix) instead of drifting apart as two hand-copied trees.
 *
 * The drawer is rendered via a portal to `document.body`. The header this
 * button lives in uses `backdrop-blur`, and `backdrop-filter` — like
 * `filter`/`transform` — makes an element establish a new containing block
 * for `position: fixed` descendants (CSS spec, not a Tailwind quirk). Left
 * un-portaled, the "fixed inset-0" overlay resolves against the 56px-tall
 * header instead of the viewport, so the drawer only ever occupies the top
 * sliver of the screen instead of the full height.
 */
export function MobileNav({ tree }: Props) {
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
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

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col border-r border-border bg-surface/95 shadow-card backdrop-blur-md">
              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <LogoMark className="h-8 w-8" />
                  <span className="font-mono text-base font-semibold text-text-primary">
                    nullbase
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                <SidebarTree tree={tree} pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
