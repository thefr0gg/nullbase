import type { ComponentProps, ElementType, ReactNode } from "react";
import { Children, isValidElement } from "react";
import clsx from "clsx";
import { ArrowUpRight, ChevronDown, CircleAlert, Info, Lightbulb, TriangleAlert } from "lucide-react";

import { interactiveComponents } from "@/components/interactive/registry";
import { AtAGlance } from "@/components/interactive/AtAGlance";

/**
 * Global component map for `@next/mdx` (App Router `useMDXComponents`
 * convention — auto-discovered from this file's location, no MDXProvider).
 *
 * Every Markdown/HTML element renders through a `.mdx-*` class whose visual
 * language lives in `app/mdx.css`. This file only decides STRUCTURE (which
 * class, which wrapper, which data-attribute) — colors/spacing/shadows live
 * entirely in CSS so the whole system stays themeable from one place.
 *
 * `<blockquote>` is always a neutral quote — the only way to get a tinted,
 * iconed callout is the explicit `<Callout tone="..." title="...">`
 * component below (no text-sniffing of blockquote content).
 */

type CalloutTone = "note" | "tip" | "warning" | "important" | "danger";

const CALLOUT_ICONS: Record<CalloutTone, typeof Info> = {
  note: Info,
  tip: Lightbulb,
  warning: TriangleAlert,
  important: Lightbulb,
  danger: CircleAlert,
};

function getAttr(props: object, key: string): unknown {
  return (props as Record<string, unknown>)[key];
}

/** True only for fences rehype-pretty-code actually tokenized (tagged fences). */
function isShikiProcessed(props: object): boolean {
  return typeof getAttr(props, "data-theme") === "string";
}

/* ------------------------------------------------------------------ */
/* Headings — permalink anchor when rehype-slug supplies an `id`        */
/* ------------------------------------------------------------------ */

