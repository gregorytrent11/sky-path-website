import PageHero from "@/components/layout/PageHero";
import ContactForm from "@/components/forms/ContactForm";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Contact",
  "Contact Sky's Path to Home, a Montana nonprofit dog rescue, about adoption, fostering, volunteering, donations, or a dog that needs help.",
  "/contact/"
);

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" />

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <p className="rounded-lg border border-brand-soft-blue bg-brand-soft-blue/20 p-4 text-sm leading-relaxed text-brand-charcoal">
          {siteConfig.emergencyDisclaimer}
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
