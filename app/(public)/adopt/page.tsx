import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Adopt",
  "Learn about the adoption process at Sky's Path to Home, a Montana foster-based dog rescue."
);

const processSteps = [
  "Review available dogs.",
  "Read the dog's full profile and requirements.",
  "Submit an adoption application.",
  "Participate in a phone or video conversation.",
  "Complete reference, veterinary, landlord, or home checks when applicable.",
  "Meet the dog.",
  "Review and sign the adoption agreement.",
  "Pay the applicable adoption fee.",
  "Complete the transition and follow-up process.",
];

const disclosures = [
  "Submitting an application does not guarantee adoption.",
  "The rescue may decline an application when the placement is not considered appropriate.",
  "Information must be accurate and complete.",
  "Adoption criteria should be applied consistently.",
  "Fees and requirements may differ based on a dog's age and medical needs.",
  "The website must not promise that every dog is fully trained or compatible with every household.",
];

export default function AdoptPage() {
  return (
    <>
      <PageHero
        title="Adopt"
        intro="Adoption is a commitment to provide a dog with safety, patience, appropriate veterinary care, training, and a permanent home. Our process is designed to identify a responsible match between each dog and adopter."
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">Our Adoption Process</h2>
        <ol className="mt-6 space-y-4">
          {processSteps.map((step, index) => (
            <li key={step} className="flex gap-4 rounded-lg bg-brand-gray p-4">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-purple text-sm font-semibold text-brand-white">
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-brand-charcoal">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <Link
            href="/dogs"
            className="inline-flex items-center justify-center rounded-full bg-brand-deep-blue px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-blue"
          >
            View Available Dogs
          </Link>
        </div>
      </section>

      <section className="bg-brand-gray">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">
            What You Should Know Before Applying
          </h2>
          <ul className="mt-6 space-y-3">
            {disclosures.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-brand-charcoal">
                <span aria-hidden="true" className="text-brand-purple">
                  &bull;
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
