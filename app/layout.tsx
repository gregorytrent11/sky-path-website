import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { siteConfig } from "@/lib/site-config";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
});

// Google Search Console "HTML tag" verification. Set the GitHub Actions
// variable NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the content value Google
// gives you and the meta tag ships on every page; leave it unset and nothing
// is emitted.
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.seoTitle,
    template: `%s | ${siteConfig.orgName}`,
  },
  description: siteConfig.seoDescription,
  applicationName: siteConfig.orgName,
  keywords: [
    "Sky's Path to Home",
    "Sky's Path to Home Montana",
    "Montana dog rescue",
    "dog rescue in Montana",
    "dogs for adoption in Montana",
    "Billings dog rescue",
    "foster a dog in Montana",
    "501(c)(3) dog rescue",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.orgName,
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
    url: siteConfig.siteUrl,
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630, alt: siteConfig.orgName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
    images: ["/brand/og-image.jpg"],
  },
  ...(googleSiteVerification ? { verification: { google: googleSiteVerification } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-white text-brand-charcoal">
        <OrganizationJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-purple focus:px-4 focus:py-2 focus:text-brand-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
