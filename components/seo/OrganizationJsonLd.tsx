import { siteConfig } from "@/lib/site-config";
import { socialLinks } from "@/lib/social-links";

// Schema.org structured data so search engines understand who runs the site:
// a 501(c)(3) dog rescue in Montana. Only facts already published elsewhere on
// the site (footer, About, Contact) are included -- nothing is invented here.
export default function OrganizationJsonLd() {
  const siteUrl = siteConfig.siteUrl.replace(/\/$/, "");
  const orgId = `${siteUrl}/#organization`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["NGO", "AnimalShelter"],
        "@id": orgId,
        name: siteConfig.orgName,
        alternateName: "Sky's Path to Home Montana",
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/brand/logo.png`,
        },
        image: `${siteUrl}/brand/og-image.jpg`,
        description: siteConfig.missionStatement,
        slogan: siteConfig.tagline,
        email: siteConfig.contactEmail,
        telephone: siteConfig.contactPhone,
        nonprofitStatus: "https://schema.org/Nonprofit501c3",
        taxID: siteConfig.ein,
        address: {
          "@type": "PostalAddress",
          addressRegion: "MT",
          addressCountry: "US",
        },
        areaServed: {
          "@type": "State",
          name: "Montana",
        },
        knowsAbout: [
          "Dog rescue",
          "Dog adoption",
          "Dog fostering",
          "Animal welfare",
        ],
        sameAs: socialLinks.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: siteConfig.orgName,
        description: siteConfig.seoDescription,
        publisher: { "@id": orgId },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // "<" is escaped so no content can ever close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
