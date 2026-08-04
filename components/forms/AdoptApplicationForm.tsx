"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";
import {
  PhoneField,
  RadioGroupField,
  SectionHeading,
  TextAreaField,
  TextField,
  YesNoField,
} from "@/components/forms/FormPrimitives";

type FormState = {
  dogName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  applicantAge: string;
  housingType: string;
  homeOwnership: string;
  yardFenced: string;
  household: string;
  householdAgrees: string;
  hoursAlone: string;
  whereStay: string;
  exercisePlan: string;
  preparedForCosts: string;
  willingScreening: string;
  whyInterested: string;
  landlordInfo: string;
  currentPets: string;
  vetName: string;
  vetPhone: string;
  currentPetVetStatus: string;
  behavioralPlan: string;
  signatureName: string;
  signatureDate: string;
};

function emptyForm(dogName: string): FormState {
  return {
    dogName,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    applicantAge: "",
    housingType: "",
    homeOwnership: "",
    yardFenced: "",
    household: "",
    householdAgrees: "",
    hoursAlone: "",
    whereStay: "",
    exercisePlan: "",
    preparedForCosts: "",
    willingScreening: "",
    whyInterested: "",
    landlordInfo: "",
    currentPets: "",
    vetName: "",
    vetPhone: "",
    currentPetVetStatus: "",
    behavioralPlan: "",
    signatureName: "",
    signatureDate: "",
  };
}

function AdoptApplicationFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(() => emptyForm(searchParams.get("dog") || ""));
  const [certified, setCertified] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const renting = form.homeOwnership === "Rent";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (Number(form.applicantAge) < 18) {
      setError("You must be at least 18 years old to apply.");
      return;
    }
    if (renting && !form.landlordInfo.trim()) {
      setError("Landlord or property manager contact information is required when renting.");
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
        formType: "adopt_application",
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        message: form.whyInterested || undefined,
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
          Thank you for applying to adopt from Sky&rsquo;s Path to Home. We review every
          application carefully and will follow up as soon as possible. Submitting an
          application does not guarantee adoption.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <SectionHeading>Dog Information</SectionHeading>
        <TextField
          id="adopt-dog-name"
          label="Which dog are you interested in?"
          value={form.dogName}
          onChange={(v) => update("dogName", v)}
          required
        />
      </div>

      <div className="space-y-4">
        <SectionHeading>Applicant Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="adopt-first-name" label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required />
          <TextField id="adopt-last-name" label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="adopt-email" label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(v) => update("email", v)} required />
          <PhoneField id="adopt-phone" label="Phone number" value={form.phone} onChange={(v) => update("phone", v)} required />
        </div>
        <TextField id="adopt-street" label="Street address" value={form.streetAddress} onChange={(v) => update("streetAddress", v)} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="adopt-city" label="City" value={form.city} onChange={(v) => update("city", v)} required />
          <TextField id="adopt-state" label="State" value={form.state} onChange={(v) => update("state", v)} required />
          <TextField id="adopt-zip" label="ZIP code" value={form.zip} onChange={(v) => update("zip", v)} required />
        </div>
        <TextField
          id="adopt-age"
          label="Your age"
          type="number"
          min={18}
          value={form.applicantAge}
          onChange={(v) => update("applicantAge", v)}
          required
        />
      </div>

      <div className="space-y-4">
        <SectionHeading>Home and Household</SectionHeading>
        <RadioGroupField
          name="housingType"
          label="Housing type"
          value={form.housingType}
          onChange={(v) => update("housingType", v)}
          options={["House", "Apartment", "Townhome or condo", "Mobile home", "Other"]}
          required
        />
        <RadioGroupField
          name="homeOwnership"
          label="Home ownership status"
          value={form.homeOwnership}
          onChange={(v) => update("homeOwnership", v)}
          options={["Own", "Rent", "Live with family or another arrangement"]}
          required
        />
        {renting && (
          <TextAreaField
            id="adopt-landlord"
            label="Landlord or property manager name and phone number or email address"
            value={form.landlordInfo}
            onChange={(v) => update("landlordInfo", v)}
            required
          />
        )}
        <RadioGroupField
          name="yardFenced"
          label="Is the yard fenced?"
          value={form.yardFenced}
          onChange={(v) => update("yardFenced", v)}
          options={["Yes", "No", "Partially"]}
          required
        />
        <TextAreaField
          id="adopt-household"
          label="Who lives in the household? (Include number of adults and children, and ages of children.)"
          value={form.household}
          onChange={(v) => update("household", v)}
          required
        />
        <YesNoField
          name="householdAgrees"
          label="Does everyone in the household agree to the adoption?"
          value={form.householdAgrees}
          onChange={(v) => update("householdAgrees", v)}
          required
        />
      </div>

      <div className="space-y-4">
        <SectionHeading>Dog Care Plan</SectionHeading>
        <TextField
          id="adopt-hours-alone"
          label="How many hours will the dog usually be alone each day?"
          type="number"
          min={0}
          max={24}
          value={form.hoursAlone}
          onChange={(v) => update("hoursAlone", v)}
          required
        />
        <TextAreaField
          id="adopt-where-stay"
          label="Where will the dog stay when no one is home?"
          value={form.whereStay}
          onChange={(v) => update("whereStay", v)}
          required
        />
        <TextAreaField
          id="adopt-exercise"
          label="How will you provide exercise, training, and enrichment?"
          value={form.exercisePlan}
          onChange={(v) => update("exercisePlan", v)}
          required
        />
      </div>

      <div className="space-y-4">
        <SectionHeading>Readiness and Screening</SectionHeading>
        <YesNoField
          name="preparedForCosts"
          label="Are you prepared for the ongoing costs of dog ownership (food, routine and emergency veterinary care, training, grooming, licensing, and other expenses)?"
          value={form.preparedForCosts}
          onChange={(v) => update("preparedForCosts", v)}
          required
        />
        <YesNoField
          name="willingScreening"
          label="Are you willing to participate in requested screening (home visit, virtual home check, reference check, meet-and-greet)?"
          value={form.willingScreening}
          onChange={(v) => update("willingScreening", v)}
          required
        />
        <TextAreaField id="adopt-why" label="Why are you interested in this dog?" value={form.whyInterested} onChange={(v) => update("whyInterested", v)} required />
        {!renting && (
          <TextAreaField id="adopt-landlord-optional" label="Landlord or property manager information" value={form.landlordInfo} onChange={(v) => update("landlordInfo", v)} required />
        )}
        <TextAreaField id="adopt-current-pets" label="Current Pets" value={form.currentPets} onChange={(v) => update("currentPets", v)} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="adopt-vet-name" label="Veterinarian or clinic name" value={form.vetName} onChange={(v) => update("vetName", v)} required />
          <PhoneField id="adopt-vet-phone" label="Veterinarian phone number" value={form.vetPhone} onChange={(v) => update("vetPhone", v)} required />
        </div>
        <TextAreaField id="adopt-vet-status" label="Current pet vaccination and veterinary care status" value={form.currentPetVetStatus} onChange={(v) => update("currentPetVetStatus", v)} required />
        <TextAreaField id="adopt-behavior-plan" label="Plan for handling behavioral or adjustment challenges" value={form.behavioralPlan} onChange={(v) => update("behavioralPlan", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Certification and Signature</SectionHeading>
        <label className="flex items-start gap-2 text-sm text-brand-charcoal">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertified(e.target.checked)}
            required
            className="mt-1"
          />
          <span>
            I certify that the information in this application is true and complete; that
            Sky&rsquo;s Path to Home may contact my veterinarian, landlord, property manager, or
            references when necessary; and that submitting this application does not guarantee
            adoption. *
          </span>
        </label>
        <TextField
          id="adopt-signature"
          label="Electronic signature (type your full legal name)"
          value={form.signatureName}
          onChange={(v) => update("signatureName", v)}
          required
        />
        <TextField
          id="adopt-signature-date"
          label="Date"
          type="date"
          value={form.signatureDate}
          onChange={(v) => update("signatureDate", v)}
          required
        />
      </div>

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
        {status === "submitting" ? "Submitting…" : "Submit Adoption Application"}
      </button>
    </form>
  );
}

export default function AdoptApplicationForm() {
  return (
    <Suspense fallback={<p className="text-brand-charcoal/80">Loading…</p>}>
      <AdoptApplicationFormInner />
    </Suspense>
  );
}
