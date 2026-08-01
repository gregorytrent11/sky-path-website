"use client";

import { FormEvent, useState } from "react";
import { FormField, inputClasses } from "@/components/forms/FormField";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";

const interestAreas = [
  "Dog transportation",
  "Event support",
  "Photography and video",
  "Social media",
  "Fundraising",
  "Administrative support",
  "Home visits",
  "Supply coordination",
  "Foster support",
  "Veterinary transport",
];

export default function VolunteerForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the verification challenge below.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    try {
      await submitForm({
        formType: "volunteer",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        message: String(form.get("availability") || ""),
        payload: {
          city: form.get("city"),
          interestAreas: form.getAll("interestAreas"),
          experience: form.get("experience"),
          transportationAccess: form.get("transportationAccess") === "on",
        },
        turnstileToken,
      });
      setStatus("submitted");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "submitted") {
    return (
      <div role="status" className="rounded-lg bg-brand-gray p-6 text-center">
        <p className="font-heading text-lg font-semibold text-brand-deep-blue">Thank you</p>
        <p className="mt-2 text-sm text-brand-charcoal/80">
          We&rsquo;ve received your volunteer interest form and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField label="Name" htmlFor="vol-name" required>
        <input id="vol-name" name="name" type="text" required className={inputClasses} />
      </FormField>

      <FormField label="Email" htmlFor="vol-email" required>
        <input id="vol-email" name="email" type="email" required className={inputClasses} />
      </FormField>

      <FormField label="Phone" htmlFor="vol-phone" required>
        <input id="vol-phone" name="phone" type="tel" required className={inputClasses} />
      </FormField>

      <FormField label="City" htmlFor="vol-city" required>
        <input id="vol-city" name="city" type="text" required className={inputClasses} />
      </FormField>

      <label className="flex items-start gap-2 text-sm text-brand-charcoal">
        <input type="checkbox" name="ageConfirmation" required className="mt-1" />
        <span>I confirm that I am 18 years of age or older. *</span>
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-brand-charcoal">Areas of interest</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {interestAreas.map((area) => (
            <label key={area} className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input type="checkbox" name="interestAreas" value={area} />
              {area}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="Availability" htmlFor="vol-availability" required>
        <textarea id="vol-availability" name="availability" rows={3} required className={inputClasses} />
      </FormField>

      <FormField label="Relevant experience" htmlFor="vol-experience">
        <textarea id="vol-experience" name="experience" rows={3} className={inputClasses} />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-brand-charcoal">
        <input type="checkbox" name="transportationAccess" />
        I have reliable transportation access.
      </label>

      <label className="flex items-start gap-2 text-sm text-brand-charcoal">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I consent to Sky&rsquo;s Path to Home contacting me about volunteering. *</span>
      </label>

      <Turnstile onVerify={setTurnstileToken} />

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit Volunteer Interest"}
      </button>
    </form>
  );
}
