import type { Metadata } from "next";
import DogDetailClient from "@/components/dogs/DogDetailClient";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A slug that can never collide with a real dog (see dogs table: slug is a
// non-empty, unique, human-derived string). Used purely to guarantee
// `generateStaticParams` never returns zero entries -- with `output:
// "export"`, a dynamic route with zero static params fails the whole build
// ("missing generateStaticParams()"), which would otherwise break the very
// first deploy before any dog has ever been published.
const PLACEHOLDER_SLUG = "_placeholder";

async function fetchDogForBuild(slug?: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const query = slug
    ? `slug=eq.${encodeURIComponent(slug)}&status=in.(published,pending,adopted)&select=name,slug,description`
    : `status=in.(published,pending,adopted)&select=slug`;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/dogs?${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Pre-render a static shell for every dog that's public at build time, so
// GitHub Pages has a real file to serve at each pretty URL. The page still
// live-fetches from Supabase on load (see DogDetailClient), so content stays
// current between deploys -- only brand-new dogs need a rebuild before they
// get their own deep-linkable page (they're still visible on the /dogs
// listing immediately either way).
export async function generateStaticParams() {
  const rows = (await fetchDogForBuild()) as { slug: string }[] | null;
  const slugs = (rows ?? []).map((row) => ({ slug: row.slug }));
  return slugs.length > 0 ? slugs : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) {
    return { title: "Dog Profile" };
  }
  const rows = (await fetchDogForBuild(slug)) as
    | { name: string; description: string | null }[]
    | null;
  const dog = rows?.[0];
  if (!dog) {
    return { title: "Dog Profile" };
  }
  return {
    title: dog.name,
    description: dog.description?.slice(0, 160) || `Meet ${dog.name}, available for adoption.`,
  };
}

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DogDetailClient slug={slug} />;
}
