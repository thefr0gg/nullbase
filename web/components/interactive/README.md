# Interactive component system

How MDX content on this site embeds runnable, clickable widgets instead of
static prose — and how to add a new one.

## Architecture

```
MDX (.mdx)
  │  <StepFlow steps={...} />, <CodePlayground .../>, ...
  ▼
registry.tsx            — every primitive, wrapped in next/dynamic
  ▼
mdx-components.tsx       — spreads the registry into every MDX page's tag map
```

- **One MDX tag per primitive.** There's no generic `<Interactive type="...">`
  wrapper — `<StepFlow>`, `<CodePlayground>`, `<GlossaryTerm>` etc. are each
  their own component, registered once in `registry.tsx`.
- **`registry.tsx` is the only integration point.** Adding a new topic page
  never touches it (compose an existing primitive with new data); only
  adding a genuinely new *kind* of widget does. Keep that rare.
- **Every primitive is lazy.** `registry.tsx` wraps each import in
  `next/dynamic`, so a page that never renders `InteractiveTerminal` never
  ships its JS. This is transparent to MDX authors — a `dynamic()` result is
  still a valid JSX tag.
- **Content is data, colocated with the page.** Anything beyond a couple of
  short props (step arrays, exercise items, a filesystem tree) lives in a
  `.ts`/`.tsx` file next to the `.mdx` page, imported with a relative path
  and typed against an interface the component exports. See
  `content/en/interactive-demos/*` for worked examples of every primitive.
- **Shared visual chrome lives in `_shared.tsx`.** `PlaygroundShell`,
  `PlaygroundSection`, `EyebrowLabel`, `DetailPanel`, `SimulatedTag`, `Ltr` —
  reuse these rather than hand-rolling a new look.
- **UI chrome text goes through the i18n dictionary**, content data doesn't.
  A primitive's button labels/aria strings are added to `Dictionary` in
  `lib/i18n/types.ts`, given real translations in all four
  `lib/i18n/dictionaries/*.ts` files, and threaded into `InteractiveDict` in
  `lib/i18n/step-flow-context.tsx` (plus the object literal built in
  `app/[locale]/[...slug]/page.tsx`) — MDX body content has no other way to
  reach a page's `Dictionary`. Author-supplied *content* (step text, exercise
  items, glossary definitions) stays out of the dictionary entirely; it's
  either colocated per-page data or, for genuinely cross-cutting terms, a
  small locale map like `lib/glossary/*.ts`.

## RTL / bidi

Arabic pages render with `dir="rtl"`, but a URL, header, command, or code
snippet must never mirror. Wrap any such value in `<Ltr>` (from
`_shared.tsx`) — it forces `dir="ltr"` and `unicode-bidi: isolate` regardless
of the page's direction. Every new primitive that displays technical text
does this; check for it in review the same way you'd check for a missing
`alt` attribute.

## Adding a new primitive

1. Write `MyThing.tsx` under this directory. `"use client"` unless it's
   genuinely static (like `UrlAnatomy`). Export a named `MyThingProps`
   interface for any data shape an author will need to type a colocated
   `.ts` file against.
2. Build it out of `_shared.tsx`'s primitives, not new one-off markup.
3. If it needs chrome strings, add a section to `Dictionary`
   (`lib/i18n/types.ts`), fill in all four dictionaries, and thread it
   through `InteractiveDict`.
4. Register it in `registry.tsx`: `MyThing: lazy(() => import("./MyThing"))`.
5. Use it from an `.mdx` file — no import needed, it's a global MDX tag.
6. If the underlying mechanism needs to plug into something pluggable later
   (a different execution backend, a different command interpreter), define
   a small interface for it (see `lib/execution/types.ts`,
   `lib/terminal/commands.ts`'s `CommandInterpreter`) rather than hardcoding
   the concrete implementation into the component.
7. Add a demo page under `content/en/interactive-demos/` so the system's own
   documentation stays a working example, not just a claim.
8. Write logic-level tests (`*.test.ts(x)` next to the file) for anything
   with real behavior to get wrong — state transitions, correctness
   checking, a command interpreter — not for pure layout.

## Security note: code execution

`CodePlayground` never executes anything in the main page context. JavaScript
runs inside a `sandbox="allow-scripts"` iframe with `allow-same-origin`
deliberately omitted (see `lib/execution/js-iframe-provider.ts`), so the
sandbox has no access to this site's cookies, DOM, or ambient-credentialed
network calls, and a fresh iframe is created and torn down per run. A future
language is a new `ExecutionProvider` registered in `lib/execution/providers.ts`
— never a change to how `CodePlayground` itself works.
