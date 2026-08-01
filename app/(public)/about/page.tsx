import PageHero from "@/components/layout/PageHero";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  "Learn about Sky's Path to Home, our story, mission, and values."
);

const values = [
  "Safety",
  "Compassion",
  "Responsible placement",
  "Transparency",
  "Respect",
  "Collaboration",
  "Long-term commitment",
];

const boardMembers = [
  { name: "Brianna Trent", title: "President and Director" },
  { name: "Greg Trent", title: "Treasurer and Director" },
  { name: "Amanda Milam", title: "Secretary and Director" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Sky's Path to Home" />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">Our Story</h2>
        <p className="mt-4 text-lg leading-relaxed text-brand-charcoal">
          Sky&rsquo;s Path to Home was created in memory of Sky and the lasting impact one dog
          can have on a family. Sky&rsquo;s legacy is reflected in every dog we help move from
          an uncertain situation toward safety, healing, and home.
        </p>

        <h2 className="mt-12 font-heading text-2xl font-semibold text-brand-deep-blue">
          Mission &amp; Vision
        </h2>
        <p className="mt-4 text-base leading-relaxed text-brand-charcoal">{siteConfig.missionStatement}</p>
        <p className="mt-3 text-base italic leading-relaxed text-brand-charcoal/80">
          {siteConfig.visionStatement}
        </p>

        <h2 className="mt-12 font-heading text-2xl font-semibold text-brand-deep-blue">
          How Foster-Based Rescue Works
        </h2>
        <p className="mt-4 text-base leading-relaxed text-brand-charcoal">
          Rather than operating a shelter facility, Sky&rsquo;s Path to Home places every dog
          in a foster home. Fosters provide daily care and stability while we provide
          veterinary support and guidance, so each dog is set up to succeed in their next
          permanent home.
        </p>
      </section>

      <section className="bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">Our Values</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {values.map((value) => (
              <li
                key={value}
                className="rounded-full bg-brand-white px-4 py-2 text-sm font-medium text-brand-deep-blue shadow-sm"
              >
                {value}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">
          Leadership &amp; Board
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {boardMembers.map((member) => (
            <li key={member.name} className="rounded-xl bg-brand-gray p-5 text-center">
              <p className="font-heading font-semibold text-brand-deep-blue">{member.name}</p>
              <p className="mt-1 text-sm text-brand-charcoal/80">{member.title}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-brand-soft-blue/40 bg-brand-gray">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-brand-charcoal/80">{siteConfig.nonprofitStatus}</p>
        </div>
      </section>
    </>
  );
}
