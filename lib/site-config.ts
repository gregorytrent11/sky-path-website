export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://skyspath.com",
  orgName: "Sky's Path to Home",
  tagline: "Every Dog Deserves a Safe Path Home",
  shortDescription:
    "Sky's Path to Home is a Montana nonprofit dog rescue serving Billings and surrounding communities. We work through foster homes to provide dogs with safety, veterinary care, stability, and the time they need to find the right permanent family.",
  missionStatement:
    "Sky's Path to Home rescues dogs at risk, provides safe foster-based care and necessary veterinary support, and connects each dog with a responsible, lasting home.",
  visionStatement:
    "A community where every dog has a safe path from uncertainty to a permanent, loving home.",
  nonprofitStatus:
    "Sky's Path to Home is a Montana nonprofit corporation. Our application for federal recognition under Section 501(c)(3) is pending.",
  emergencyDisclaimer:
    "Sky's Path to Home is not an emergency veterinary clinic or animal-control agency. For an immediate medical emergency, contact a veterinarian. For an immediate public-safety concern, contact the appropriate local authority.",
  serviceArea: "Billings and surrounding Montana communities",
  // Open item from the requirements doc -- replace once confirmed.
  contactEmail: "[email pending]",
  contactPhone: "[phone pending]",
  donationUrl: process.env.NEXT_PUBLIC_DONATION_URL || "",
  // Optional external form platform links (see requirements doc section 22).
  // Leave blank until an application platform is selected.
  adoptApplicationUrl: process.env.NEXT_PUBLIC_ADOPT_APPLICATION_URL || "",
  fosterApplicationUrl: process.env.NEXT_PUBLIC_FOSTER_APPLICATION_URL || "",
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
  { label: "Get Involved", href: "/volunteer" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks: NavLink[] = [
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/resources" },
  { label: "Request Help", href: "/request-help" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
