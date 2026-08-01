import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Adoption success stories from Sky's Path to Home.",
};

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        title="Success Stories"
        intro="Every adoption is a milestone. Here are some of the dogs who found their permanent homes."
      />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
          Our first success stories will be published here once adopter permission has been
          confirmed.
        </p>
      </section>
    </>
  );
}
