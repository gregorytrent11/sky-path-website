import type { Metadata } from "next";
import DogDetailClient from "@/components/dogs/DogDetailClient";
import { dogSummaryLine } from "@/components/dogs/dog-display";
import { toPlainText } from "@/components/RichText";
import { fetchDogProfileForBuild, fetchDogsForBuild } from "@/lib/build-time-dogs";
import { siteConfig } from "@/lib/site-config";

// A slug that can never collide with a real dog (see dogs table: slug is a
// non-empty, unique, human-derived string). Used purely to guarantee
// `generateStaticParams` never returns zero entries -- with `output:
// "export"`, a dynamic route with zero static params fails the whole build
// ("missing generateStaticParams()"), which would otherwise break the very
// first deploy before any dog has ever been published.
const PLACEHOLDER_SLUG = "_placeholder";

// Search snippets show roughly 155-160 characters; cut on a word boundary so
// the snippet never ends mid-word.
function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-]+$/, "")}…`;
}

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
    // Build-only shell, never a real page: keep it out of search results.
    return { title: "Dog Profile", robots: { index: false, follow: false } };
  }
  const profile = await fetchDogProfileForBuild(slug);
  if (!profile) {
    return { title: "Dog Profile" };
  }
  const { dog } = profile;
  const path = `/dogs/${dog.slug}/`;
  const adopted = dog.status === "adopted";
  // "Buddy - Dog for Adoption in Montana | Sky's Path to Home" is what shows
  // in search results; adopted dogs keep a page (success stories link to
  // them) but shouldn't advertise as available.
  const title = adopted
    ? `${dog.name} - Adopted`
    : `${dog.name} - Dog for Adoption in Montana`;
  const traits = dogSummaryLine(dog);
  // Bios can contain list markers and **bold**, which would read as noise in
  // a search result or social card, so flatten them back to prose first.
  const bio = dog.description ? toPlainText(dog.description) : "";
  const lead = adopted
    ? `${dog.name}${traits ? ` (${traits})` : ""} found a home through ${siteConfig.orgName}, a Montana nonprofit dog rescue.`
    : `Meet ${dog.name}${traits ? `, ${traits}` : ""}, available for adoption from ${siteConfig.orgName}, a Montana nonprofit dog rescue.`;
  const description = truncateAtWord(bio ? `${lead} ${bio}` : lead, 160);
  const image = dog.primary_photo_url
    ? [{ url: dog.primary_photo_url, alt: dog.name }]
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
      url: path,
      ...(image ? { images: image } : {}),
    },
    twitter: {
      title: `${title} | ${siteConfig.orgName}`,
      description,
      ...(image ? { images: [dog.primary_photo_url as string] } : {}),
    },
  };
}

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Build-time snapshot so the static HTML for this profile already carries
  // the dog's name, bio, and photos for search engines; the client refreshes
  // from Supabase on load so edits show without waiting for a rebuild.
  const profile = slug === PLACEHOLDER_SLUG ? null : await fetchDogProfileForBuild(slug);
  return (
    <DogDetailClient
      slug={slug}
      initialDog={profile?.dog ?? null}
      initialMedia={profile?.media ?? []}
    />
  );
}
