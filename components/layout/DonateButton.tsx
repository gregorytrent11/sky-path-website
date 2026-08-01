import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

type DonateButtonProps = {
  size?: "sm" | "lg";
  /** "page" links to the internal /donate page (used in nav/hero). "external" is the
   * actual give-money action shown on the Donate page itself. */
  variant?: "page" | "external";
};

const sizeClasses: Record<NonNullable<DonateButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function DonateButton({
  size = "lg",
  variant = "page",
}: DonateButtonProps) {
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-brand-purple font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue focus-visible:outline-brand-deep-blue ${sizeClasses[size]}`;

  if (variant === "page") {
    return (
      <Link href="/donate" className={baseClasses}>
        Donate
      </Link>
    );
  }

  if (siteConfig.donationUrl) {
    return (
      <a
        href={siteConfig.donationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        Donate Now
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`inline-flex items-center justify-center rounded-full bg-brand-gray font-semibold text-brand-charcoal/70 cursor-not-allowed ${sizeClasses[size]}`}
    >
      Online donations coming soon
    </button>
  );
}
