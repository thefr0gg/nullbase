"use client";

import { useTheme } from "@/lib/theme";

/**
 * The Ø mark, swapped per theme: the dark-ink SVG reads on the light
 * background, the white SVG reads on the dark one. Server render (and the
 * pre-hydration paint) assumes light — matches `useTheme`'s server snapshot,
 * so there's no flash/mismatch beyond the same one-frame window the rest of
 * the theme system already accepts.
 */
export function LogoMark({ className }: { className?: string }) {
  const theme = useTheme();
  return (
    <img
      src={theme === "dark" ? "/nullbase-logo-white.svg" : "/nullbase-logo-dark.svg"}
      alt="nullbase logo"
      className={className}
    />
  );
}
