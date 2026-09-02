"use client";

import { createElement, useState } from "react";
import Script from "next/script";
import { siteConfig } from "@/lib/site-config";

// DAFpay by Chariot: a donor picks their donor-advised fund provider
// (Fidelity Charitable, Schwab, Vanguard, ...) and recommends a grant to us
// in a few clicks. The button is a web component that Chariot's script
// upgrades once it loads; Chariot requires the script to come straight from
// their CDN rather than be bundled.

export default function ChariotDafButton() {
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Script
        id="chariot-connect-sdk"
        src="https://cdn.givechariot.com/chariot-connect.umd.js"
        strategy="afterInteractive"
        onError={() => setFailed(true)}
      />

      {/* Reserve the button's height so the card doesn't jump when the
          script arrives and upgrades the element. */}
      <div className="mx-auto flex min-h-[48px] w-full max-w-[320px] items-center justify-center">
        {/* createElement rather than JSX: the tag isn't in React's intrinsic
            element types, and augmenting them needs a TS namespace, which
            the lint config forbids. */}
        {createElement("chariot-connect", {
          cid: siteConfig.chariotConnectId,
          theme: "DefaultTheme",
        })}
      </div>

      {/* An ad blocker or a blocked third-party script shouldn't leave a DAF
          donor with no way to give -- every provider can grant by EIN. */}
      {failed && (
        <p className="mt-2 text-sm text-brand-charcoal/80">
          The DAFpay button could not load. You can still recommend a grant
          through your fund provider using our EIN{" "}
          <span className="font-semibold">{siteConfig.ein}</span>.
        </p>
      )}
    </>
  );
}
