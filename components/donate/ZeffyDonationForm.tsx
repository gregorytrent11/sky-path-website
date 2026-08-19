"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

// Zeffy's form can take several seconds to appear. An iframe paints white
// while it loads, so without this the main donation call to action is a blank
// box for long enough that people assume it's broken.

export default function ZeffyDonationForm() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative mt-4 overflow-hidden rounded-lg bg-brand-white">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <p className="animate-pulse text-sm text-brand-charcoal/60">
            Loading the donation form&hellip;
          </p>
        </div>
      )}

      <iframe
        title="Donation form for Sky's Path to Home, powered by Zeffy"
        src={siteConfig.zeffyDonationFormUrl}
        onLoad={() => setLoaded(true)}
        // The form grows as a donor moves through its steps and it's
        // cross-origin, so the iframe can't size itself to its content -- it
        // gets a generous fixed height and scrolls internally.
        className={`relative h-[680px] w-full border-0 transition-opacity duration-300 sm:h-[760px] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        allow="payment"
      />

      <noscript>
        <p className="p-4 text-sm text-brand-charcoal">
          <a
            href={siteConfig.zeffyDonationPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-purple hover:underline"
          >
            Open our donation form
          </a>{" "}
          to give online.
        </p>
      </noscript>
    </div>
  );
}
