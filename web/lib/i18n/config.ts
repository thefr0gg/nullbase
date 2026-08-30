/**
 * The single place a supported language is registered. Adding a language is
 * one entry here + a `content/<locale>/` tree (see `lib/content/loader.ts`)
 * + a dictionary file (see `lib/i18n/dictionaries/`) — no routing or
 * component changes required.
 */
export const locales = ["en", "fr", "ar", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export interface LocaleMeta {
  /** Native-language display name, shown in the language switcher. */
  label: string;
  dir: "ltr" | "rtl";
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: "English", dir: "ltr" },
  fr: { label: "Français", dir: "ltr" },
  ar: { label: "العربية", dir: "rtl" },
  es: { label: "Español", dir: "ltr" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
