import "../globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Minimal independent root layout for the bare `/` route only (see Next's
 * "multiple root layouts" pattern — route groups don't add a URL segment,
 * so `app/(root)/page.tsx` still serves exactly `/`). It exists purely to
 * redirect to a real locale; the actual site chrome (`<html lang dir>`,
 * sidebar, header, footer) lives in `app/[locale]/layout.tsx`, the other
 * independent root for every `/<locale>/...` route.
 */
export const metadata: Metadata = {
  title: "nullbase",
  // This page is a redirect shell (see page.tsx) — a crawler that doesn't
  // execute the client-side redirect should never index it as real
  // content; the real, indexable page is whichever `/<locale>` it lands on.
  robots: {
    index: false,
    follow: true,
  },
};

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
