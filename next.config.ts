import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow `.md` / `.mdx` to be treated as routes/imports via @next/mdx.
  pageExtensions: ["js", "jsx", "mjs", "ts", "tsx", "md", "mdx"],
  // Content is fully static; prerender everything at build time.
  // The content loader uses `node:fs`, so we keep the `nodejs` runtime
  // (set per-route in the dynamic page + API routes).
};

const withMDX = createMDX({
  options: {
    // String-form plugin names are safe for both the Webpack and Turbopack
    // build engines (Turbopack cannot accept JS-function plugin options).
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
