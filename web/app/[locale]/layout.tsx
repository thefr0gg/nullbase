import "../globals.css";
import "../mdx.css";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Noto_Kufi_Arabic,
  Noto_Sans_Arabic,
  Plus_Jakarta_Sans,
} from "next/font/google";
import Link from "next/link";
import { KofiIcon } from "@/app/_components/kofi-icon";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { LogoMark } from "@/app/_components/logo-mark";
import { MobileNav } from "@/app/_components/mobile-nav";
import { SearchBar } from "@/app/_components/search-bar";
import { getSidebarTree, slugToHref } from "@/lib/content/meta";
import { getAllSlugs, getSearchIndex } from "@/lib/content/loader";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { AdminPanelLink } from "@/app/_components/admin-panel-link";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});
// Display font for headings/hero text — the dark-neon redesign's heavy,
// tight-tracking display type.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});
// Body/UI sans, replacing Jakarta as --font-body/--font-sans (Jakarta stays
// loaded above since app/admin/layout.tsx and MermaidDiagram.tsx still
// reference --font-jakarta directly).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Distinct from --font-geist-mono (used for inline code/curl output
// site-wide) — reserved for the SQL playground's CodeEditor, so it visibly
// reads as "a real code editor" rather than blending into the rest of the
// page's monospace text.
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
// Arabic-script fonts — only ever selected by the `:lang(ar)` rules in
// globals.css, but loaded unconditionally here since every locale shares
// this one layout; unused font files simply aren't referenced for en/fr/es.
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  display: "swap",
});
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  display: "swap",
});

// Only the locales registered in lib/i18n/config.ts get a built route —
// everything else 404s (same `output: "export"` + `dynamicParams` contract
// the old flat catch-all already used).
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  return {
    title: {
      default: "nullbase — developer reference",
      template: "%s · nullbase",
    },
    description: "A fast, interactive reference for developers.",
    // Hardcoded canonical domain: relative metadata URLs (canonical links,
    // Open Graph `url`, etc.) are resolved against this base, so they always
    // point at https://nullbase.wiki instead of the request host.
    metadataBase: new URL(SITE_URL),
    openGraph: {
      siteName: SITE_NAME,
      type: "website",
      locale,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  const tree = getSidebarTree(locale);
  const searchIndex = getSearchIndex(locale);
  const dir = localeMeta[locale].dir;

  // Which locales have a translation of a given slug — keyed by the slug
  // joined with "/". Small at this site's scale (locales × pages); lets
  // <LanguageSwitcher> know, for the page it's rendered on, which target
  // locales it can link straight to vs. fall back to that locale's
  // homepage for.
  const localesForSlug: Record<string, Locale[]> = {
    // These routes are hardcoded pages (app/[locale]/page.tsx,
    // app/[locale]/privacy/page.tsx), not derived from the per-locale
    // content tree, so getAllSlugs() below never reports them — without
    // this they'd always read as "not translated" in the switcher even
    // though every locale genuinely has them.
    "": [...locales],
    privacy: [...locales],
  };
  for (const l of locales) {
    for (const slug of getAllSlugs(l)) {
      const key = slug.join("/");
      (localesForSlug[key] ??= []).push(l);
    }
  }

  return (
    <html
      lang={locale}
      dir={dir}
      // No `data-theme` here on purpose — it's set only by the inline
      // pre-paint script below. If it were a literal prop here too, React
      // would re-assert "dark" over the script's real value on every
      // re-render of this element, including a locale switch (`dir`/`lang`
      // differ between locales, which forces this <html> to re-render) —
      // that reset a saved light-mode preference back to dark the moment
      // you changed languages. `suppressHydrationWarning` only covers the
      // very first hydration pass, not this.
      suppressHydrationWarning
      className={`${jakarta.variable} ${bricolage.variable} ${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${notoSansArabic.variable} ${notoKufiArabic.variable} font-sans`}
    >
      <head>
        {/*
          Critical: apply the saved theme before the first paint so we avoid
          a flash of the wrong color scheme. The site defaults to dark —
          only an explicit prior choice (saved by <ThemeToggle>) overrides it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        {/* Google AdSense site verification + loader, kept for the pending
            approval review. No ad units are rendered anywhere yet. */}
        <meta name="google-adsense-account" content="ca-pub-2968783374193615" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2968783374193615"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-text-primary antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-3 z-20 px-3 sm:px-6">
            <div className="mx-auto flex max-w-[1320px] items-center gap-3 rounded-2xl border-[1.5px] border-border-strong glass-panel px-3 py-2.5 shadow-card">
              <Link
                href={`/${locale}`}
                className="flex shrink-0 items-center gap-2 rounded-xl p-1 transition-colors hover:bg-background/60"
              >
                <LogoMark className="h-7 w-7" />
                <span className="hidden font-heading text-lg font-extrabold tracking-[-0.03em] text-text-primary sm:inline">
                  nullbase
                  <span className="font-mono text-xs font-normal tracking-normal text-electric-blue">.wiki</span>
                </span>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <MobileNav tree={tree} dict={dict} />
              </div>
              {/* Search centered in the remaining space */}
              <div className="flex flex-1 justify-center px-1">
                <SearchBar index={searchIndex} locale={locale} dict={dict} />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <AdminPanelLink />
                <LanguageSwitcher currentLocale={locale} localesForSlug={localesForSlug} dict={dict} />
                <a
                  href="https://ko-fi.com/U8H826028S"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Support This Website"
                  title="Support This Website"
                  className="hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-electric-blue/10 hover:text-electric-blue sm:inline-flex"
                >
                  <KofiIcon className="h-4 w-4" />
                </a>
                <ThemeToggle dict={dict} bare />
              </div>
            </div>
          </header>
          <main className="w-full flex-1">{children}</main>
          <footer className="flex flex-col items-center gap-4 border-t border-border px-4 py-8 text-center text-sm text-text-secondary sm:px-6">
            <span>{dict.footer.tagline}</span>
            <div className="flex items-center gap-4">
              <Link
                href={`${slugToHref(locale, [])}/privacy`}
                className="underline underline-offset-2 hover:text-text-primary"
              >
                {dict.footer.privacy}
              </Link>
              <a
                href="https://github.com/thefr0gg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-text-primary"
              >
                {dict.footer.developer}
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
