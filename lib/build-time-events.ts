// Fetches event data directly via the Supabase REST API (not the supabase-js
// client) so it can run during `next build` for generateStaticParams,
// generateMetadata, and the sitemap -- all outside any React render tree.
// Mirrors lib/build-time-dogs.ts.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface BuildTimeEvent {
  slug: string;
  title?: string;
  summary?: string | null;
  updated_at?: string;
}

export async function fetchEventsForBuild(slug?: string): Promise<BuildTimeEvent[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const query = slug
    ? `slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,slug,summary,updated_at`
    : `status=eq.published&select=slug,updated_at`;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events?${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
