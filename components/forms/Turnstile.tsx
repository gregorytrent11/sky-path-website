"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          appearance?: TurnstileAppearance;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// "always" shows the widget; "interaction-only" keeps it invisible unless
// Cloudflare needs the visitor to do something, which suits a second check
// on a form the visitor has already passed a visible one for.
export type TurnstileAppearance = "always" | "execute" | "interaction-only";

// Set at build time; without it no widget renders and the forms skip their
// human check (local development without a Cloudflare key).
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function Turnstile({
  onVerify,
  appearance = "always",
}: {
  onVerify: (token: string) => void;
  appearance?: TurnstileAppearance;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId();
  const siteKey = TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": () => onVerify(""),
        "error-callback": () => onVerify(""),
        appearance,
      });
    });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  // An invisible widget shouldn't leave a gap in the form.
  return (
    <div ref={containerRef} id={`turnstile-${id}`} className={appearance === "always" ? "my-2" : undefined} />
  );
}
