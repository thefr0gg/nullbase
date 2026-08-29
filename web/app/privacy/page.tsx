import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Card } from "@/app/_components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How nullbase handles data: what we store, what we don't, and what Google AdSense does on this site.",
  alternates: {
    canonical: "/privacy",
  },
};

const LAST_UPDATED = "2026-08-29";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-3 text-text-secondary">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Badge color="blue" className="w-fit">
          Privacy
        </Badge>
        <h1 className="text-3xl font-semibold text-text-primary">
          How nullbase handles your data
        </h1>
        <p className="max-w-xl text-text-secondary">
          The short version: there are no accounts, no analytics, and no
          fingerprinting. This page lays out, in plain terms, the handful of
          things the site does store and why — plus what Google AdSense does
          on its own.
        </p>
        <p className="text-sm text-text-secondary">
          Last updated: <span className="font-mono">{LAST_UPDATED}</span>
        </p>
      </header>

      <Card className="border-l-4 border-l-electric-blue">
        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-text-primary">
          <span className="text-electric-blue">$</span> curl -I https://nullbase.wiki
          {"\n"}
          <span className="text-text-secondary">
            {"# no Set-Cookie, no login, no tracker script — just the page."}
          </span>
        </pre>
      </Card>

      <Section title="What nullbase never does">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No user accounts, sign-up, or login for visitors.</li>
          <li>No analytics or telemetry scripts (no Google Analytics, no Meta Pixel, no session replay).</li>
          <li>No device or browser fingerprinting.</li>
          <li>No selling or sharing of any data with data brokers.</li>
          <li>No tracking of what pages you read across visits.</li>
        </ul>
      </Section>

      <Section title="What's stored, and why">
        <p>
          A couple of interactive features (liking a page, sending feedback)
          need just enough state to work and to stop abuse. Here&apos;s
          exactly what that is:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-medium text-text-primary">In your browser</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
              <li>
                <span className="font-mono text-xs text-violet">theme</span> —
                your light/dark preference, in <code className="text-xs">localStorage</code>.
              </li>
              <li>
                <span className="font-mono text-xs text-violet">visitor-id</span> —
                a random UUID generated on your device, in{" "}
                <code className="text-xs">localStorage</code>. Not a
                fingerprint — it carries no information about you, and
                clearing site data simply issues a new one.
              </li>
            </ul>
            <p className="mt-2 text-sm">
              Neither ever leaves your browser except to our own API — never
              to a third party.
            </p>
          </Card>
          <Card>
            <h3 className="font-medium text-text-primary">On our server</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
              <li>Page likes — which page, and an aggregate count. One like per visitor per page.</li>
              <li>Feedback — the page it was left on, a rating and/or comment, and an email only if you choose to give one (so we can reply).</li>
            </ul>
            <p className="mt-2 text-sm">
              To stop spam, both are paired with a salted SHA-256 hash of your
              IP address and browser user-agent — never the raw values. The
              hash can&apos;t be reversed back into your IP.
            </p>
          </Card>
        </div>
        <p>
          None of this is used for advertising, profiling, or anything beyond
          making the like button and feedback form work as intended.
        </p>
      </Section>

      <Section title="Hosting">
        <p>
          nullbase is hosted on Cloudflare, under{" "}
          <Link
            href="https://www.cloudflare.com/privacypolicy/"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare&apos;s own privacy policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Advertising (Google AdSense)">
        <p>
          nullbase shows ads served by Google AdSense to help cover hosting
          costs. Google and its advertising partners may use cookies and
          similar identifiers to serve ads — including ads based on your
          visits to this and other sites — and to measure ad performance.
          nullbase does not control this and doesn&apos;t receive any of the
          data Google collects for it.
        </p>
        <p>
          You can see and adjust how Google personalizes ads at{" "}
          <Link
            href="https://adssettings.google.com"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </Link>
          , or opt out of personalized advertising generally at{" "}
          <Link
            href="https://www.aboutads.info/choices/"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </Link>
          . Full detail on how Google uses data from sites that use its
          services is in{" "}
          <Link
            href="https://policies.google.com/technologies/ads"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Advertising Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Clear your browser&apos;s local storage at any time to reset your theme preference and visitor ID — nothing on our side is tied to you by name or account.</li>
          <li>Ask us to delete feedback you submitted with an email address by writing to the contact below.</li>
          <li>Use the ad-personalization controls linked above at any time.</li>
        </ul>
      </Section>

      <Section title="Children's privacy">
        <p>
          nullbase is a technical reference and is not directed at children.
          We do not knowingly collect data from anyone under 13.
        </p>
      </Section>

      <Section title="Changes to this page">
        <p>
          If what nullbase stores or how it uses ads changes, this page will
          be updated and the date at the top will change accordingly.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this page, or a data-deletion request:{" "}
          <Link
            href="mailto:support@nullbase.wiki"
            className="font-mono text-electric-blue hover:underline"
          >
            support@nullbase.wiki
          </Link>
        </p>
      </Section>
    </div>
  );
}
