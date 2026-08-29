"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/**
 * Reads the `data-theme` attribute `<html>` carries (see the inline
 * before-paint script in the root layout). Shared by `<ThemeToggle>` and
 * anything else that needs to render differently per theme (e.g. the
 * theme-swapped logo mark) — one MutationObserver-backed source of truth
 * instead of each consumer re-deriving it.
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

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, getServerTheme);
}
