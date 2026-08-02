import Image from "next/image";
import Link from "next/link";
import DonateButton from "@/components/layout/DonateButton";
import RecoveryRedirect from "@/components/RecoveryRedirect";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  return (
    <>
      <RecoveryRedirect />
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-soft-blue/40 to-brand-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:py-24">
          <Image
            src="/brand/logo.png"
            alt={`${siteConfig.orgName} logo`}
            width={220}
            height={220}
            className="h-44 w-44 object-contain drop-shadow-md sm:h-52 sm:w-52"
            priority
          />
          <h1 className="max-w-3xl font-heading text-4xl font-semibold text-brand-deep-blue sm:text-5xl">
            Every Dog Deserves a Safe Path Home
          </h1>
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-purple">
              Our Mission
            </h2>
            <p className="mt-2 text-lg leading-relaxed text-brand-charcoal">
              {siteConfig.missionStatement}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dogs"
              className="inline-flex items-center justify-center rounded-full bg-brand-deep-blue px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-blue"
            >
              View Available Dogs
            </Link>
            <Link
              href="/foster"
              className="inline-flex items-center justify-center rounded-full border-2 border-brand-purple px-6 py-3 text-base font-semibold text-brand-purple transition-colors hover:bg-brand-purple hover:text-brand-white"
            >
              Become a Foster
            </Link>
            <DonateButton size="lg" />
          </div>
        </div>
      </section>

      {/* Status summary */}
      <section aria-labelledby="status-heading" className="border-y border-brand-soft-blue/40 bg-brand-gray">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="status-heading" className="sr-only">
            Current rescue status
          </h2>
          <dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <StatusStat label="Dogs currently available" value="Coming soon" />
            <StatusStat label="Dogs in foster care" value="Coming soon" />
            <StatusStat label="Adoptions completed" value="Coming soon" />
            <StatusStat label="Current urgent need" value="Foster homes" />
          </dl>
        </div>
      </section>

      {/* Featured available dogs */}
      <section aria-labelledby="featured-dogs-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 id="featured-dogs-heading" className="font-heading text-3xl font-semibold text-brand-deep-blue">
            Featured Available Dogs
          </h2>
          <Link href="/dogs" className="text-sm font-semibold text-brand-purple hover:underline">
            View all dogs &rarr;
          </Link>
        </div>
        <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
          Dog profiles are being added. Check back soon to meet the dogs currently looking
          for a home.
        </p>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="how-it-works-heading" className="text-center font-heading text-3xl font-semibold text-brand-deep-blue">
          How the Rescue Process Works
        </h2>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {[
            "A dog comes to us at risk, through intake, transfer, or an owner surrender request.",
            "The dog receives a veterinary assessment and any necessary care.",
            "An approved foster home provides safety, stability, and the time to decompress.",
            "We get to know the dog's personality and needs, and share that on the dog's profile.",
            "Interested adopters review the profile and submit an application.",
            "We work to identify a responsible, lasting match for each dog.",
          ].map((step, index) => (
            <li key={step} className="flex gap-4 rounded-xl bg-brand-gray p-5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-purple font-heading text-sm font-semibold text-brand-white">
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed text-brand-charcoal">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Foster needs + ways to help */}
      <section aria-labelledby="help-heading" className="bg-brand-gray">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="help-heading" className="sr-only">
            Ways to help
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <HelpCard
              heading="Current Foster Needs"
              body="We are always looking for approved foster homes to give a dog a safe, stable place to stay while they wait for their permanent home."
              href="/foster"
              cta="Learn About Fostering"
            />
            <HelpCard
              heading="Ways to Help"
              body="Adopt, foster, volunteer, donate, or share a dog's profile. Every action helps a dog move closer to a safe, permanent home."
              href="/volunteer"
              cta="See How to Get Involved"
            />
            <HelpCard
              heading="Veterinary & Emergency Fund"
              body="Donations help cover veterinary care, medication, and emergency treatment for dogs in our care who need it most."
              href="/donate"
              cta="Support Veterinary Care"
            />
          </div>
        </div>
      </section>

      {/* Success story placeholder */}
      <section aria-labelledby="success-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="success-heading" className="text-center font-heading text-3xl font-semibold text-brand-deep-blue">
          Success Stories
        </h2>
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
          Our first adoption stories will be shared here soon.
        </p>
        <div className="mt-6 text-center">
          <Link href="/success-stories" className="text-sm font-semibold text-brand-purple hover:underline">
            View all success stories &rarr;
          </Link>
        </div>
      </section>

      {/* Nonprofit status + contact */}
      <section aria-labelledby="status-note-heading" className="border-t border-brand-soft-blue/40 bg-brand-gray">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <h2 id="status-note-heading" className="sr-only">
            Nonprofit status
          </h2>
          <p className="text-sm text-brand-charcoal/80">{siteConfig.nonprofitStatus}</p>
          <p className="mt-2 text-sm text-brand-charcoal/80">
            Serving {siteConfig.serviceArea}.{" "}
            <Link href="/contact" className="font-semibold text-brand-purple hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function StatusStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-brand-charcoal/70">{label}</dt>
      <dd className="mt-1 font-heading text-2xl font-semibold text-brand-deep-blue">{value}</dd>
    </div>
  );
}

function HelpCard({
  heading,
  body,
  href,
  cta,
}: {
  heading: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-brand-white p-6 shadow-sm">
      <h3 className="font-heading text-xl font-semibold text-brand-deep-blue">{heading}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-charcoal/80">{body}</p>
      <Link href={href} className="mt-4 text-sm font-semibold text-brand-purple hover:underline">
        {cta} &rarr;
      </Link>
    </div>
  );
}
