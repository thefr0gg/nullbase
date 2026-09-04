/**
 * UI chrome strings — everything typed directly into a component rather
 * than sourced from `.mdx` frontmatter/body. Kept separate from content
 * (`lib/content/*`) on purpose: content is per-page and lives next to the
 * page it describes, chrome is site-wide and lives here once per locale.
 *
 * This is not a word-by-word translation function — each locale supplies
 * its own complete, hand-authored copy of every string (see
 * `dictionaries/*.ts`). A stub locale currently mirrors `en.ts` verbatim
 * until it gets real localized copy.
 *
 * Every value is plain data (strings, or `{token}`-templated strings — see
 * `lib/i18n/format.ts`), never a function: a dictionary is passed as a prop
 * from Server Components straight into Client Components (`<SearchBar>`,
 * `<LanguageSwitcher>`, ...), and function values can't cross that
 * server/client boundary.
 */
import type { FeedbackType } from "../feedback-types";

export interface Dictionary {
  nav: {
    openNavigation: string;
    closeNavigation: string;
    /** `{title}` */
    collapseNode: string;
    /** `{title}` */
    expandNode: string;
  };
  search: {
    /** `{topic}` */
    placeholderTopic: string;
    placeholderGeneric: string;
    placeholderDisabled: string;
    /** `{query}` */
    noResults: string;
  };
  theme: {
    enableDark: string;
    enableLight: string;
  };
  language: {
    switchLanguage: string;
    notTranslatedYet: string;
  };
  footer: {
    tagline: string;
    privacy: string;
    developer: string;
  };
  pageFooter: {
    next: string;
  };
  stepFlow: {
    previous: string;
    next: string;
    play: string;
    pause: string;
    /** `{current}`, `{total}` */
    stepOf: string;
    defaultTitle: string;
    stepsAriaLabel: string;
    /** `{n}`, `{title}` */
    stepAriaLabel: string;
  };
  requestPlayground: {
    targetLabelEndpoint: string;
    targetLabelWebhook: string;
    targetLabelDefault: string;
    targetLabelRpc: string;
    defaultTitleHttp: string;
    /** `{protocol}` */
    defaultTitleProtocol: string;
    send: string;
    sending: string;
    headersLabel: string;
    headersPlaceholder: string;
    queryLabel: string;
    bodyLabel: string;
    bodyPlaceholderGraphql: string;
    bodyPlaceholderRpc: string;
    bodyPlaceholderDefault: string;
    variablesLabel: string;
    paramsLabel: string;
    responseLabel: string;
    tabBody: string;
    /** `{count}` */
    tabHeaders: string;
    copy: string;
    copied: string;
    copyCurl: string;
    emptyBody: string;
    noHeaders: string;
    wsDefaultTitle: string;
    wsConnecting: string;
    wsReconnect: string;
    wsConnect: string;
    sent: string;
    received: string;
    sseDefaultTitle: string;
    sseConnecting: string;
    sseReconnect: string;
    sseConnect: string;
    sseWaiting: string;
  };
  interactive: {
    simulated: string;
  };
  diagramExplorer: {
    defaultTitle: string;
    closeDetail: string;
  };
  stateMachine: {
    defaultTitle: string;
    currentStateLabel: string;
    reset: string;
    step: string;
    /** `{from}`, `{to}` */
    transitionAriaLabel: string;
  };
  codePlayground: {
    run: string;
    running: string;
    reset: string;
    copy: string;
    copied: string;
    outputLabel: string;
    errorLabel: string;
    languageLabel: string;
    comingSoon: string;
    loadingSandbox: string;
    timeoutError: string;
    emptyOutput: string;
  };
  exercise: {
    submit: string;
    retry: string;
    showAnswer: string;
    correct: string;
    incorrect: string;
    yourOrderLabel: string;
    correctOrderLabel: string;
    bankLabel: string;
    emptyAnswer: string;
  };
  predictOutput: {
    submit: string;
    retry: string;
    correct: string;
    incorrect: string;
    actualOutputLabel: string;
    explanationLabel: string;
  };
  terminal: {
    inputAriaLabel: string;
    reset: string;
    hint: string;
    commandNotFound: string;
    exerciseComplete: string;
  };
  underTheHood: {
    showMore: string;
    showLess: string;
  };
  glossary: {
    learnMore: string;
    closeDefinition: string;
  };
  pageActions: {
    /** Shared by the Like and Feedback cards' rate-limit cooldown display. */
    cooldown: {
      /** `{m}` */
      minutes: string;
      /** `{s}` */
      seconds: string;
    };
    like: {
      like: string;
      liked: string;
      loadingCount: string;
      /** `{count}` — CLDR plural forms, see `lib/i18n/format.ts`'s `pluralize`. */
      countSuffix: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
      genericError: string;
      retryError: string;
      retry: string;
    };
    feedback: {
      openButton: string;
      openSubtitle: string;
      modalTitle: string;
      close: string;
      ratingAriaLabel: string;
      /** `{count}` — CLDR plural forms, see above. */
      starAriaLabel: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
      ratingOptional: string;
      /** `{rating}` */
      ratingValue: string;
      typeAriaLabel: string;
      typePlaceholder: string;
      commentPlaceholder: string;
      wordCountLabel: string;
      /** `{count}` */
      wordCountSuffix: string;
      emailPlaceholder: string;
      ratingOrCommentRequired: string;
      commentTooLong: string;
      genericError: string;
      thanksBadge: string;
      thanksBody: string;
      sending: string;
      retry: string;
      send: string;
      cancel: string;
    };
    /** Translated labels for every `FeedbackType` — public-site-only; the
     *  admin panel keeps using `lib/feedback-types.ts`'s own neutral
     *  `FEEDBACK_TYPE_LABELS` since it's an English-only internal tool. */
    feedbackTypes: Record<FeedbackType, string>;
  };
  notFound: {
    badge: string;
    heading: string;
    description: string;
    responseLabel: string;
    backToHome: string;
    statusBadge: string;
    jsonError: string;
    jsonMessage: string;
  };
  home: {
    heroLead: string;
    heroCode: string;
    heroSubtext: string;
    /** `{topic}` */
    startWith: string;
    /** `{count}` — CLDR plural forms, see `lib/i18n/format.ts`'s `pluralize`.
     *  `other` is required; a locale may add `zero`/`one`/`two`/`few`/`many`
     *  as needed (e.g. Arabic uses all six). */
    pagesAndCounting: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
    browseByTopic: string;
    /** `{topic}` */
    explore: string;
    comingSoon: string;
    /** `{count}` — CLDR plural forms, see above. */
    pageCount: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
    /** The 15-entry planned-topic roadmap shown in "Coming soon" — order
     *  must match `PLANNED_CATEGORIES` in `app/[locale]/page.tsx`, and each
     *  entry must exactly match (case-insensitively) that topic's actual
     *  translated content title once it's built, so the "already built"
     *  filter keeps working per locale. */
    plannedCategories: string[];
  };
  privacy: {
    badge: string;
    heading: string;
    intro: string;
    lastUpdatedLabel: string;
    terminalComment: string;
    neverDoes: { title: string; items: [string, string, string, string, string] };
    stored: {
      title: string;
      intro: string;
      browserTitle: string;
      themeItem: string;
      visitorIdItem: string;
      browserFooter: string;
      serverTitle: string;
      likesItem: string;
      feedbackItem: string;
      serverFooter: string;
      outro: string;
    };
    hosting: { title: string; before: string; linkText: string; after: string };
    advertising: {
      title: string;
      p1: string;
      p2Before: string;
      linkAdsSettings: string;
      p2Mid1: string;
      linkAboutAds: string;
      p2Mid2: string;
      linkAdPolicy: string;
      p2After: string;
    };
    choices: { title: string; items: [string, string, string] };
    children: { title: string; text: string };
    changes: { title: string; text: string };
    contact: { title: string; before: string };
  };
}
