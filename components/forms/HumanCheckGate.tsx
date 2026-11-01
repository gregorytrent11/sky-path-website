"use client";

import Turnstile, { TURNSTILE_SITE_KEY } from "@/components/forms/Turnstile";

// Shown in place of a long application until the visitor passes Cloudflare's
// human check, so nobody spends half an hour on answers only to trip the
// check at the submit button. The pages are static, so this gate is purely
// for the applicant's benefit; the submit-form edge function still verifies
// a fresh token when the application comes in.
export default function HumanCheckGate({
  formName,
  onVerified,
}: {
  // Named in the copy, e.g. "adoption application".
  formName: string;
  onVerified: () => void;
}) {
  return (
    <div className="rounded-lg border border-brand-soft-blue/60 bg-brand-gray p-6">
      <h2 className="font-heading text-xl font-semibold text-brand-deep-blue">Before you begin</h2>
      <p className="mt-2 text-sm text-brand-charcoal/80">
        Please complete the quick check below to confirm you&rsquo;re a person. The {formName}{" "}
        will appear as soon as it&rsquo;s done.
      </p>
      <div className="mt-4">
        <Turnstile
          onVerify={(token) => {
            if (token) onVerified();
          }}
        />
      </div>
    </div>
  );
}

// Whether the gate applies: without a Cloudflare site key (local development)
// no widget can render, so the forms open straight away.
export const HUMAN_CHECK_ENABLED = Boolean(TURNSTILE_SITE_KEY);
