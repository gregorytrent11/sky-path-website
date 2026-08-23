export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://skyspath.com",
  orgName: "Sky's Path to Home",
  tagline: "Every Dog Deserves a Safe Path Home",
  shortDescription:
    "Sky's Path to Home is a Montana nonprofit dog rescue serving Billings and surrounding communities. We work through foster homes to provide dogs with safety, veterinary care, stability, and the time they need to find the right permanent family. In addition, we intake dogs across the U.S. and can support adoption outside of Montana.",
  missionStatement:
    "To rescue dogs that have been abused, have medical issues, are elderly, or are on the euthanasia list. We rehabilitate, foster, and provide veterinary care to prepare each dog to be adopted into a loving family.",
  visionStatement:
    "A community where every dog has a safe path from uncertainty to a permanent, loving home.",
  nonprofitStatus:
    "Sky's Path to Home is a federally recognized 501(c)(3) nonprofit organization. Donations made to Sky's Path to Home are tax-deductible.",
  ein: "42-4149525",
  emergencyDisclaimer:
    "Sky's Path to Home is not an emergency veterinary clinic or animal-control agency. For an immediate medical emergency, contact a veterinarian. For an immediate public-safety concern, contact the appropriate local authority.",
  serviceArea: "Billings and surrounding Montana communities",
  contactEmail: "contact_us@skyspath.com",
  contactPhone: "813-373-1918",
  donationUrl: process.env.NEXT_PUBLIC_DONATION_URL || "",
  // PayPal hosted-button identifiers. Both are public by design -- they ship
  // in the page source on every PayPal integration -- so they live here
  // rather than in env vars, where a missing GitHub Actions variable would
  // silently remove the donate button from a deploy.
  paypalClientId:
    "BAAunqyQnZk04eujsqwha0mdGtJ66os7ZE2DYGh5XG2zBseME29URE4aVlgcp0yZnKm2dRdOGbU885y2fU",
  paypalHostedButtonId: "UYB2NMP6T5K6E",
  // Zeffy charges nonprofits nothing -- it asks donors for an optional tip --
  // so this is the option that gets the most of each gift to the dogs.
  zeffyDonationFormUrl:
    "https://www.zeffy.com/embed/donation-form/support-the-dogs-of-skys-path-to-home",
  zeffyDonationPageUrl:
    "https://www.zeffy.com/en-US/donation-form/support-the-dogs-of-skys-path-to-home",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Dogs", href: "/dogs" },
  { label: "Adopt", href: "/adopt" },
  { label: "Foster", href: "/foster" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Get Involved", href: "/volunteer" },
  { label: "Contact", href: "/contact" },
  { label: "Adoption FAQ", href: "/faq" },
];

// The footer renders [...primaryNav, ...footerLinks], so Adoption FAQ lives
// only in primaryNav now -- listing it here too would print it twice.
export const footerLinks: NavLink[] = [
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/resources" },
  { label: "Request Help", href: "/request-help" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
