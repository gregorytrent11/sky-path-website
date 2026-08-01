import type { Metadata } from "next";
import PageHero from "@/components/layout/PageHero";
import ExternalApplicationCta from "@/components/forms/ExternalApplicationCta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Foster Application",
  description: "Apply to become a foster home with Sky's Path to Home.",
};

export default function FosterApplicationPage() {
  return (
    <>
      <PageHero
        title="Foster Application"
        intro="Thank you for your interest in fostering. Complete the application below and a member of our team will follow up with you."
      />
      <section className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <ExternalApplicationCta url={siteConfig.fosterApplicationUrl} label="Start Foster Application" />
      </section>
    </>
  );
}
