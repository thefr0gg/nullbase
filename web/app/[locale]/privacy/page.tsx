import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Card } from "@/app/_components/ui";
import { slugToHref } from "@/lib/content/meta";
import { type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  return {
    title: dict.privacy.heading,
    description: dict.privacy.intro,
    alternates: {
      canonical: `${slugToHref(locale, [])}/privacy`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

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

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = getDictionary(locale).privacy;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <Badge color="blue" className="w-fit">
          {t.badge}
        </Badge>
        <h1 className="text-3xl font-semibold text-text-primary">{t.heading}</h1>
        <p className="max-w-xl text-text-secondary">{t.intro}</p>
        <p className="text-sm text-text-secondary">
          {t.lastUpdatedLabel} <span className="font-mono">{LAST_UPDATED}</span>
        </p>
      </header>

      <Card className="border-l-4 border-l-electric-blue">
        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-text-primary" dir="ltr">
          <span className="text-electric-blue">$</span> curl -I https://nullbase.wiki
          {"\n"}
          <span className="text-text-secondary">{t.terminalComment}</span>
        </pre>
      </Card>

      <Section title={t.neverDoes.title}>
        <ul className="list-disc space-y-1.5 ps-5">
          {t.neverDoes.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.stored.title}>
        <p>{t.stored.intro}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-medium text-text-primary">{t.stored.browserTitle}</h3>
            <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm">
              <li>
                <span className="font-mono text-xs text-violet" dir="ltr">
                  theme
                </span>{" "}
                — {t.stored.themeItem}
              </li>
              <li>
                <span className="font-mono text-xs text-violet" dir="ltr">
                  visitor-id
                </span>{" "}
                — {t.stored.visitorIdItem}
              </li>
            </ul>
            <p className="mt-2 text-sm">{t.stored.browserFooter}</p>
          </Card>
          <Card>
            <h3 className="font-medium text-text-primary">{t.stored.serverTitle}</h3>
            <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm">
              <li>{t.stored.likesItem}</li>
              <li>{t.stored.feedbackItem}</li>
            </ul>
            <p className="mt-2 text-sm">{t.stored.serverFooter}</p>
          </Card>
        </div>
        <p>{t.stored.outro}</p>
      </Section>

      <Section title={t.hosting.title}>
        <p>
          {t.hosting.before}{" "}
          <Link
            href="https://www.cloudflare.com/privacypolicy/"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.hosting.linkText}
          </Link>
          {t.hosting.after}
        </p>
      </Section>

      <Section title={t.advertising.title}>
        <p>{t.advertising.p1}</p>
        <p>
          {t.advertising.p2Before}{" "}
          <Link
            href="https://adssettings.google.com"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.advertising.linkAdsSettings}
          </Link>
          {t.advertising.p2Mid1}{" "}
          <Link
            href="https://www.aboutads.info/choices/"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.advertising.linkAboutAds}
          </Link>
          {t.advertising.p2Mid2}{" "}
          <Link
            href="https://policies.google.com/technologies/ads"
            className="text-electric-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.advertising.linkAdPolicy}
          </Link>
          {t.advertising.p2After}
        </p>
      </Section>

      <Section title={t.choices.title}>
        <ul className="list-disc space-y-1.5 ps-5">
          {t.choices.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.children.title}>
        <p>{t.children.text}</p>
      </Section>

      <Section title={t.changes.title}>
        <p>{t.changes.text}</p>
      </Section>

      <Section title={t.contact.title}>
        <p>
          {t.contact.before}{" "}
          <Link
            href="mailto:support@nullbase.wiki"
            className="font-mono text-electric-blue hover:underline"
            dir="ltr"
          >
            support@nullbase.wiki
          </Link>
        </p>
      </Section>
    </div>
  );
}
