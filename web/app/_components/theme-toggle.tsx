"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Light / dark toggle backed by a `data-theme` attribute on `<html>`.
 * A one-time inline script in `<head>` (see root layout) applies the theme
 * before the first paint to avoid a flash of incorrect colors.
 *
 * The DOM attribute is the source of truth, observed via useSyncExternalStore
 * (server snapshot renders the neutral icon; no setState-in-effect).
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const toggle = useCallback(() => {
    const next: Theme = getTheme() === "light" ? "dark" : "light";
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