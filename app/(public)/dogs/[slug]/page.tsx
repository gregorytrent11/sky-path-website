import type { Metadata } from "next";
import DogDetailClient from "@/components/dogs/DogDetailClient";
import { toPlainText } from "@/components/dogs/RichText";
import { fetchDogsForBuild } from "@/lib/build-time-dogs";

// A slug that can never collide with a real dog (see dogs table: slug is a
// non-empty, unique, human-derived string). Used purely to guarantee
// `generateStaticParams` never returns zero entries -- with `output:
// "export"`, a dynamic route with zero static params fails the whole build
// ("missing generateStaticParams()"), which would otherwise break the very
// first deploy before any dog has ever been published.
const PLACEHOLDER_SLUG = "_placeholder";

// Pre-render a static shell for every dog that's public at build time, so
// GitHub Pages has a real file to serve at each pretty URL. The page still
// live-fetches from Supabase on load (see DogDetailClient), so content stays
// current between deploys -- only brand-new dogs need a rebuild before they
// get their own deep-linkable page (they're still visible on the /dogs
// listing immediately either way).
export async function generateStaticParams() {
  const rows = await fetchDogsForBuild();
  const slugs = rows.map((row) => ({ slug: row.slug }));
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
  const [dog] = await fetchDogsForBuild(slug);
  if (!dog) {
    return { title: "Dog Profile" };
  }
  // Bios can contain list markers and **bold**, which would read as noise in
  // a search result or social card, so flatten them back to prose first.
  const summary =
    (dog.description ? toPlainText(dog.description).slice(0, 160) : "") ||
    `Meet ${dog.name}, available for adoption.`;
  return {
    title: dog.name,
    description: summary,
    openGraph: {
      title: dog.name,
      description: summary,
    },
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
