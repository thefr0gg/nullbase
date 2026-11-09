"use client";

import { useEffect, useRef, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface Props {
  heading: string;
}

const ITEM_HEIGHT = 32; // px — must match the h-8 row height below

/**
 * Sticky right-rail "On this page" table of contents with a scroll-tracking
 * animated highlight bead. Reads the already-rendered DOM (ids come from the
 * existing rehype-slug step in next.config.ts — no MDX pipeline change
 * needed) rather than a build-time heading list, since most pages don't use
 * this at all (see `page.frontmatter.toc`) and a DOM query keeps this
 * feature fully self-contained.
 */
/** Lazy useState initializer — runs once on the client during first render,
 *  by which point the server-rendered MDX headings already exist in the
 *  DOM, so this needs no effect of its own to populate initial state. */
function readHeadings(): Heading[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>(".mdx-prose h2[id], .mdx-prose h3[id]")).map(
    (el) => ({
      id: el.id,
      text: el.querySelector(".mdx-heading-text")?.textContent ?? el.textContent ?? "",
      level: el.tagName === "H3" ? 3 : 2,
    }),
  );
}

export function TableOfContents({ heading }: Props) {
  const [headings] = useState<Heading[]>(readHeadings);
  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Topmost heading currently at/above the trigger line wins — scan
        // all tracked headings' latest known position rather than relying
        // on entries alone, since IntersectionObserver only reports changed
        // entries per callback.
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        const idx = nodes.findIndex((n) => n.id === topMost.target.id);
        if (idx !== -1) setActiveIndex(idx);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    railRef.current?.style.setProperty("--toc-bead-offset", `${activeIndex * ITEM_HEIGHT}px`);
  }, [activeIndex]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-52 shrink-0 self-start lg:block" style={{ position: "sticky", top: "5rem" }}>
      <span className="mb-2.5 ms-2.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-secondary">
        {heading}
      </span>
      <div ref={railRef} className="relative">
        <span
          aria-hidden="true"
          className="absolute -start-1.5 -end-1.5 h-8 rounded-lg border border-electric-blue/45 bg-electric-blue/12 transition-[top] duration-300"
          style={{ top: "var(--toc-bead-offset, 0px)" }}
        />
        {headings.map((h, i) => {
          const active = i === activeIndex;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`relative flex h-8 items-center gap-2.5 truncate px-1 text-sm transition-colors ${
                active ? "font-semibold text-electric-blue" : "text-text-secondary hover:text-text-primary"
              } ${h.level === 3 ? "ps-5" : ""}`}
            >
              {h.level === 2 && (
                <span
                  className={`w-[18px] shrink-0 font-mono text-[10.5px] ${
                    active ? "text-electric-blue" : "text-text-secondary"
                  }`}
                >
                  {String(headings.slice(0, i + 1).filter((x) => x.level === 2).length).padStart(2, "0")}
                </span>
              )}
              <span className="truncate">{h.text}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
