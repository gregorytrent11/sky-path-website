import Image from "next/image";
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
  {
    name: "Brianna Trent",
    title: "President and Director",
    photo: "/board/brianna-trent.jpg",
    bio: [
      "Leads the rescue and board meetings",
      "Oversees daily operations",
      "Coordinates intake, veterinary care, fostering and adoptions",
      "Loves special needs animals and caring for them",
    ],
  },
  {
    name: "Gregory Trent",
    title: "Treasurer and Director",
    photo: "/board/gregory-trent.jpg",
    bio: ["Leads finance and information technology development", "Has a love for all animals"],
  },
  {
    name: "Amanda Milam",
    title: "Secretary and Director",
    photo: "/board/amanda-milam.jpg",
    bio: [
      "Communications operator and leads the social media presence",
      "Has a passion for dogs of all shapes and sizes",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Sky's Path to Home" />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold text-brand-deep-blue">Sky’s Story</h2>
        <div className="mt-4 space-y-4 text-lg leading-relaxed text-brand-charcoal">
          <p>
            Sky’s Path to Home was created in memory of our beloved rescue dog, Sky.
          </p>
          <p>
            In 2019, my husband, Greg, and I traveled to Thailand, where we witnessed firsthand
            the overwhelming number of homeless dogs and the cruelty many animals endure. During
            our trip, we visited several dog rescue shelters and saw the extraordinary work being
            done to save these animals. I knew before we returned home that we would adopt a dog
            from Thailand.
          </p>
          <p>
            After returning to the United States, I began researching rescue organizations and
            searching for a dog who needed a home. That search led me to Dog Rescue Thailand,
            and to Sky.
          </p>
          <p>
            Sky had been found on the streets when she was approximately six months old. She had
            suffered severe burns across much of her body after someone reportedly threw boiling
            water or oil on her and left her to die. Dog Rescue Thailand rescued and rehabilitated
            her, giving her the medical care and protection she desperately needed.
          </p>
          <p>
            The organization worked closely with us throughout the adoption process, sending
            videos and helping arrange Sky’s journey from Thailand to the United States. We
            covered the cost of her flight, and she finally arrived at her new home.
          </p>
          <p>
            Sky quickly became part of our family. She bonded with us and our other dogs, and
            over the years, she blossomed into the most loving, gentle, and remarkable rescue dog
            we could have hoped for. Despite the cruelty she had experienced, Sky learned that she
            was safe. She had a comfortable home, a family who loved her, and the life she had
            always deserved.
          </p>
          <p>
            In 2025, Sky suddenly became critically ill. She had shown no previous signs that
            anything was wrong. After a CT scan of her head and abdomen and an urgent trip to a
            widely respected veterinary teaching hospital, we learned that she had suffered
            multiple blood clots and strokes. Veterinarians also suspected that she might have had
            cancer affecting her heart. Her condition deteriorated rapidly, and we lost her before
            we could fully understand what had caused her illness.
          </p>
          <p>
            Losing Sky was devastating. After everything she had survived, it felt deeply unfair
            that her life ended so suddenly. The grief of losing her is difficult to put into
            words.
          </p>
          <p>
            I ultimately decided to turn that grief into something meaningful. Sky’s Path to Home
            was created to honor Sky’s life by helping other vulnerable dogs find safety, medical
            care, compassion, and loving homes.
          </p>
          <p>
            Sky’s story did not end when we lost her. Her path continues through every dog we
            rescue and every life we help change.
          </p>
        </div>

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
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {boardMembers.map((member) => (
            <li key={member.name} className="rounded-xl bg-brand-gray p-5 text-center">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-brand-soft-blue/40">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <p className="mt-4 font-heading font-semibold text-brand-deep-blue">{member.name}</p>
              <p className="mt-1 text-sm text-brand-charcoal/80">{member.title}</p>
              <ul className="mt-3 space-y-1 text-left text-xs leading-relaxed text-brand-charcoal/80">
                {member.bio.map((line) => (
                  <li key={line} className="flex gap-1.5">
                    <span aria-hidden="true">&bull;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
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
