import { describe, expect, it } from "vitest";
import { glossaries } from "./index";

describe("glossaries", () => {
  it("has an entry for every configured locale", () => {
    expect(Object.keys(glossaries).sort()).toEqual(["ar", "en", "es", "fr"]);
  });

  it("English has a real definition for a common term", () => {
    expect(glossaries.en.tcp?.term).toBe("TCP");
    expect(glossaries.en.tcp?.definition.length).toBeGreaterThan(0);
  });

  it("a locale without translations yet returns no entry (component should fail open)", () => {
    expect(glossaries.fr.tcp).toBeUndefined();
  });
});
