import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Everything public is crawlable; only the admin portal (which also carries
// a noindex meta tag, see app/admin/layout.tsx) is kept out of search.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skyspath.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
