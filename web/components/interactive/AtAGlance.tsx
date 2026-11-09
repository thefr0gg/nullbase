interface Item {
  label: string;
  value: string;
}

/**
 * Opt-in "things at a glance" stat grid for article pages (e.g. an
 * algorithm's time/space complexity, preconditions, return shape). Authors
 * place it explicitly in a page's .mdx body — the article template never
 * auto-injects it, since it's content-specific, not a generic page feature.
 * Static markup with no client JS, so it's registered directly in
 * mdx-components.tsx rather than through components/interactive/registry.tsx's
 * dynamic-import wrapping.
 */
export function AtAGlance({ items }: { items: Item[] }) {
  return (
    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1.5 rounded-2xl border border-border-strong bg-surface px-4 py-3.5"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-secondary">
            {item.label}
          </span>
          <span className="font-heading text-lg font-bold tracking-[-0.02em] text-text-primary">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
