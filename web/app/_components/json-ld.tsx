/**
 * Renders one `<script type="application/ld+json">` block. `data` is always
 * an object this codebase built itself (see `lib/seo/structured-data.ts`),
 * never raw user input — but `<` is still escaped in the serialized JSON so
 * a stray value (e.g. a page title containing `</script>`) can never break
 * out of the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
