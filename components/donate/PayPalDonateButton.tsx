"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { siteConfig } from "@/lib/site-config";

// PayPal's hosted-button SDK. The script has to load before
// paypal.HostedButtons() exists, so rendering waits on next/script telling us
// it's ready -- onReady rather than onLoad, so this still fires when a client
// navigation brings the page back with the script already cached.

type HostedButtons = (options: { hostedButtonId: string }) => {
  render: (selector: string) => Promise<void>;
};

declare global {
  interface Window {
    paypal?: { HostedButtons: HostedButtons };
  }
}

const SDK_SRC =
  `https://www.paypal.com/sdk/js?client-id=${siteConfig.paypalClientId}` +
  "&components=hosted-buttons&enable-funding=venmo&currency=USD";

export default function PayPalDonateButton() {
  const containerId = `paypal-container-${siteConfig.paypalHostedButtonId}`;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // React runs effects twice in development; without this the button renders
  // into the container a second time and PayPal stacks two of them.
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!ready || renderedRef.current || !window.paypal) return;
    renderedRef.current = true;
    window.paypal
      .HostedButtons({ hostedButtonId: siteConfig.paypalHostedButtonId })
      .render(`#${containerId}`)
      .catch(() => {
        renderedRef.current = false;
        setFailed(true);
      });
  }, [ready, containerId]);

  return (
    <>
      <Script
        id="paypal-hosted-buttons-sdk"
        src={SDK_SRC}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />

      <div id={containerId} className="mx-auto w-full max-w-[320px]" />

      {/* An ad blocker or a blocked third-party script shouldn't leave a donor
          staring at an empty box with no way to give. */}
      {failed && (
        <p className="mt-2 text-sm text-brand-charcoal/80">
          The PayPal button could not load. You can still donate at{" "}
          <a
            href={`https://www.paypal.com/ncp/payment/${siteConfig.paypalHostedButtonId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-purple hover:underline"
          >
            PayPal
          </a>
          , or use Zelle below.
        </p>
      )}
    </>
  );
}
