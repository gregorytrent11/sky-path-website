import PageHero from "@/components/layout/PageHero";
import FosterApplicationForm from "@/components/forms/FosterApplicationForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Foster Application",
  "Apply to become a foster home with Sky's Path to Home."
);

export default function FosterApplicationPage() {
  return (
    <>
      <PageHero
        title="Foster Application"
        intro="Thank you for your interest in fostering. Complete the application below and a member of our team will follow up with you."
      />
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <FosterApplicationForm />
      </section>
    </>
  );
}
