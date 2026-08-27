"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Light / dark toggle backed by a `data-theme` attribute on `<html>`.
 * A one-time inline script in `<head>` (see root layout) applies the theme before
 * the first paint to avoid a flash of incorrect colors.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    let initial: "light" | "dark" = "light";
    if (stored === "light" || stored === "dark") {
      initial = stored;
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      initial = "dark";
    }
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

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