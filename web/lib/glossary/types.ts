export interface GlossaryEntry {
  term: string;
  definition: string;
  /** A locale-relative path to the corresponding reference page, e.g. "/en/networking/tcp". */
  href?: string;
}

export type GlossaryMap = Record<string, GlossaryEntry>;
