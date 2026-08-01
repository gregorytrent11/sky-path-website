import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import VolunteerForm from "@/components/forms/VolunteerForm";

export const metadata: Metadata = {
  title: "Get Involved",
  description: "Volunteer opportunities with Sky's Path to Home.",
};

export default function VolunteerPage() {
  return (
    <>
      <PageHero
        title="Get Involved"
        intro="There are many ways to support Sky's Path to Home beyond adopting or fostering. Tell us how you'd like to help."
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <VolunteerForm />
      </section>
    </>
  );
}
