"use client";

import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

/**
 * Light / dark toggle backed by a `data-theme` attribute on `<html>`.
 * A one-time inline script in `<head>` (see root layout) applies the theme
 * before the first paint to avoid a flash of incorrect colors.
 */
export function ThemeToggle() {
  const theme = useTheme();

  const toggle = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next: Theme = current === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    // Mutating the attribute notifies the MutationObserver above, which
    // re-renders this component with the new theme.
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Enable dark mode" : "Enable light mode"}
      title={theme === "light" ? "Enable dark mode" : "Enable light mode"}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}