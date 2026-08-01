import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import DogsListClient from "@/components/dogs/DogsListClient";

export const metadata: Metadata = {
  title: "Dogs Looking for a Home",
  description: "Dogs currently available for adoption from Sky's Path to Home.",
};

export default function DogsPage() {
  return (
    <>
      <PageHero
        title="Dogs Looking for a Home"
        intro="Every dog below is safe in a foster home while they wait for their permanent family."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <DogsListClient />
      </section>
    </>
  );
}
