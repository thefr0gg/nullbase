"use client";

import { useEffect } from "react";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * `output: "export"` has no middleware, so locale detection/redirect for the
 * bare `/` can't happen server-side — it happens here, once, before the
 * visitor sees anything. A returning visitor's last explicit choice (set by
 * `<LanguageSwitcher>`, mirroring `<ThemeToggle>`'s `localStorage` pattern)
 * wins; otherwise the browser's language list picks a supported locale;
 * otherwise English. The `<meta http-equiv="refresh">` below is a no-JS
 * fallback so this page is never a dead end.
 */
export default function RootRedirect() {
  useEffect(() => {
    let target = defaultLocale;
    try {
      const preferred = localStorage.getItem("preferred-locale");
      if (preferred && isLocale(preferred)) {
        target = preferred;
      } else {
        const browserMatch = navigator.languages
          .map((l) => l.split("-")[0])
          .find((l) => isLocale(l));
        if (browserMatch && isLocale(browserMatch)) target = browserMatch;
      }
    } catch {
      /* localStorage/navigator unavailable — fall through to defaultLocale */
    }
    window.location.replace(`/${target}`);
  }, []);

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}`} />
      <p>
        Redirecting to <a href={`/${defaultLocale}`}>nullbase</a>…
      </p>
    </>
  );
}
