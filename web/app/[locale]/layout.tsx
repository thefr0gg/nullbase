import "../globals.css";
import "../mdx.css";
import { Geist_Mono, Noto_Kufi_Arabic, Noto_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { SidebarNav } from "@/app/_components/sidebar-nav";
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
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
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
  // joined with "/" ("" for the homepage, which always exists in every
  // locale regardless of content). Small at this site's scale (locales ×
  // pages); lets <LanguageSwitcher> know, for the page it's rendered on,
  // which target locales it can link straight to vs. fall back to that
  // locale's homepage for.
  const localesForSlug: Record<string, Locale[]> = {};
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
      className={`${jakarta.variable} ${geistMono.variable} ${notoSansArabic.variable} ${notoKufiArabic.variable} font-sans`}
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
        <div className="flex min-h-screen">
          <SidebarNav tree={tree} locale={locale} dict={dict} />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b border-border bg-surface/70 backdrop-blur">
              <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
                <div className="flex shrink-0 items-center gap-2">
                  <MobileNav tree={tree} dict={dict} />
                </div>
                {/* Search centered in the remaining space */}
                <div className="flex flex-1 justify-center px-2">
                  <SearchBar index={searchIndex} locale={locale} dict={dict} />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <AdminPanelLink />
                  <LanguageSwitcher currentLocale={locale} localesForSlug={localesForSlug} dict={dict} />
                  <ThemeToggle dict={dict} />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>
            <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center text-sm text-text-secondary">
              <span>{dict.footer.tagline}</span>
              <Link
                href={`${slugToHref(locale, [])}/privacy`}
                className="underline underline-offset-2 hover:text-text-primary"
              >
                {dict.footer.privacy}
              </Link>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
