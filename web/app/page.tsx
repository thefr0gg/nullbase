import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/app/_components/ui";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "nullbase — developer reference",
    description: "A fast, interactive reference for developers.",
    url: "/", // resolved against `metadataBase` -> https://nullbase.wiki/
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function HomePage() {
  return (
    <section className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-text-primary">nullbase</h1>
        <p className="max-w-xl text-text-secondary">
          A fast, interactive reference for developers — starting with HTTP.
          Live examples for methods, status codes, and headers, with more
          topics coming soon.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/http" className="group block">
          <Card className="h-full p-6 transition-transform duration-200 group-hover:-translate-y-1">
            <Badge color="blue">HTTP</Badge>
            <h3 className="mt-3 text-xl font-medium text-text-primary">
              HTTP
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Methods, status codes, headers, and the request–response model —
              each with a live playground.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-electric-blue group-hover:underline">
              Browse HTTP →
            </span>
          </Card>
        </Link>

        <Card className="p-6">
          <Badge>Soon</Badge>
          <h3 className="mt-3 text-xl font-medium text-text-primary">HTML</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Semantics, forms, and accessibility primitives.
          </p>
        </Card>

        <Card className="p-6">
          <Badge>Soon</Badge>
          <h3 className="mt-3 text-xl font-medium text-text-primary">CSS</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Layout, color, and animation patterns with live previews.
          </p>
        </Card>
      </div>
    </section>
  );
}