function Heading({
  as,
  id,
  children,
  className,
  ...props
}: { as: ElementType; id?: string } & ComponentProps<"h2">) {
  const Tag = as as ElementType;
  const showAnchor = id != null && as !== "h1";
  return (
    <Tag id={id} className={className} {...props}>
      <span className="mdx-heading-text">{children}</span>
      {showAnchor ? (
        <a
          href={`#${id}`}
          className="mdx-anchor"
          aria-label={typeof children === "string" ? `Jump to “${children}”` : "Jump to section"}
        >
          #
        </a>
      ) : null}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Code fences: distinguish plain fences from Shiki-tokenized ones      */
/* ------------------------------------------------------------------ */

function Pre(props: ComponentProps<"pre">) {
  if (isShikiProcessed(props)) {
    // Owned by the `figure` wrapper below — don't double-apply chrome.
    return <pre {...props} />;
  }
  return <pre {...props} className={clsx("mdx-pre-plain", props.className)} />;
}

function Code(props: ComponentProps<"code">) {
  if (isShikiProcessed(props)) return <code {...props} />;
  return <code {...props} className={clsx("mdx-code-inline", props.className)} />;
}

function Figure({ children, className, ...props }: ComponentProps<"figure">) {
  const first = Children.toArray(children)[0];
  const lang =
    isValidElement(first) && typeof getAttr(first.props as object, "data-language") === "string"
      ? (getAttr(first.props as object, "data-language") as string)
      : undefined;
  return (
    <figure {...props} className={clsx("mdx-figure", className)}>
      {lang ? <span className="mdx-code-lang">{lang}</span> : null}
      {children}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Details / summary — split summary out so the body gets its own box  */
/* ------------------------------------------------------------------ */

function Details({ children, ...props }: ComponentProps<"details">) {
  const kids = Children.toArray(children);
  const summaryIndex = kids.findIndex((k) => isValidElement(k) && (k.type as string) === "summary");
  const summary = summaryIndex >= 0 ? kids[summaryIndex] : null;
  const body = summaryIndex >= 0 ? [...kids.slice(0, summaryIndex), ...kids.slice(summaryIndex + 1)] : kids;
  return (
    <details {...props} className="mdx-details">
      {summary}
      <div className="mdx-details-body">{body}</div>
    </details>
  );
}

function Summary(props: ComponentProps<"summary">) {
  return (
    <summary {...props} className="mdx-summary">
      <span className="mdx-summary-text">{props.children}</span>
      <ChevronDown className="mdx-summary-chevron" aria-hidden="true" />
    </summary>
  );
}

/* ------------------------------------------------------------------ */
/* Component map                                                       */
/* ------------------------------------------------------------------ */

export const components = {
  h1: (props: ComponentProps<"h1">) => <Heading as="h1" {...props} className="mdx-h1" />,
  h2: (props: ComponentProps<"h2">) => <Heading as="h2" {...props} className="mdx-h2" />,
  h3: (props: ComponentProps<"h3">) => <Heading as="h3" {...props} className="mdx-h3" />,
  h4: (props: ComponentProps<"h4">) => <Heading as="h4" {...props} className="mdx-h4" />,
  h5: (props: ComponentProps<"h5">) => <Heading as="h5" {...props} className="mdx-h5" />,
  h6: (props: ComponentProps<"h6">) => <Heading as="h6" {...props} className="mdx-h6" />,

  p: (props: ComponentProps<"p">) => <p {...props} className="mdx-p" />,
  strong: (props: ComponentProps<"strong">) => <strong {...props} className="mdx-strong" />,
  em: (props: ComponentProps<"em">) => <em {...props} className="mdx-em" />,

  a: ({ href, children, ...props }: ComponentProps<"a">) => {
    const external = typeof href === "string" && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mdx-link"
        {...props}
      >
        {children}
        {external ? <ArrowUpRight className="mdx-link-ext" aria-hidden="true" /> : null}
      </a>
    );
  },

  code: Code,
  pre: Pre,
  figure: Figure,
  figcaption: (props: ComponentProps<"figcaption">) => (
    <figcaption {...props} className="mdx-figcaption" />
  ),

  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote {...props} className="mdx-blockquote" />
  ),

  ul: (props: ComponentProps<"ul">) => <ul {...props} className="mdx-ul" />,
  ol: (props: ComponentProps<"ol">) => <ol {...props} className="mdx-ol" />,
  li: (props: ComponentProps<"li">) => <li {...props} className="mdx-li" />,

  table: (props: ComponentProps<"table">) => (
    <div className="mdx-table-wrap">
      <div className="mdx-table-scroll scroll-shadow-x">
        <table {...props} className="mdx-table" />
      </div>
    </div>
  ),
  thead: (props: ComponentProps<"thead">) => <thead {...props} className="mdx-thead" />,
  tbody: (props: ComponentProps<"tbody">) => <tbody {...props} />,
  tr: (props: ComponentProps<"tr">) => <tr {...props} className="mdx-tr" />,
  th: (props: ComponentProps<"th">) => <th {...props} className="mdx-th" />,
  td: (props: ComponentProps<"td">) => <td {...props} className="mdx-td" />,

  hr: (props: ComponentProps<"hr">) => <hr {...props} className="mdx-hr" />,

  img: (props: ComponentProps<"img">) => <img alt={props.alt ?? ""} {...props} className="mdx-img" />,

  details: Details,
  summary: Summary,

  dl: (props: ComponentProps<"dl">) => <dl {...props} className="mdx-dl" />,
  dt: (props: ComponentProps<"dt">) => <dt {...props} className="mdx-dt" />,
  dd: (props: ComponentProps<"dd">) => <dd {...props} className="mdx-dd" />,

  kbd: (props: ComponentProps<"kbd">) => <kbd {...props} className="mdx-kbd" />,
  mark: (props: ComponentProps<"mark">) => <mark {...props} className="mdx-mark" />,

  // Explicit callout — the only way MDX content gets a tinted, iconed box:
  //   <Callout tone="tip" title="Why?">…</Callout>
  Callout,

  // Opt-in "at a glance" stat grid — authors place it explicitly:
  //   <AtAGlance items={[{ label: "Time", value: "O(log n)" }, ...]} />
  AtAGlance,
};

function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children?: ReactNode;
}) {
  const Icon = CALLOUT_ICONS[tone];
  return (
    <div className="mdx-callout" data-tone={tone} role="note">
      <Icon className="mdx-callout-icon" aria-hidden="true" />
      <div className="mdx-callout-body">
        {title ? <p className="mdx-callout-title">{title}</p> : null}
        <div className="mdx-callout-content">{children}</div>
      </div>
    </div>
  );
}

export function useMDXComponents() {
  return { ...components, ...interactiveComponents };
}
