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
    "Sky's Path to Home is a Montana nonprofit corporation. Our application for federal tax-exempt status under Section 501(c)(3) is pending. Contributions may qualify as tax-deductible retroactive to our formation date if the IRS approves our application.",
  ein: "42-4149525",
  emergencyDisclaimer:
    "Sky's Path to Home is not an emergency veterinary clinic or animal-control agency. For an immediate medical emergency, contact a veterinarian. For an immediate public-safety concern, contact the appropriate local authority.",
  serviceArea: "Billings and surrounding Montana communities",
  contactEmail: "skyspathtohome@gmail.com",
  contactPhone: "813-373-1918",
  donationUrl: process.env.NEXT_PUBLIC_DONATION_URL || "",
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
];

export const footerLinks: NavLink[] = [
  { label: "Adoption FAQ", href: "/faq" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/resources" },
  { label: "Request Help", href: "/request-help" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
