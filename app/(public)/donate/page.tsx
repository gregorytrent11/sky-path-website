import Image from "next/image";
import PageHero from "@/components/layout/PageHero";
import PayPalDonateButton from "@/components/donate/PayPalDonateButton";
import { siteConfig } from "@/lib/site-config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Donate",
  "Help give a dog a safe path home with a donation to Sky's Path to Home."
);

export default function DonatePage() {
  return (
    <>
      <PageHero title="Help Give a Dog a Safe Path Home" />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give with PayPal, Venmo, or a card
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            One-time or monthly. You don&rsquo;t need a PayPal account to give by card.
          </p>
          <div className="mt-4">
            <PayPalDonateButton />
          </div>
        </div>

        <h2 className="mt-14 text-center font-heading text-2xl font-semibold text-brand-deep-blue">
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

        <div className="mx-auto mt-12 max-w-xl rounded-lg border border-brand-soft-blue bg-brand-gray p-6 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
            Give via Zelle
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/90">
            Scan the QR code below in your banking app, or send to{" "}
            <span className="font-semibold">skyspathtohome</span> on Zelle.
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
