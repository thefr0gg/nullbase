export {};

/**
 * `@next/mdx` ships no TypeScript types (see its `package.json`).
 * This ambient declaration keeps `next.config.ts` type-safe so `next build`'s
 * type-check pass does not fail on the untyped import.
 *
 * Shape inferred from `@next/mdx/index.js`:
 *   module.exports = (pluginOptions = {}) => (inputConfig = {}) => nextConfig
 */
declare module "@next/mdx" {
  interface MDXPluginOptions {
    extension?: RegExp;
    options?: Record<string, unknown>;
  }

  const createMDX: (options?: MDXPluginOptions) => (
    config?: import("next").NextConfig,
  ) => import("next").NextConfig;

  export default createMDX;
}
