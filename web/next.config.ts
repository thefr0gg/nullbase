import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits plain HTML/CSS/JS into `out/`,
  // deployable to any static host (GitHub Pages, Netlify, Cloudflare, S3...).
  output: "export",
  // Emit `out/<route>/index.html` for every page so topic URLs resolve on
  // static hosts without rewrite rules (`/http` -> `/http/index.html`).
  trailingSlash: true,
  // Allow `.md` / `.mdx` to be treated as routes/imports via @next/mdx.
  pageExtensions: ["js", "jsx", "mjs", "ts", "tsx", "md", "mdx"],
  // The interactive playgrounds simulate responses in the browser (there is
  // no server in a static export), so the content loader only runs at build
  // time where `node:fs` is available.
};

const withMDX = createMDX({
  options: {
    // String-form plugin names are safe for both the Webpack and Turbopack
    // build engines (Turbopack cannot accept JS-function plugin options).
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
