import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Resources",
  "Montana dog resources from Sky's Path to Home: what to do if you found a dog, how to rehome a dog responsibly, and where to find pet support.",
  "/resources/"
);

const resources = [
  {
    heading: "Found a dog",
    body: "Check for a collar, tag, or microchip (a vet clinic or shelter can scan for one at no cost). Post to local lost-and-found pet groups and animal control, and hold onto the dog safely while you search for an owner.",
  },
  {
    heading: "Considering surrendering a dog",
    body: "If you're facing a situation where you can no longer care for a dog, reach out before it becomes an emergency. We may be able to help directly, connect you with temporary support, or point you toward resources that keep the dog with you.",
    cta: { href: "/request-help/", label: "Request Help" },
  },
  {
    heading: "Low-cost veterinary care",
    body: "Many areas have low-cost vaccine clinics, spay/neuter programs, and payment-plan options through local veterinary offices. Your county or city animal services office is usually the fastest way to find current programs near you.",
  },
  {
    heading: "Emergency situations",
    body: siteConfig.emergencyDisclaimer,
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        title="Resources"
        intro="Practical guidance if you've found a dog, need to rehome one, or are looking for pet support in the community."
      />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-10">
          {resources.map((item) => (
            <div key={item.heading}>
              <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">{item.heading}</h2>
              <p className="mt-3 text-base leading-relaxed text-brand-charcoal">{item.body}</p>
              {item.cta && (
                <Link
                  href={item.cta.href}
                  className="mt-3 inline-block text-sm font-semibold text-brand-purple hover:underline"
                >
                  {item.cta.label} &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-brand-gray p-6 text-center">
          <p className="text-sm text-brand-charcoal/80">
            Don&rsquo;t see what you&rsquo;re looking for?{" "}
            <Link href="/contact/" className="font-semibold text-brand-purple hover:underline">
              Contact us
            </Link>{" "}
            and we&rsquo;ll do our best to point you in the right direction.
          </p>
        </div>
      </section>
    </>
  );
}
