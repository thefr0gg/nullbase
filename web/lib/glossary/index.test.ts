import { describe, expect, it } from "vitest";
import { glossaries } from "./index";
import { locales } from "@/lib/i18n/config";

describe("glossaries", () => {
  it("has an entry for every configured locale", () => {
    expect(Object.keys(glossaries).sort()).toEqual(["ar", "en", "es", "fr"]);
  });

  it("every locale has a real, non-empty definition for every term English defines", () => {
    for (const locale of locales) {
      for (const [id, entry] of Object.entries(glossaries.en)) {
        const localized = glossaries[locale][id];
        expect(localized, `${locale} is missing term "${id}"`).toBeDefined();
        expect(localized.term.length).toBeGreaterThan(0);
        expect(localized.definition.length).toBeGreaterThan(0);
        // A section that isn't itself translated yet (networking, security,
        // databases) should still link somewhere real — falling back to the
        // English page rather than a locale-prefixed path that 404s.
        if (entry.href) expect(localized.href).toBeTruthy();
      }
    }
  });

  it("a term missing entirely from a locale's map is simply absent (component should fail open)", () => {
    expect(glossaries.fr.doesNotExist).toBeUndefined();
  });
});
