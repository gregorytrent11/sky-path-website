import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Sky's Path to Home.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="mx-auto max-w-3xl px-4 py-14 text-sm leading-relaxed text-brand-charcoal sm:px-6">
        <p className="rounded-lg border border-dashed border-brand-soft-blue bg-brand-gray/50 p-4 text-brand-charcoal/70">
          This privacy policy is a placeholder pending final legal review. It will be
          replaced with approved language before launch.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">
          Information We Collect
        </h2>
        <p className="mt-3">
          {siteConfig.orgName} collects information you voluntarily submit through forms on
          this website, such as contact, volunteer, foster, adoption, and request-help
          forms. This may include your name, email address, phone number, and details
          relevant to your request.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">
          How We Use Information
        </h2>
        <p className="mt-3">
          We use submitted information to respond to your request, evaluate applications,
          and communicate with you about our programs. We do not sell your information.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">
          Data Protection
        </h2>
        <p className="mt-3">
          Sensitive application information is restricted to authorized administrators and
          is not included in public analytics.
        </p>

        <h2 className="mt-8 font-heading text-xl font-semibold text-brand-deep-blue">Contact</h2>
        <p className="mt-3">
          Questions about this policy can be directed to {siteConfig.contactEmail}.
        </p>
      </section>
    </>
  );
}
