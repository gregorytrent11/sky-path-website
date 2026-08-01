"use client";

import { FormEvent, useState } from "react";
import { FormField, inputClasses } from "@/components/forms/FormField";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";

const categories = [
  "Found dog",
  "Owner surrender request",
  "Shelter transfer request",
  "Foster assistance",
  "Veterinary assistance",
  "Partnership inquiry",
  "Other",
];

export default function RequestHelpForm() {
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
        formType: "request_help",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        message: String(form.get("message") || ""),
        payload: {
          category: form.get("category"),
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
          Your request has been received. We&rsquo;ll follow up as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField label="Request category" htmlFor="help-category" required>
        <select id="help-category" name="category" required className={inputClasses} defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Name" htmlFor="help-name" required>
        <input id="help-name" name="name" type="text" required className={inputClasses} />
      </FormField>

      <FormField label="Email" htmlFor="help-email" required>
        <input id="help-email" name="email" type="email" required className={inputClasses} />
      </FormField>

      <FormField label="Phone" htmlFor="help-phone">
        <input id="help-phone" name="phone" type="tel" className={inputClasses} />
      </FormField>

      <FormField label="Details" htmlFor="help-message" required>
        <textarea id="help-message" name="message" rows={5} required className={inputClasses} />
      </FormField>

      <label className="flex items-start gap-2 text-sm text-brand-charcoal">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I consent to Sky&rsquo;s Path to Home contacting me about this request. *</span>
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
        {status === "submitting" ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
