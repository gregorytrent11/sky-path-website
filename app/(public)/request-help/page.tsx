import PageHero from "@/components/layout/PageHero";
import RequestHelpForm from "@/components/forms/RequestHelpForm";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Request Help",
  "Request help from Sky's Path to Home: found dogs, owner surrenders, shelter transfers, and more."
);

export default function RequestHelpPage() {
  return (
    <>
      <PageHero
        title="Request Help"
        intro="If you've found a dog, need to surrender a dog, or represent a shelter or partner organization, let us know how we can help."
      />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <p className="rounded-lg border border-brand-soft-blue bg-brand-soft-blue/20 p-4 text-sm leading-relaxed text-brand-charcoal">
          {siteConfig.emergencyDisclaimer}
        </p>
        <div className="mt-8">
          <RequestHelpForm />
        </div>
      </section>
    </>
  );
}
