// Fetches dog data directly via the Supabase REST API (not the supabase-js
// client) so it can run during `next build` for generateStaticParams,
// generateMetadata, and the sitemap -- all outside any React render tree.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface BuildTimeDog {
  slug: string;
  name?: string;
  description?: string | null;
  updated_at?: string;
}

export async function fetchDogsForBuild(slug?: string): Promise<BuildTimeDog[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const query = slug
    ? `slug=eq.${encodeURIComponent(slug)}&status=in.(published,pending,adopted)&select=name,slug,description,updated_at`
    : `status=in.(published,pending,adopted)&select=slug,updated_at`;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/dogs?${query}`, {
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
