import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Adoption FAQ",
  "Frequently asked questions about adopting a dog from Sky's Path to Home."
);

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-brand-soft-blue/60 bg-brand-white p-5 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-brand-deep-blue">
        {question}
        <span aria-hidden="true" className="shrink-0 text-brand-purple transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-charcoal">{children}</div>
    </details>
  );
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Adoption FAQ"
        intro="Answers to the questions we hear most often about adopting a dog from Sky's Path to Home."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-4">
          <FaqItem question="Do I have to pay an adoption fee?">
            <p>
              Sky&rsquo;s Path to Home is a nonprofit organization and runs on its adoption fees.
              We do not adopt for free, as then we cannot support our veterinary and travel costs
              (to save dogs from shelters across multiple states).
            </p>
          </FaqItem>

          <FaqItem question="Why adopt a pet from Sky's Path to Home?">
            <p>
              By adopting from a nonprofit rescue, you are putting money into an organization that
              fights endlessly to save the lives of euthanasia-listed dogs every day, save dogs with
              medical issues, seniors, and those that have been abused, and is committed to ending
              the overpopulation of pet animals in this country. When you purchase a dog from a
              breeder, you are lining the pockets of those breeders and continuing the suffering
              of the mom who will be continually subjected to a life of bankrolling her owner. YOU
              have the power to help us fight the overpopulation crisis.
            </p>
            <p>
              When you adopt from Sky&rsquo;s Path to Home, you save TWO lives. You have given a
              furever home to the new dog you bring home, and you make room within our program so
              we can save another animal. That&rsquo;s something you can feel good about!
            </p>
          </FaqItem>

          <FaqItem question="Do you adopt outside of Montana?">
            <p>
              Yes, if you come to Montana to meet and pick up your new dog. We might be able to
              help arrange transport to other states. Please contact us directly for more
              information.
            </p>
          </FaqItem>

          <FaqItem question="If I adopt out of state, how do you do a home inspection and/or meet and greet?">
            <p>
              We will schedule a video call for a home inspection. We will ask you to provide
              honest feedback about any current animals you have to ensure the dog you want to
              adopt will be a good fit.
            </p>
          </FaqItem>

          <FaqItem question="Who can adopt?">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-brand-purple">&bull;</span>
                <span>Adopters must be 18 years of age or older.</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-brand-purple">&bull;</span>
                <span>Renters are welcome to apply with permission from their landlord.</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-brand-purple">&bull;</span>
                <span>
                  Families with children are welcome to apply! Not every dog can handle a home
                  with children, but many can. Families with other pets can adopt too. We will
                  just ask you to disclose your current animals and their overall behavior to
                  ensure the dog you want to adopt will be a good fit.
                </span>
              </li>
            </ul>
          </FaqItem>

          <FaqItem question="Do I need to have a fence to adopt a dog?">
            <p>
              Fences are not required. However, not every dog is a candidate for a home without a
              fence.
            </p>
          </FaqItem>

          <FaqItem question="What is included in the adoption fee?">
            <p>
              The adoption fee includes all medical and safety-related care. Prior to adoption,
              all dogs are:
            </p>
            <ul className="space-y-2">
              {[
                "Spayed or neutered",
                "Microchipped",
                "Vaccinated according to their age",
                "Tested for heartworm and tick-borne parasites",
                "Treated for any illnesses or injuries",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand-purple">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FaqItem>

          <FaqItem question="Do you have a facility where I can visit your dogs?">
            <p>
              No. We are a 100% foster-based rescue. However, our fosters are willing to schedule
              a meet and greet if you find a dog you&rsquo;d like to consider adopting.
            </p>
            <p className="font-semibold text-brand-charcoal">
              Please note: your adoption application must be approved prior to scheduling a meet
              and greet.
            </p>
          </FaqItem>

          <FaqItem question="Can I visit with a dog before applying to adopt?">
            <p>
              No. We require a completed application, including all supporting documentation, and
              approval prior to scheduling meet and greets with potential dogs.
            </p>
          </FaqItem>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/dogs/"
            className="inline-flex items-center justify-center rounded-full bg-brand-deep-blue px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-blue"
          >
            View Available Dogs
          </Link>
        </div>
      </section>
    </>
  );
}
