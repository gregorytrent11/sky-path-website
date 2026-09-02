"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

// Zeffy's form can take several seconds to appear. An iframe paints white
// while it loads, so without this the main donation call to action is a blank
// box for long enough that people assume it's broken.
//
// The form is cross-origin and can't be sized to its content: Zeffy's own
// embed script offers no auto-resize, its iframe-resizer child and its
// `{ id: "zeffy-iframe", height }` messages both just echo the frame height
// (the layout pads itself to fill whatever it's given), so the only usable
// signal is the "step-changed" message it posts as a donor moves through
// the form. The steps differ a lot in height: the amount picker
// ("selection") and the monthly upsell ("pushMonthly") fit in ~480px, while
// "payment" (summary, card fields, donor details) runs to ~1500px at phone
// width. So the frame is short by default and grows for the payment step;
// anything that still overflows scrolls inside the iframe as before.

const ZEFFY_ORIGIN = "https://www.zeffy.com";
const COMPACT_HEIGHT = 540;
const PAYMENT_HEIGHT = 1600;

type ZeffyMessage = {
  type?: unknown;
  step?: unknown;
};

export default function ZeffyDonationForm() {
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<string | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== ZEFFY_ORIGIN) return;
      const data = event.data as ZeffyMessage | null;
      if (
        data &&
        typeof data === "object" &&
        data.type === "zeffy-embed:step-changed" &&
        typeof data.step === "string"
      ) {
        setStep(data.step);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const height = step === "payment" ? PAYMENT_HEIGHT : COMPACT_HEIGHT;

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
        style={{ height }}
        className={`relative w-full border-0 transition-[height,opacity] duration-300 ${
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
