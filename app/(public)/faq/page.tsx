import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Adoption FAQ",
  "Answers to common questions about adopting a dog in Montana from Sky's Path to Home: adoption fees, requirements, meet and greets, and adopting from out of state.",
  "/faq/"
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-base font-semibold text-brand-deep-blue">{children}</h3>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-brand-purple">&bull;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
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
              the overpopulation of pet animals in this country. YOU have the power to help us
              fight the overpopulation crisis.
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

          <FaqItem question="Who can adopt?">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-brand-purple">&bull;</span>
                <span>Adopters must be 21 years of age or older.</span>
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
            <BulletList
              items={[
                "Spayed or neutered",
                "Microchipped",
                "Vaccinated according to their age",
                "Tested for heartworm according to their age",
                "Treated for any illnesses or injuries",
              ]}
            />
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

          <FaqItem question="Adoption Criteria">
            <p>
              At Sky&rsquo;s Path to Home, our goal is to place every dog in a safe, responsible,
              and loving home. Adoption applicants must meet the following minimum requirements and
              agree to provide appropriate care for the dog throughout its life.
            </p>

            <SubHeading>Basic Adoption Requirements</SubHeading>
            <BulletList
              items={[
                "The adopter must be 21 years of age or older.",
                "The adopter must be willing and able to provide a safe, stable, and appropriate home for the dog.",
                "The dog may never be used for dog fighting, baiting, fighting-related activities, or any other form of animal cruelty or exploitation.",
                "The dog may never be left unattended in a hot vehicle or placed in any situation where excessive heat or cold could endanger the dog.",
                "The dog may not be transported unsecured in the open bed of a pickup truck.",
                "The dog may not be left outdoors alone overnight.",
                "The dog may not be left outdoors unsupervised for extended periods of time.",
                "The adopter must provide appropriate veterinary care and follow any known medical or medication requirements disclosed at the time of adoption.",
              ]}
            />

            <p className="font-semibold text-brand-charcoal">
              Sky&rsquo;s Path to Home reserves the right to deny an adoption when we believe the
              placement is not in the best interest of the dog.
            </p>
          </FaqItem>

          <FaqItem question="Tips for Bringing Home Your New Friend!">
            <p>
              Bringing home a rescue dog is exciting, but remember that everything is new to them.
              Give your new friend time, patience, and consistency as they adjust.
            </p>

            <SubHeading>Before They Come Home</SubHeading>
            <p>Have the basics ready:</p>
            <BulletList
              items={[
                "Properly fitted harness and leash",
                "Food and water bowls",
                "Their current food, if possible",
                "Comfortable bed",
                "Toys and chews",
                "Crate or safe space, if needed",
              ]}
            />
            <p>Make sure doors, gates, and fences are secure.</p>

            <SubHeading>Give Them Time</SubHeading>
            <p>
              Some dogs adjust quickly, while others may need days or weeks to feel comfortable.
              Avoid overwhelming them with too many visitors, outings, or new experiences right
              away.
            </p>

            <SubHeading>Keep a Routine</SubHeading>
            <p>
              A consistent schedule for meals, potty breaks, walks, medications, and bedtime helps
              dogs feel safe and understand what to expect.
            </p>

            <SubHeading>Introduce Pets Slowly</SubHeading>
            <p>
              Keep introductions calm and supervised. Give your new dog their own quiet space and
              allow relationships with other pets to develop gradually.
            </p>

            <SubHeading>Be Patient</SubHeading>
            <p>
              Your dog may have accidents, seem nervous, sleep more, or need extra reassurance at
              first. Use positive reinforcement and give them time to learn their new home and
              routine.
            </p>

            <p>
              Most importantly, remember that while this is exciting for you, your dog&rsquo;s
              entire world has changed. Give them the time they need to feel safe, comfortable, and
              part of the family.
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
