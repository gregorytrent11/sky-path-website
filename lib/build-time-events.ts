// Fetches event data directly via the Supabase REST API (not the supabase-js
// client) so it can run during `next build` for generateStaticParams,
// generateMetadata, and the sitemap -- all outside any React render tree.
// Mirrors lib/build-time-dogs.ts, which owns the shared `restGet` and explains
// why it deliberately avoids Next's patched `fetch`.

import { restGet } from "@/lib/build-time-dogs";

export interface BuildTimeEvent {
  slug: string;
  title?: string;
  summary?: string | null;
  updated_at?: string;
}

export async function fetchEventsForBuild(slug?: string): Promise<BuildTimeEvent[]> {
  const query = slug
    ? `slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,slug,summary,updated_at`
    : `status=eq.published&select=slug,updated_at`;
  return restGet<BuildTimeEvent>("events", query);
}
