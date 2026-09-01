import PageHero from "@/components/layout/PageHero";
import SuccessStoriesListClient from "@/components/dogs/SuccessStoriesListClient";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Success Stories",
  "Adoption success stories from Sky's Path to Home, a Montana nonprofit dog rescue: rescued dogs who found their loving homes.",
  "/success-stories/"
);

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        title="Success Stories"
        intro="Every adoption is a milestone. Here are some of the dogs who found their permanent homes."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <SuccessStoriesListClient />
      </section>
    </>
  );
}
