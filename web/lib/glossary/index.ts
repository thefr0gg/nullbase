import type { Locale } from "@/lib/i18n/config";
import type { GlossaryMap } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";
import { es } from "./es";

export const glossaries: Record<Locale, GlossaryMap> = { en, fr, ar, es };

export type { GlossaryEntry, GlossaryMap } from "./types";
