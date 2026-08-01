"use client";

import { FormEvent, useState } from "react";
import { FormField, inputClasses } from "@/components/forms/FormField";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";

const contactMethods = ["Email", "Phone", "Either"] as const;

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the verification challenge above.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    try {
      await submitForm({
        formType: "contact",
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        message: String(form.get("message") || ""),
        payload: {
          subject: form.get("subject"),
          preferredContact: form.get("preferredContact"),
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
          Your message has been received. We&rsquo;ll follow up using your preferred contact
          method as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField label="Name" htmlFor="contact-name" required>
        <input id="contact-name" name="name" type="text" required className={inputClasses} />
      </FormField>

      <FormField label="Email" htmlFor="contact-email" required>
        <input id="contact-email" name="email" type="email" required className={inputClasses} />
      </FormField>

      <FormField label="Phone" htmlFor="contact-phone">
        <input id="contact-phone" name="phone" type="tel" className={inputClasses} />
      </FormField>

      <FormField label="Subject" htmlFor="contact-subject" required>
        <input id="contact-subject" name="subject" type="text" required className={inputClasses} />
      </FormField>

      <FormField label="Message" htmlFor="contact-message" required>
        <textarea id="contact-message" name="message" rows={5} required className={inputClasses} />
      </FormField>

      <fieldset>
        <legend className="text-sm font-medium text-brand-charcoal">Preferred contact method</legend>
        <div className="mt-2 flex gap-4">
          {contactMethods.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm text-brand-charcoal">
              <input type="radio" name="preferredContact" value={method} required />
              {method}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-brand-charcoal">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          I consent to Sky&rsquo;s Path to Home contacting me about this message. *
        </span>
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
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
