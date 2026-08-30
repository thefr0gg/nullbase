import { z } from "zod";

/**
 * Zod schema for the YAML frontmatter of every content page.
 * Adding a new topic/collection only ever requires adding more `.mdx` files
 * whose frontmatter validates against this shape.
 */
export const PageFrontmatterSchema = z.object({
  title: z.string(),
  // Required: every page's meta description and social-share summary
  // comes straight from this, so a page without one would silently ship
  // thin/generic metadata instead of failing the build.
  description: z.string().min(1),
  category: z.string().optional(),
  weight: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
  interactive: z.boolean().optional().default(false),
  /**
   * Names of the interactive primitives (from
   * web/components/interactive/registry.ts) used on this page, e.g.
   * `["StepFlow", "Quiz"]`. Hand-written per page — not derived by scanning
   * the .mdx body, which would be fragile. Foundation for a future
   * "has an interactive demo" filter/badge; not consumed at render time.
   */
  interactiveType: z.array(z.string()).optional().default([]),
  toc: z.boolean().optional().default(true),
});

export type PageFrontmatter = z.infer<typeof PageFrontmatterSchema>;

export interface CollectedPage {
  /** URL slug segments, e.g. `["http", "methods", "get"]` */
  slug: string[];
  /** Validated frontmatter for the page. */
  frontmatter: PageFrontmatter;
  /** Path to the source `.mdx` relative to `/content`, no extension, `/`-joined. */
  fileRel: string;
}
