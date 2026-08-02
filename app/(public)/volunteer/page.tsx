import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import VolunteerForm from "@/components/forms/VolunteerForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Get Involved", "Volunteer opportunities with Sky's Path to Home.");

const ways = [
  {
    heading: "Fostering",
    body: "We are always looking for foster homes for our animals. The more fosters we have, the more dogs we can save. Fostering allows us to rescue dogs out of state from high-kill shelters.",
    href: "/foster/",
    cta: "Learn About Fostering",
  },
  {
    heading: "Spreading Awareness",
    body: "Please share our organization with others, this helps get our name out there and helps more dogs find the people who are looking for them.",
  },
  {
    heading: "Adopt",
    body: "Adopting a dog literally saves a life. It opens a spot for a foster to take in a new dog, and it gives that dog a loving home and the consistency our dogs don't otherwise have.",
    href: "/dogs/",
    cta: "See Dogs Available Now",
  },
  {
    heading: "Donate",
    body: "Any donation helps our organization, it goes toward food, medical costs, transport costs (many of our dogs come from high-kill shelters on the euthanasia list in other states), and spaying and neutering.",
    href: "/donate/",
    cta: "Make a Donation",
  },
];

export default function VolunteerPage() {
  return (
    <>
      <PageHero
        title="Get Involved"
        intro="There are many ways to support Sky's Path to Home beyond adopting or fostering. Tell us how you'd like to help."
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {ways.map((way) => (
            <div key={way.heading} className="rounded-xl bg-brand-gray p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
                {way.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-charcoal">{way.body}</p>
              {way.href && (
                <Link
                  href={way.href}
                  className="mt-4 inline-block text-sm font-semibold text-brand-purple hover:underline"
                >
                  {way.cta} &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-brand-soft-blue/40 bg-brand-gray">
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-semibold text-brand-deep-blue">
            Tell Us How You&rsquo;d Like to Help
          </h2>
          <div className="mt-8">
            <VolunteerForm />
          </div>
        </div>
      </section>
    </>
  );
}
