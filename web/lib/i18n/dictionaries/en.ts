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
};
