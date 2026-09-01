import PageHero from "@/components/layout/PageHero";
import DogsListClient from "@/components/dogs/DogsListClient";
import { fetchAvailableDogsForBuild } from "@/lib/build-time-dogs";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Dogs for Adoption in Montana",
  "Meet the dogs currently available for adoption from Sky's Path to Home, a Montana nonprofit dog rescue. Every dog is safe in a foster home while waiting for a family.",
  "/dogs/"
);

export default async function DogsPage() {
  // Pre-rendered at build time so the HTML search engines crawl already
  // contains every available dog; the client refreshes from Supabase on load.
  const initialDogs = await fetchAvailableDogsForBuild();
  return (
    <>
      <PageHero
        title="Dogs Looking for a Home"
        intro="Every dog below is safe in a foster home while they wait for their permanent family."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <DogsListClient initialDogs={initialDogs} />
      </section>
    </>
  );
}
