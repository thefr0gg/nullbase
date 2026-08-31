import type { GlossaryMap } from "./types";

/** Not yet translated — `<GlossaryTerm>` fails open to plain text for any
 *  id missing from the active locale's map, so this is safe to ship empty
 *  until a translation pass covers it. */
export const fr: GlossaryMap = {};
