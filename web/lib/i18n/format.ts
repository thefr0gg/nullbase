/**
 * Tiny `{token}` substitution — used instead of function-valued dictionary
 * entries (e.g. `placeholderTopic: (topic) => ...`) because a Server
 * Component passing a dictionary prop to a Client Component (`<SearchBar>`,
 * `<LanguageSwitcher>`, ...) needs that prop to be plain, serializable data;
 * functions can't cross that boundary. Every dictionary stays JSON-shaped
 * as a result.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

/** CLDR plural-category selection via the built-in `Intl.PluralRules`
 *  (correct beyond simple one/other for languages like Arabic once they
 *  have real translations — not just a `count === 1` check). */
export function pluralize(
  locale: string,
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return format(template, { count });
}
