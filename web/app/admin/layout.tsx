import "../globals.css";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * Independent root layout for the `/admin` tree (see `web/src/worker.ts` —
 * requests to admin.nullbase.wiki are rewritten to `/admin/...` before
 * static-asset serving, so this never appears in the visible URL). No
 * i18n/sidebar/search chrome — an internal tool, not public reference
 * content, so it's deliberately its own simple thing rather than reusing
 * `[locale]/layout.tsx`.
 */
export const metadata: Metadata = {
  title: { default: "nullbase - admin panel", template: "%s · nullbase - admin panel" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${jakarta.variable} ${geistMono.variable} font-sans`}
    >
      <head>
        {/* Defaults to dark — only an explicit prior choice (saved by
            <ThemeToggle>, on the dashboard) overrides it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
