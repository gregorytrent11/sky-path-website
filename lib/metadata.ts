import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// Straight apostrophes in a <title> or <meta description> are escaped by React
// as `&#x27;`. That is valid HTML, but Google sometimes prints the escape
// literally in a search result ("Sky&#39;s Path to Home") instead of decoding
// it. A typographic apostrophe (U+2019) needs no escaping, so it reaches the
// search snippet as a real character. Google folds ’ and ' together when
// matching, so brand searches typed with a straight quote still match. On-page
// copy and the JSON-LD keep the plain apostrophe -- only the strings Google
// prints verbatim in a result go through this.
export function searchSafe(text: string): string {
  return text.replace(/'/g, "’");
}

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
  const pageTitle = searchSafe(title);
  const pageDescription = searchSafe(description);
  const socialTitle = searchSafe(`${title} | ${siteConfig.orgName}`);
  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description: pageDescription,
      url: path,
    },
    twitter: {
      title: socialTitle,
      description: pageDescription,
    },
  };
}
