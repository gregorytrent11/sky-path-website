import PageHero from "@/components/layout/PageHero";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Terms of Use", "Terms of use for Sky's Path to Home.");

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Use" />
      <section className="mx-auto max-w-3xl px-4 py-14 text-sm leading-relaxed text-brand-charcoal sm:px-6">
        <h2 className="mt-0 font-heading text-xl font-semibold text-brand-deep-blue">
          Use of This Website
        </h2>
        <p className="mt-3">
          This website is provided by {siteConfig.orgName} to share information about our
          dogs and programs, and to accept adoption, foster, volunteer, and contact
          submissions.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">
          No Guarantee of Adoption or Placement
        </h2>
        <p className="mt-3">
          Submitting an application through this website does not guarantee adoption,
          fostering approval, or any other placement. {siteConfig.orgName} evaluates
          applications for the best match for each dog.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">
          No Guarantee of Dog Behavior
        </h2>
        <p className="mt-3">
          Dog profiles reflect our best current knowledge. {siteConfig.orgName} does not
          guarantee that any dog is fully trained or compatible with every household.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">Contact</h2>
        <p className="mt-3">
          Questions about these terms can be directed to {siteConfig.contactEmail}.
        </p>
      </section>
    </>
  );
}
