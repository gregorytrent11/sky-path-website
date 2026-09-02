import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import PayPalDonateButton from "@/components/donate/PayPalDonateButton";
import ZeffyDonationForm from "@/components/donate/ZeffyDonationForm";
import ChariotDafButton from "@/components/donate/ChariotDafButton";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Donate",
  "Support a Montana nonprofit dog rescue. Your tax-deductible donation to Sky's Path to Home pays for veterinary care, medication, and foster support for rescued dogs.",
  "/donate/"
);

export default function DonatePage() {
  return (
    <>
      <PageHero title="Help Give a Dog a Safe Path Home" />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-heading text-2xl font-semibold text-brand-deep-blue">
          Your Donation Saves Lives
        </h2>
        <div className="mx-auto mt-4 max-w-2xl space-y-4 text-left text-base leading-relaxed text-brand-charcoal">
          <p>
            Every donation to Sky&rsquo;s Path to Home helps provide food, veterinary care,
            transportation, vaccinations, spaying and neutering, and other essential services for
            dogs in need.
          </p>
          <p>
            Many of the dogs we rescue come from overcrowded shelters in states such as Texas and
            California, where thousands of stray and surrendered animals enter shelters each year.
            When shelters exceed capacity, dogs may be placed on euthanasia lists because of their
            age, medical needs, or simply because there is no available space.
          </p>
          <p>
            We work with shelters, rescue organizations, foster families, adopters, and transport
            volunteers to move dogs out of these high-risk situations. Some dogs are transported
            directly to approved adopters in other states, while others are brought to Montana and
            placed in foster homes until they find safe, permanent, and loving families.
          </p>
          <p>
            Your support makes this work possible. Donations help us cover the costs associated
            with each rescue and allow us to continue responding when a dog urgently needs help.
          </p>
          <p>
            You may make a one-time contribution or become a monthly donor. Every gift, regardless
            of the amount, helps give a vulnerable dog a path to safety and a home. 100% of your
            donation goes directly toward our dogs and our mission.
          </p>
        </div>

        {/* Zeffy passes on 100% of a donation -- it charges nonprofits nothing
            and asks donors for an optional tip -- so it leads. The form needs
            the full column width; the two compact options pair up below it. */}
        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give online
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            One-time or monthly, by card. 100% of your donation reaches the dogs.
          </p>
          <ZeffyDonationForm />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give with PayPal, Venmo, or a card
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            You don&rsquo;t need a PayPal account to give by card.
          </p>
          <div className="mt-4">
            <PayPalDonateButton />
          </div>
        </div>

        <div className="rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give via Zelle
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            Scan the QR code below in your banking app, or send to{" "}
            <span className="font-semibold">sky@skyspath.com</span> on Zelle.
          </p>
          <div className="relative mx-auto mt-4 aspect-[700/775] w-full max-w-[280px] overflow-hidden rounded-lg bg-white">
            <Image
              src="/donate/zelle-qr-code.png"
              alt="Zelle QR code to send a donation to Sky's Path to Home"
              fill
              className="object-contain"
            />
          </div>
        </div>

        </div>

        {/* DAF donors grant through their provider (Fidelity Charitable,
            Schwab, Vanguard, ...), which matches the charity by EIN. The
            Chariot DAFpay button shortcuts that, but only once the Chariot
            plan includes it; the EIN card works regardless. */}
        <div className="mx-auto mt-6 max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give from a Donor-Advised Fund
          </h2>
          {siteConfig.chariotConnectId ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
                Have a donor-advised fund with Fidelity Charitable, Schwab Charitable, Vanguard
                Charitable, or another provider? DAFpay lets you recommend a grant to Sky&rsquo;s
                Path to Home in a few clicks, with no forms to fill out.
              </p>
              <div className="mt-4">
                <ChariotDafButton />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-brand-charcoal/70">
                Prefer to grant directly through your provider? Our EIN is{" "}
                <span className="font-semibold">{siteConfig.ein}</span>.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
                Have a donor-advised fund with Fidelity Charitable, Schwab Charitable, Vanguard
                Charitable, or another provider? Log in to your fund and recommend a grant to us
                using the details below.
              </p>
              <dl className="mx-auto mt-4 grid max-w-xs grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-left text-sm text-brand-charcoal">
                <dt className="font-semibold">Legal name</dt>
                <dd>{siteConfig.legalName}</dd>
                <dt className="font-semibold">EIN</dt>
                <dd>{siteConfig.ein}</dd>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-brand-charcoal/70">
                We are a verified nonprofit with Chariot, so DAF grants reach us electronically.
              </p>
            </>
          )}
        </div>

        <div className="mx-auto mt-6 max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-left">
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
