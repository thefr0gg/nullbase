/**
 * Regenerates the individual HTTP status code leaf pages
 * (`content/en/web-fundamentals/http/status-codes/<code>.mdx`) from
 * `status-codes-data.ts`. Run via `npm run content:status-codes` whenever an
 * entry in that table changes, or a new one is added — never hand-edit the
 * generated .mdx files directly, edit the data table instead.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { statusCodes, type StatusCodeEntry } from "./status-codes-data";

const OUT_DIR = join(
  __dirname,
  "..",
  "content",
  "en",
  "web-fundamentals",
  "http",
  "status-codes",
);

function renderMistakes(mistakes: StatusCodeEntry["mistakes"]): string {
  if (mistakes.length === 0) return "";
  const items = mistakes
    .map((m) => `**Avoid:** ${m.avoid} — ${m.because}`)
    .join("\n\n");
  return `\n## Common Mistakes\n\n${items}\n`;
}

function renderSeeAlso(seeAlso: StatusCodeEntry["seeAlso"]): string {
  const items = seeAlso
    .map((s) => `- **[${s.label}](${s.href})**${s.note ? ` — ${s.note}` : ""}`)
    .join("\n");
  return `## See Also\n\n${items}\n`;
}

function renderPage(entry: StatusCodeEntry): string {
  const frontmatter = [
    "---",
    `title: "${entry.code} ${entry.name}"`,
    `description: ${entry.description}`,
    "category: HTTP",
    `weight: ${entry.weight}`,
    "interactive: true",
    'interactiveType: ["ItemExplorer"]',
    "---",
  ].join("\n");

  const intro = `The \`${entry.code} ${entry.name}\` response status code indicates that **${entry.definition}**.${
    entry.definitionFollowup ? ` ${entry.definitionFollowup}` : ""
  }`;

  const sections = [
    frontmatter,
    "",
    intro,
    "",
    `<StatusCodeExplorer defaultCode={${entry.code}} />`,
    "",
    "## Details",
    "",
    entry.details.map((d) => `- ${d}`).join("\n"),
    "",
    "## Example",
    "",
    "```http",
    entry.example,
    "```",
  ];

  if (entry.extra) {
    sections.push("", entry.extra);
  }

  const mistakes = renderMistakes(entry.mistakes);
  if (mistakes) sections.push("", mistakes.trim());

  sections.push("", renderSeeAlso(entry.seeAlso).trim());

  return sections.join("\n") + "\n";
}

for (const entry of statusCodes) {
  const path = join(OUT_DIR, `${entry.code}.mdx`);
  writeFileSync(path, renderPage(entry), "utf-8");
  console.log(`wrote ${path}`);
}
