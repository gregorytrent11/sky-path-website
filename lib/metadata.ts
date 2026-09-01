import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Next.js does NOT deep-merge `openGraph`/`twitter` from parent metadata --
// a route that sets its own `title`/`description` but no `openGraph` still
// inherits the ROOT layout's static openGraph object wholesale, so shared
// links for every page would show the homepage's title/description. This
// keeps each page's social card in sync with its actual title/description
// without repeating the openGraph/twitter boilerplate on every page.
//
// `path` is the route's public pathname (with trailing slash, matching
// next.config's `trailingSlash: true`). It becomes the page's canonical URL
// so search engines index exactly one URL per page, and the og:url so shared
// links point at the page rather than the homepage.
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
      url: path,
    },
    twitter: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
    },
  };
}
