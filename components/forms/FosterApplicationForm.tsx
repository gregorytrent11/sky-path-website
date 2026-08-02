"use client";

import { FormEvent, useState } from "react";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";
import {
  CheckboxGroupField,
  SectionHeading,
  TextAreaField,
  TextField,
  YesNoField,
} from "@/components/forms/FormPrimitives";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  adult: string;
  placementTypes: string[];
  whyFoster: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  adult: "",
  placementTypes: [],
  whyFoster: "",
};

export default function FosterApplicationForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [certified, setCertified] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.adult !== "Yes") {
      setError("You must be at least 18 years old to apply.");
      return;
    }
    if (!certified) {
      setError("Please review and check the certification statement.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification challenge below.");
      return;
    }

    setStatus("submitting");
    try {
      await submitForm({
        formType: "foster_application",
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        message: form.whyFoster || undefined,
        payload: { ...form, certified },
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
        <p className="font-heading text-lg font-semibold text-brand-deep-blue">
          Application received
        </p>
        <p className="mt-2 text-sm text-brand-charcoal/80">
          Thank you for your interest in fostering with Sky&rsquo;s Path to Home. We&rsquo;ll
          follow up by phone or email to continue the process, which may include a reference
          check and home visit. Submitting this form does not guarantee approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-4">
        <SectionHeading>Foster Application</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="foster-first-name" label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required />
          <TextField id="foster-last-name" label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="foster-email" label="Email address" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <TextField id="foster-phone" label="Phone number" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="foster-city" label="City" value={form.city} onChange={(v) => update("city", v)} required />
          <TextField id="foster-state" label="State" value={form.state} onChange={(v) => update("state", v)} required />
        </div>
        <YesNoField
          name="adult"
          label="Are you 18 years of age or older?"
          value={form.adult}
          onChange={(v) => update("adult", v)}
          required
        />
        <CheckboxGroupField
          label="What type of fostering interests you? (Select all that apply)"
          values={form.placementTypes}
          onChange={(v) => update("placementTypes", v)}
          options={[
            "Short-term (days to weeks)",
            "Long-term (months)",
            "Medical or recovery cases",
            "Behavioral cases",
            "Puppies",
            "Senior dogs",
            "Not sure — flexible",
          ]}
        />
        <TextAreaField
          id="foster-why"
          label="Tell us a little about why you're interested in fostering and your home situation"
          value={form.whyFoster}
          onChange={(v) => update("whyFoster", v)}
          rows={4}
          required
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-brand-charcoal">
        <input
          type="checkbox"
          checked={certified}
          onChange={(e) => setCertified(e.target.checked)}
          required
          className="mt-1"
        />
        <span>
          I certify that the information above is true, and understand that submitting this
          form does not guarantee approval. I&rsquo;m willing to be contacted for follow-up
          screening (phone call, reference check, home visit). *
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
        {status === "submitting" ? "Submitting…" : "Submit Foster Application"}
      </button>
    </form>
  );
}
