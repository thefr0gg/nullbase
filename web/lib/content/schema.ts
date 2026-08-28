import { z } from "zod";

/**
 * Zod schema for the YAML frontmatter of every content page.
 * Adding a new topic/collection only ever requires adding more `.mdx` files
 * whose frontmatter validates against this shape.
 */
export const PageFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  weight: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
  interactive: z.boolean().optional().default(false),
  interactiveType: z
    .enum(["http-request", "status-explorer", "headers-playground"])
    .optional(),
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
