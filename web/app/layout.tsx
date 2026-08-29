import "./globals.css";
import "./mdx.css";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { SidebarNav } from "@/app/_components/sidebar-nav";
import { MobileNav } from "@/app/_components/mobile-nav";
import { SearchBar } from "@/app/_components/search-bar";
import { getSidebarTree } from "@/lib/content/meta";
import { getSearchIndex } from "@/lib/content/loader";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "nullbase — developer reference",
    template: "%s · nullbase",
  },
  description: "A fast, interactive reference for developers.",
  // Hardcoded canonical domain: relative metadata URLs (canonical links,
  // Open Graph `url`, etc.) are resolved against this base, so they always
  // point at https://nullbase.wiki instead of the request host.
  metadataBase: new URL(SITE_URL),
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tree = getSidebarTree();
  const searchIndex = getSearchIndex();
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${jakarta.variable} ${geistMono.variable} font-sans`}
    >
      <head>
        {/*
          Critical: apply the saved/preferred theme before the first paint so we
          avoid a flash of the wrong color scheme.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',t||(m?'dark':'light'));}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
          }}
        />
        {/* Google AdSense site verification + loader. `AdUnit` (rendered once per
            content page) supplies the per-unit slot. */}
        <meta name="google-adsense-account" content="ca-pub-2968783374193615" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2968783374193615"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-text-primary antialiased">
        <div className="flex min-h-screen">
          <SidebarNav tree={tree} />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b border-border bg-surface/70 backdrop-blur">
              <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
                <div className="flex shrink-0 items-center gap-2">
                  <MobileNav tree={tree} />
                </div>
                {/* Search centered in the remaining space */}
                <div className="flex flex-1 justify-center px-2">
                  <SearchBar index={searchIndex} />
                </div>
                <div className="shrink-0">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>
            <footer className="flex flex-col items-center gap-2 border-t border-border py-8 text-center text-sm text-text-secondary">
              <span>nullbase — building the developer reference, one spec at a time.</span>
              <Link href="/privacy" className="hover:text-text-primary hover:underline">
                Privacy
              </Link>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
