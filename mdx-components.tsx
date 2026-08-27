import type { ComponentProps } from "react";
import HttpRequest from "@/components/http/HttpRequest";
import StatusCodeExplorer from "@/components/http/StatusCodeExplorer";

/**
 * Global component map for `@next/mdx` (App Router reads this file automatically
 * via the `providerImportSource` alias configured by `@next/mdx`).
 *
 * Maps Markdown/HTML elements to themed, palette-aware React components so the
 * generated MDX content inherits the site's visual language — no external
 * typography plugin required.
 *
 * Custom interactive playgrounds are registered here too, so any `.mdx` doc can
 * drop `<HttpRequest />` / `<StatusCodeExplorer />` with zero imports.
 */
export const components = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      {...props}
      className="mt-8 text-3xl font-bold text-text-primary first:mt-0"
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      {...props}
      className="mt-8 text-2xl font-semibold text-text-primary first:mt-0"
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      {...props}
      className="mt-6 text-xl font-semibold text-text-primary first:mt-0"
    />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4
      {...props}
      className="mt-5 text-lg font-medium text-text-primary first:mt-0"
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p {...props} className="mb-4 text-text-primary last:mb-0" />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      {...props}
      className="font-medium text-electric-blue underline underline-offset-2 hover:text-tangerine transition-colors"
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul {...props} className="mb-4 ml-6 list-disc text-text-primary" />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol {...props} className="mb-4 ml-6 list-decimal text-text-primary" />
  ),
  li: (props: ComponentProps<"li">) => (
    <li {...props} className="mb-1" />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="border-l-4 border-electric-blue pl-4 italic text-text-secondary"
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      {...props}
      className="my-4 overflow-x-auto rounded-xl border border-border bg-surface p-4 text-sm text-text-primary"
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      {...props}
      className="rounded-md bg-surface/70 px-1.5 py-0.5 font-mono text-xs text-electric-blue"
    />
  ),
  table: (props: ComponentProps<"table">) => (
    <table {...props} className="my-4 w-full border-collapse text-sm" />
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      {...props}
      className="border-b border-border bg-surface/60 px-3 py-1.5 text-left align-top font-semibold"
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td {...props} className="border-b border-border px-3 py-1.5 align-top" />
  ),
  hr: (props: ComponentProps<"hr">) => (
    <hr {...props} className="my-6 border-0 border-border" />
  ),
  img: (props: ComponentProps<"img">) => (
    <img
      {...props}
      className="my-4 max-w-full rounded-xl border border-border"
    />
  ),

  // Interactive playgrounds
  HttpRequest,
  StatusCodeExplorer,
};

export function useMDXComponents() {
  return components;
}
