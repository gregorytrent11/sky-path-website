import PageHero from "@/components/layout/PageHero";
import DonateButton from "@/components/layout/DonateButton";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Donate",
  "Help give a dog a safe path home with a donation to Sky's Path to Home."
);

export default function DonatePage() {
  return (
    <>
      <PageHero title="Help Give a Dog a Safe Path Home" />

      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <p className="text-lg leading-relaxed text-brand-charcoal">
          Donations help cover veterinary care, medication, food, supplies, transportation,
          microchips, spay or neuter procedures, and other direct rescue needs.
        </p>

        <div className="mt-8">
          <DonateButton size="lg" variant="external" />
        </div>

        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-left">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Our Nonprofit Status
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            {siteConfig.nonprofitStatus}
          </p>
        </div>
      </section>
    </>
  );
}
