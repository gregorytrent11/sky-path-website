import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Foster",
  "Foster homes give rescued dogs a safe place to decompress, recover, learn, and show who they are outside a shelter environment."
);

const sections = [
  {
    heading: "Why Fostering Matters",
    body: "Foster homes give rescued dogs a safe place to decompress, recover, learn, and show who they are outside a shelter environment. The information a foster shares helps us find the right permanent match for each dog.",
  },
  {
    heading: "What the Rescue Provides",
    body: "Sky's Path to Home provides approved veterinary care and rescue support for every dog placed in foster care.",
  },
  {
    heading: "What the Foster Provides",
    body: "Fosters provide daily care, communication, and a stable temporary home while the dog waits for adoption.",
  },
  {
    heading: "Typical Foster Duration",
    body: "Foster length varies by dog. Some dogs are matched quickly, while others need more time. We'll discuss expected timelines with you before placement.",
  },
  {
    heading: "Dog Matching Process",
    body: "We consider your home, experience, schedule, and any current pets when matching you with a foster dog.",
  },
  {
    heading: "Existing Pets & Safe Introductions",
    body: "If you have current pets, we'll work with you on a safe, gradual introduction process before and during placement.",
  },
  {
    heading: "Veterinary Authorization Process",
    body: "All veterinary care for foster dogs must be authorized by Sky's Path to Home in advance except in a genuine emergency.",
  },
  {
    heading: "Emergency Procedures",
    body: "Fosters are given clear emergency contact information and instructions at the start of every placement.",
  },
];

export default function FosterPage() {
  return (
    <>
      <PageHero
        title="Open Your Home. Change a Dog's Path."
        intro="Foster homes give rescued dogs a safe place to decompress, recover, learn, and show who they are outside a shelter environment. Sky's Path to Home provides approved veterinary care and rescue support while fosters provide daily care, communication, and a stable temporary home."
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading} className="rounded-xl bg-brand-gray p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
                {section.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">{section.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-lg border border-brand-soft-blue bg-brand-soft-blue/20 p-4 text-sm leading-relaxed text-brand-charcoal">
          Sky&rsquo;s Path to Home will not promise to cover an expense unless it has been
          preapproved under our foster and veterinary policies.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/foster/application"
            className="inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue"
          >
            Apply to Foster
          </Link>
        </div>
      </section>

      <section aria-labelledby="foster-faq-heading" className="bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 id="foster-faq-heading" className="font-heading text-2xl font-semibold text-brand-deep-blue">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm text-brand-charcoal/70">
            Foster FAQs are being finalized and will be published here soon. In the meantime,{" "}
            <Link href="/contact" className="font-semibold text-brand-purple hover:underline">
              contact us
            </Link>{" "}
            with any questions about fostering.
          </p>
        </div>
      </section>
    </>
  );
}
