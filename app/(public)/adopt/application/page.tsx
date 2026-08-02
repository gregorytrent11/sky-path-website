import PageHero from "@/components/layout/PageHero";
import AdoptApplicationForm from "@/components/forms/AdoptApplicationForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Adoption Application",
  "Apply to adopt a dog from Sky's Path to Home."
);

export default function AdoptApplicationPage() {
  return (
    <>
      <PageHero
        title="Adoption Application"
        intro="Applications are evaluated for the best match, not simply in the order received. Submitting an application does not guarantee adoption."
      />
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <AdoptApplicationForm />
      </section>
    </>
  );
}
