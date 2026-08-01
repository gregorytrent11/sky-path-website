import Link from "next/link";
import { footerLinks, primaryNav, siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-soft-blue/60 bg-brand-deep-blue text-brand-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">{siteConfig.orgName}</p>
          <p className="mt-2 text-sm text-brand-soft-blue">{siteConfig.serviceArea}</p>
          <p className="mt-4 text-sm leading-relaxed text-brand-white/90">
            {siteConfig.shortDescription}
          </p>
        </div>

        <nav aria-label="Footer site links">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-soft-blue">
            Site
          </p>
          <ul className="space-y-2 text-sm">
            {[...primaryNav, ...footerLinks].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-lavender">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-soft-blue">
            Contact
          </p>
          <ul className="space-y-2 text-sm text-brand-white/90">
            <li>
              <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-brand-lavender">
                {siteConfig.contactEmail}
              </a>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.contactPhone.replace(/[^\d+]/g, "")}`}
                className="hover:text-brand-lavender"
              >
                {siteConfig.contactPhone}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-brand-white/70">
            {siteConfig.nonprofitStatus}
          </p>
        </div>
      </div>

      <div className="border-t border-brand-white/10 px-4 py-4 text-center text-xs text-brand-white/60 sm:px-6">
        &copy; {new Date().getFullYear()} {siteConfig.orgName}. All rights reserved.
      </div>
    </footer>
  );
}
