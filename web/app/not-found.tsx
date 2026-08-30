import "./globals.css";
import { NotFoundContent } from "@/app/_components/not-found-content";
import { defaultLocale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";

/**
 * This file — sitting directly in `app/`, outside both `(root)` and
 * `[locale]` — is what `output: "export"` turns into the single global
 * `out/404.html` that Cloudflare's static-asset serving (`not_found_handling:
 * "404-page"` in wrangler.jsonc) falls back to for ANY unmatched path, at
 * any depth: a bad slug under a valid locale never gets its own static file
 * either (since `dynamicParams = false` in `[locale]/[...slug]` only
 * prerenders real pages), so this is the 404 almost everyone actually
 * lands on, not just the rare bad-locale case. It has no layout ancestor
 * to inherit `<html>`/styles from, hence the explicit CSS import and its
 * own bare English copy — no locale to detect from an unmatched path.
 */
export default function RootNotFound() {
  return (
    <html lang={defaultLocale} data-theme="dark">
      <body className="bg-background text-text-primary antialiased">
        <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
          <NotFoundContent homeHref={`/${defaultLocale}`} dict={en} />
        </main>
      </body>
    </html>
  );
}
