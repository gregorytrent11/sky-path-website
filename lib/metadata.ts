import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Next.js does NOT deep-merge `openGraph`/`twitter` from parent metadata --
// a route that sets its own `title`/`description` but no `openGraph` still
// inherits the ROOT layout's static openGraph object wholesale, so shared
// links for every page would show the homepage's title/description. This
// keeps each page's social card in sync with its actual title/description
// without repeating the openGraph/twitter boilerplate on every page.
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
    },
    twitter: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
    },
  };
}
