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
export interface Dictionary {
  nav: {
    tagline: string;
    openNavigation: string;
    closeNavigation: string;
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
  };
  pageFooter: {
    next: string;
  };
  stepFlow: {
    previous: string;
    next: string;
  };
  notFound: {
    badge: string;
    heading: string;
    description: string;
    responseLabel: string;
    backToHome: string;
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
  };
}
