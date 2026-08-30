import type { Locale } from "../config";
import type { Dictionary } from "../types";
import { en } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";
import { es } from "./es";

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar, es };

/** Synchronous lookup — every dictionary is a plain static object, no
 *  per-locale bundle splitting/async loading needed at this site's size. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
