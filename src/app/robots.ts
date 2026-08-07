import type { MetadataRoute } from "next";

/**
 * SEO metadata foundation (Milestone 10, Phase 2). Disallows the
 * authenticated portal from being indexed — search engines have no
 * reason to crawl anything behind /login, per ADR-002's public/
 * authenticated rendering split.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/student", "/faculty", "/program-director", "/admin", "/dashboard"],
    },
  };
}
