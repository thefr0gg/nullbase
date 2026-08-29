import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required by `output: "export"` — without it, Next treats this route as
// potentially dynamic and refuses to prerender it into a static file.
export const dynamic = "force-static";

/** Statically generated at build time into a plain `robots.txt`. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
