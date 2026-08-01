"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNav, siteConfig } from "@/lib/site-config";
import DonateButton from "@/components/layout/DonateButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-soft-blue/60 bg-brand-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md"
          aria-label={`${siteConfig.orgName} home`}
        >
          <Image
            src="/brand/logo.png"
            alt={`${siteConfig.orgName} logo`}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="hidden font-heading text-lg font-semibold text-brand-deep-blue sm:inline">
            {siteConfig.orgName}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex"
        >
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="text-sm font-medium text-brand-charcoal transition-colors hover:text-brand-purple"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <DonateButton size="sm" />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-brand-soft-blue p-2 text-brand-deep-blue md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        className={`border-t border-brand-soft-blue/60 bg-brand-white px-4 py-3 md:hidden ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-3">
          {primaryNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="block py-1 text-base font-medium text-brand-charcoal hover:text-brand-purple"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <DonateButton size="sm" />
          </li>
        </ul>
      </nav>
    </header>
  );
}
