import { getAllPages } from "./loader";

/** A node in the document sidebar, derived purely from the content tree. */
export interface SidebarNode {
  title: string;
  description?: string;
  href: string;
  slug: string[];
  weight: number;
  interactive: boolean;
  children: SidebarNode[];
}

export function slugToHref(slug: string[]): string {
  return slug.length === 0 ? "/" : "/" + slug.join("/");
}

/**
 * Return the page that follows `slug` in document order (depth-first through
 * the sidebar tree), or `null` if `slug` is the last page. Used to render the
 * "Next" navigation card at the bottom of each content page.
 */
export function getNextPage(slug: string[]): SidebarNode | null {
  const tree = getSidebarTree();
  const flat: SidebarNode[] = [];
  const walk = (nodes: SidebarNode[]) => {
    for (const n of nodes) {
      flat.push(n);
      walk(n.children);
    }
  };
  walk(tree);
  const idx = flat.findIndex(
    (n) => JSON.stringify(n.slug) === JSON.stringify(slug),
  );
  if (idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1];
}

/**
 * Build a nested sidebar tree from the flat list of content pages.
 * Adding a new category or page automatically appears here — no routing code
 * to maintain.
 */
export function getSidebarTree(): SidebarNode[] {
  const pages = getAllPages();
  const map = new Map<string, SidebarNode>();
  for (const p of pages) {
    map.set(JSON.stringify(p.slug), {
      title: p.frontmatter.title,
      description: p.frontmatter.description,
      href: slugToHref(p.slug),
      slug: p.slug,
      weight: p.frontmatter.weight ?? 0,
      interactive: !!p.frontmatter.interactive,
      children: [],
    });
  }

  const roots: SidebarNode[] = [];
  const bySlug = (s: string[]) => map.get(JSON.stringify(s));

  for (const node of map.values()) {
    const parentSlug = node.slug.slice(0, -1);
    if (parentSlug.length === 0) {
      roots.push(node);
    } else {
      const parent = bySlug(parentSlug);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }

  const sort = (nodes: SidebarNode[]) =>
    nodes.sort((a, b) => a.weight - b.weight || a.title.localeCompare(b.title));

  const build = (nodes: SidebarNode[]): SidebarNode[] => {
    sort(nodes);
    return nodes.map((n) => ({ ...n, children: build(n.children) }));
  };

  return build(roots);
}
