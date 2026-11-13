import PageHero from "@/components/layout/PageHero";
import SuccessStoriesListClient from "@/components/dogs/SuccessStoriesListClient";
import { socialIcons } from "@/components/icons/SocialIcons";
import { pageMetadata } from "@/lib/metadata";
import { socialLinks } from "@/lib/social-links";

export const metadata = pageMetadata(
  "Success Stories",
  "Adoption success stories from Sky's Path to Home, a Montana nonprofit dog rescue: rescued dogs who found their loving homes.",
  "/success-stories/"
);

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        title="Success Stories"
        intro="Every adoption is a milestone. Here are some of the dogs who found their permanent homes."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <SuccessStoriesListClient />
        <div className="mt-12 text-center">
          <p className="text-base font-medium text-brand-charcoal">
            To view all of our success stories, please visit our social media pages.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.name];
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${social.name}: ${social.handle}`}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-purple text-brand-purple transition-colors hover:bg-brand-purple hover:text-brand-white"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
