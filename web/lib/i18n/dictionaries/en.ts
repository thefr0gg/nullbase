import type { Dictionary } from "../types";

export const en: Dictionary = {
  nav: {
    tagline: "developer reference",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
  },
  search: {
    placeholderTopic: "Search {topic}…",
    placeholderGeneric: "Search topics…",
    placeholderDisabled: "Search unavailable on this page",
    noResults: 'No results for "{query}".',
  },
  theme: {
    enableDark: "Enable dark mode",
    enableLight: "Enable light mode",
  },
  language: {
    switchLanguage: "Change language",
    notTranslatedYet: "Not translated yet",
  },
  footer: {
    tagline: "nullbase — building the developer reference, one spec at a time.",
    privacy: "Privacy",
  },
  pageFooter: {
    next: "Next",
  },
  stepFlow: {
    previous: "Previous",
    next: "Next",
  },
  notFound: {
    badge: "4xx Client Error",
    heading: "Not Found",
    description:
      "The server did not find a current representation for the target resource — the page you're looking for doesn't exist here.",
    responseLabel: "Response",
    backToHome: "Back to home",
  },
  home: {
    heroLead: "Look it up. See it",
    heroCode: "work()",
    heroSubtext:
      "Every entry pairs a plain-language explanation with something you can actually poke at — a request you can send, a handshake you can step through, a header you can build. No account, no tracking, no fluff.",
    startWith: "Start with {topic}",
    pagesAndCounting: { one: "{count} page and counting", other: "{count} pages and counting" },
    browseByTopic: "Browse by topic",
    explore: "Explore {topic}",
    comingSoon: "Coming soon",
    pageCount: { one: "{count} page", other: "{count} pages" },
  },
  privacy: {
    badge: "Privacy",
    heading: "How nullbase handles your data",
    intro:
      "The short version: there are no accounts, no analytics, and no fingerprinting. This page lays out, in plain terms, the handful of things the site does store and why — plus what Google AdSense does on its own.",
    lastUpdatedLabel: "Last updated:",
    terminalComment: "# no Set-Cookie, no login, no tracker script — just the page.",
    neverDoes: {
      title: "What nullbase never does",
      items: [
        "No user accounts, sign-up, or login for visitors.",
        "No analytics or telemetry scripts (no Google Analytics, no Meta Pixel, no session replay).",
        "No device or browser fingerprinting.",
        "No selling or sharing of any data with data brokers.",
        "No tracking of what pages you read across visits.",
      ],
    },
    stored: {
      title: "What's stored, and why",
      intro:
        "A couple of interactive features (liking a page, sending feedback) need just enough state to work and to stop abuse. Here's exactly what that is:",
      browserTitle: "In your browser",
      themeItem: "your light/dark preference, in localStorage.",
      visitorIdItem:
        "a random UUID generated on your device, in localStorage. Not a fingerprint — it carries no information about you, and clearing site data simply issues a new one.",
      browserFooter: "Neither ever leaves your browser except to our own API — never to a third party.",
      serverTitle: "On our server",
      likesItem: "Page likes — which page, and an aggregate count. One like per visitor per page.",
      feedbackItem:
        "Feedback — the page it was left on, a rating and/or comment, and an email only if you choose to give one (so we can reply).",
      serverFooter:
        "To stop spam, both are paired with a salted SHA-256 hash of your IP address and browser user-agent — never the raw values. The hash can't be reversed back into your IP.",
      outro:
        "None of this is used for advertising, profiling, or anything beyond making the like button and feedback form work as intended.",
    },
    hosting: {
      title: "Hosting",
      before: "nullbase is hosted on Cloudflare, under",
      linkText: "Cloudflare's own privacy policy",
      after: ".",
    },
    advertising: {
      title: "Advertising (Google AdSense)",
      p1: "nullbase shows ads served by Google AdSense to help cover hosting costs. Google and its advertising partners may use cookies and similar identifiers to serve ads — including ads based on your visits to this and other sites — and to measure ad performance. nullbase does not control this and doesn't receive any of the data Google collects for it.",
      p2Before: "You can see and adjust how Google personalizes ads at",
      linkAdsSettings: "Google Ads Settings",
      p2Mid1: ", or opt out of personalized advertising generally at",
      linkAboutAds: "aboutads.info",
      p2Mid2: ". Full detail on how Google uses data from sites that use its services is in",
      linkAdPolicy: "Google's Advertising Policy",
      p2After: ".",
    },
    choices: {
      title: "Your choices",
      items: [
        "Clear your browser's local storage at any time to reset your theme preference and visitor ID — nothing on our side is tied to you by name or account.",
        "Ask us to delete feedback you submitted with an email address by writing to the contact below.",
        "Use the ad-personalization controls linked above at any time.",
      ],
    },
    children: {
      title: "Children's privacy",
      text: "nullbase is a technical reference and is not directed at children. We do not knowingly collect data from anyone under 13.",
    },
    changes: {
      title: "Changes to this page",
      text: "If what nullbase stores or how it uses ads changes, this page will be updated and the date at the top will change accordingly.",
    },
    contact: {
      title: "Contact",
      before: "Questions about this page, or a data-deletion request:",
    },
  },
};
