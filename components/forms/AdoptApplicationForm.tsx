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
  whyInterested: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  atLeastTwentyOne: string;
  housingType: string;
  homeOwnership: string;
  landlordInfo: string;
  timeInCurrentHome: string;
  yardFenced: string;
  unfencedYardPlan: string;
  agreesToFencePhotos: string;
  household: string;
  householdAgrees: string;
  hoursAlone: string;
  whereStay: string;
  whereDogSleeps: string;
  exercisePlan: string;
  adjustmentTime: string;
  preparedForCosts: string;
  annualVetBudget: string;
  emergencyVetPlan: string;
  lifelongCommitment: string;
  majorLifeChangePlan: string;
  currentPets: string;
  incompatiblePetsPlan: string;
  vetName: string;
  vetPhone: string;
  currentPetVetStatus: string;
  behavioralPlan: string;
  surrenderedPetBefore: string;
  surrenderedPetExplanation: string;
  houseTrainingPlan: string;
  rescueDogExperience: string;
  growlingPlan: string;
  rehomingCircumstances: string;
  willContactRescueFirst: string;
  referenceOneFullName: string;
  referenceOneRelationship: string;
  referenceOneYearsKnown: string;
  referenceOneEmail: string;
  referenceOnePhone: string;
  referenceOneObservedAnimalCare: string;
  referenceTwoFullName: string;
  referenceTwoRelationship: string;
  referenceTwoYearsKnown: string;
  referenceTwoEmail: string;
  referenceTwoPhone: string;
  referenceTwoObservedAnimalCare: string;
  referenceThreeFullName: string;
  referenceThreeRelationship: string;
  referenceThreeYearsKnown: string;
  referenceThreeEmail: string;
  referenceThreePhone: string;
  referenceThreeObservedAnimalCare: string;
  signatureName: string;
  signatureDate: string;
};

// Keyed so lib/submission-format.ts humanizes them into readable labels in
// the admin submissions list and the PDF export ("Reference One Full Name").
type ReferenceValues = {
  fullName: string;
  relationship: string;
  yearsKnown: string;
  email: string;
  phone: string;
  observedAnimalCare: string;
};

function emptyForm(): FormState {
  return {
    whyInterested: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    atLeastTwentyOne: "",
    housingType: "",
    homeOwnership: "",
    landlordInfo: "",
    timeInCurrentHome: "",
    yardFenced: "",
    unfencedYardPlan: "",
    agreesToFencePhotos: "",
    household: "",
    householdAgrees: "",
    hoursAlone: "",
    whereStay: "",
    whereDogSleeps: "",
    exercisePlan: "",
    adjustmentTime: "",
    preparedForCosts: "",
    annualVetBudget: "",
    emergencyVetPlan: "",
    lifelongCommitment: "",
    majorLifeChangePlan: "",
    currentPets: "",
    incompatiblePetsPlan: "",
    vetName: "",
    vetPhone: "",
    currentPetVetStatus: "",
    behavioralPlan: "",
    surrenderedPetBefore: "",
    surrenderedPetExplanation: "",
    houseTrainingPlan: "",
    rescueDogExperience: "",
    growlingPlan: "",
    rehomingCircumstances: "",
    willContactRescueFirst: "",
    referenceOneFullName: "",
    referenceOneRelationship: "",
    referenceOneYearsKnown: "",
    referenceOneEmail: "",
    referenceOnePhone: "",
    referenceOneObservedAnimalCare: "",
    referenceTwoFullName: "",
    referenceTwoRelationship: "",
    referenceTwoYearsKnown: "",
    referenceTwoEmail: "",
    referenceTwoPhone: "",
    referenceTwoObservedAnimalCare: "",
    referenceThreeFullName: "",
    referenceThreeRelationship: "",
    referenceThreeYearsKnown: "",
    referenceThreeEmail: "",
    referenceThreePhone: "",
    referenceThreeObservedAnimalCare: "",
    signatureName: "",
    signatureDate: "",
  };
}

// Maps the fieldset's generic field names onto the flat FormState keys, so
// all three references can share one component without the payload losing which
// reference each answer belongs to.
const REFERENCE_ONE_KEYS: Record<keyof ReferenceValues, keyof FormState> = {
  fullName: "referenceOneFullName",
  relationship: "referenceOneRelationship",
  yearsKnown: "referenceOneYearsKnown",
  email: "referenceOneEmail",
  phone: "referenceOnePhone",
  observedAnimalCare: "referenceOneObservedAnimalCare",
};

const REFERENCE_TWO_KEYS: Record<keyof ReferenceValues, keyof FormState> = {
  fullName: "referenceTwoFullName",
  relationship: "referenceTwoRelationship",
  yearsKnown: "referenceTwoYearsKnown",
  email: "referenceTwoEmail",
  phone: "referenceTwoPhone",
  observedAnimalCare: "referenceTwoObservedAnimalCare",
};

const REFERENCE_THREE_KEYS: Record<keyof ReferenceValues, keyof FormState> = {
  fullName: "referenceThreeFullName",
  relationship: "referenceThreeRelationship",
  yearsKnown: "referenceThreeYearsKnown",
  email: "referenceThreeEmail",
  phone: "referenceThreePhone",
  observedAnimalCare: "referenceThreeObservedAnimalCare",
};

function ReferenceFieldset({
  idPrefix,
  title,
  values,
  onChange,
}: {
  idPrefix: string;
  title: string;
  values: ReferenceValues;
  onChange: (field: keyof ReferenceValues, value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-brand-soft-blue/60 p-4">
      <h3 className="font-heading text-base font-semibold text-brand-deep-blue">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-name`}
          label="Full name"
          value={values.fullName}
          onChange={(v) => onChange("fullName", v)}
          required
        />
        <TextField
          id={`${idPrefix}-relationship`}
          label="Relationship to applicant"
          value={values.relationship}
          onChange={(v) => onChange("relationship", v)}
          required
        />
      </div>
      <TextField
        id={`${idPrefix}-years-known`}
        label="How long have you known this person?"
        value={values.yearsKnown}
        onChange={(v) => onChange("yearsKnown", v)}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id={`${idPrefix}-email`}
          label="Email address (optional)"
          type="email"
          placeholder="them@example.com"
          value={values.email}
          onChange={(v) => onChange("email", v)}
        />
        <PhoneField
          id={`${idPrefix}-phone`}
          label="Phone number"
          value={values.phone}
          onChange={(v) => onChange("phone", v)}
          required
        />
      </div>
      <YesNoField
        name={`${idPrefix}-observed`}
        label="Has this person observed you caring for an animal?"
        value={values.observedAnimalCare}
        onChange={(v) => onChange("observedAnimalCare", v)}
        required
      />
    </div>
  );
}

function AdoptApplicationFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(emptyForm);
  // One box per dog; the first is always there and is the required one.
  const [dogNames, setDogNames] = useState<string[]>(() => [searchParams.get("dog") || ""]);
  const [certified, setCertified] = useState(false);
  const [referenceAuthorized, setReferenceAuthorized] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDogName(index: number, value: string) {
    setDogNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  }

  const renting = form.homeOwnership === "Rent";
  const yardNotFullyFenced = form.yardFenced === "No" || form.yardFenced === "Partially";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.atLeastTwentyOne !== "Yes") {
      setError("You must be at least 21 years old to apply.");
      return;
    }
    if (renting && !form.landlordInfo.trim()) {
      setError("Landlord or property manager contact information is required when renting.");
      return;
    }
    if (!referenceAuthorized) {
      setError("Please review and check the reference authorization statement.");
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
        payload: {
          ...form,
          // Stays one "Dog Name" answer in the admin list and the PDF, the
          // same as applications sent in before more than one dog was allowed.
          dogName: dogNames.map((name) => name.trim()).filter(Boolean).join(", "),
          // The question is hidden once the yard is marked fully fenced, so
          // don't send an answer typed before they changed their mind.
          unfencedYardPlan: yardNotFullyFenced ? form.unfencedYardPlan : "",
          referenceAuthorization: referenceAuthorized,
          certified,
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
          label="Which dog(s) are you interested in?"
          value={dogNames[0]}
          onChange={(v) => updateDogName(0, v)}
          required
        />
        {dogNames.slice(1).map((name, i) => (
          <div key={i + 1} className="flex items-end gap-3">
            <div className="flex-1">
              <TextField
                id={`adopt-dog-name-${i + 2}`}
                label={`Dog #${i + 2}`}
                value={name}
                onChange={(v) => updateDogName(i + 1, v)}
              />
            </div>
            <button
              type="button"
              onClick={() => setDogNames((prev) => prev.filter((_, idx) => idx !== i + 1))}
              className="pb-2 text-sm font-medium text-brand-purple hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setDogNames((prev) => [...prev, ""])}
          className="text-sm font-medium text-brand-purple hover:underline"
        >
          + Add another dog
        </button>
        <TextAreaField id="adopt-why" label={dogNames.length > 1 ? "Why are you interested in these dogs?" : "Why are you interested in this dog?"} value={form.whyInterested} onChange={(v) => update("whyInterested", v)} required />
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
        <YesNoField
          name="atLeastTwentyOne"
          label="Are you at least 21 years of age or older?"
          value={form.atLeastTwentyOne}
          onChange={(v) => update("atLeastTwentyOne", v)}
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
        <TextAreaField
          id="adopt-landlord"
          label={
            renting
              ? "Landlord or property manager name and phone number or email address"
              : "Landlord or property manager information (put N/A if you do not have one)"
          }
          value={form.landlordInfo}
          onChange={(v) => update("landlordInfo", v)}
          required
        />
        <TextField
          id="adopt-time-in-home"
          label="How long have you lived in your current home?"
          value={form.timeInCurrentHome}
          onChange={(v) => update("timeInCurrentHome", v)}
          required
        />
        <RadioGroupField
          name="yardFenced"
          label="Is the yard fenced?"
          value={form.yardFenced}
          onChange={(v) => update("yardFenced", v)}
          options={["Yes", "No", "Partially"]}
          required
        />
        {yardNotFullyFenced && (
          <TextAreaField
            id="adopt-unfenced-plan"
            label="If no or partially fenced, how will you safely secure and supervise the dog while outside?"
            value={form.unfencedYardPlan}
            onChange={(v) => update("unfencedYardPlan", v)}
            required
          />
        )}
        <YesNoField
          name="agreesToFencePhotos"
          label="Do you agree to provide photos of your fenced or secured outdoor area if requested by Sky’s Path to Home?"
          value={form.agreesToFencePhotos}
          onChange={(v) => update("agreesToFencePhotos", v)}
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
          id="adopt-where-sleep"
          label="Where will your new dog sleep?"
          value={form.whereDogSleeps}
          onChange={(v) => update("whereDogSleeps", v)}
          required
        />
        <TextAreaField
          id="adopt-exercise"
          label="How will you provide exercise, training, and enrichment?"
          value={form.exercisePlan}
          onChange={(v) => update("exercisePlan", v)}
          required
        />
        <TextAreaField
          id="adopt-adjustment-time"
          label="How much time do you plan to give your new dog to adjust to their new home?"
          value={form.adjustmentTime}
          onChange={(v) => update("adjustmentTime", v)}
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
        <TextField id="adopt-vet-budget" label="How much do you plan to spend on vet bills in a typical year?" value={form.annualVetBudget} onChange={(v) => update("annualVetBudget", v)} required />
        <TextAreaField id="adopt-emergency-vet" label="How do you plan to handle unexpected or emergency veterinary expenses?" value={form.emergencyVetPlan} onChange={(v) => update("emergencyVetPlan", v)} required />
        <YesNoField
          name="lifelongCommitment"
          label="Are you prepared to provide this dog with a permanent, lifelong home, regardless of their age or how many years that commitment may be?"
          value={form.lifelongCommitment}
          onChange={(v) => update("lifelongCommitment", v)}
          required
        />
        <TextAreaField id="adopt-life-change" label="What would you do with the dog if you moved, changed jobs, had a baby, or experienced another major life change?" value={form.majorLifeChangePlan} onChange={(v) => update("majorLifeChangePlan", v)} required />
        <TextAreaField id="adopt-current-pets" label="Current Pets" value={form.currentPets} onChange={(v) => update("currentPets", v)} required />
        <TextAreaField id="adopt-incompatible-pets" label="What will you do if your new dog is not compatible with your current pets?" value={form.incompatiblePetsPlan} onChange={(v) => update("incompatiblePetsPlan", v)} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="adopt-vet-name" label="Veterinarian or clinic name" value={form.vetName} onChange={(v) => update("vetName", v)} describedBy="adopt-vet-na-note" required />
          <PhoneField id="adopt-vet-phone" label="Veterinarian phone number" value={form.vetPhone} onChange={(v) => update("vetPhone", v)} describedBy="adopt-vet-na-note" allowNA required />
        </div>
        <p id="adopt-vet-na-note" className="text-sm text-brand-charcoal/70">
          Put N/A if this is your first animal or you have no other animals at this time.
        </p>
        <TextAreaField id="adopt-vet-status" label="Current pet vaccination and veterinary care status" value={form.currentPetVetStatus} onChange={(v) => update("currentPetVetStatus", v)} required />
        <TextAreaField id="adopt-behavior-plan" label="Plan for handling behavioral or adjustment challenges" value={form.behavioralPlan} onChange={(v) => update("behavioralPlan", v)} required />
        <YesNoField
          name="surrenderedPetBefore"
          label="Have you ever surrendered, rehomed, given away, or returned a pet?"
          value={form.surrenderedPetBefore}
          onChange={(v) => update("surrenderedPetBefore", v)}
          required
        />
        <TextAreaField id="adopt-surrender-explanation" label="If yes, please explain why. If no, please type N/A." value={form.surrenderedPetExplanation} onChange={(v) => update("surrenderedPetExplanation", v)} required />
        <TextAreaField id="adopt-house-training" label="How will you deal with house training accidents?" value={form.houseTrainingPlan} onChange={(v) => update("houseTrainingPlan", v)} required />
        <TextAreaField
          id="adopt-rescue-experience"
          label="Have you previously cared for a rescue dog, particularly one with medical needs, special needs, or a history of abuse or neglect? Please describe your experience and the type of care you provided."
          value={form.rescueDogExperience}
          onChange={(v) => update("rescueDogExperience", v)}
          required
        />
        <TextAreaField id="adopt-growling" label="How will you deal with the dog growling/showing teeth?" value={form.growlingPlan} onChange={(v) => update("growlingPlan", v)} required />
        <TextAreaField id="adopt-rehoming-circumstances" label="Under what circumstances, if any, would you consider returning or rehoming the dog?" value={form.rehomingCircumstances} onChange={(v) => update("rehomingCircumstances", v)} required />
        <YesNoField
          name="willContactRescueFirst"
          label="If you can no longer care for the dog, do you agree to contact Sky’s Path to Home rather than giving the dog away, surrendering them to a shelter, or rehoming them yourself?"
          value={form.willContactRescueFirst}
          onChange={(v) => update("willContactRescueFirst", v)}
          required
        />
      </div>

      <div className="space-y-4">
        <SectionHeading>References</SectionHeading>
        <p className="text-sm leading-relaxed text-brand-charcoal/80">
          References must be at least 18 years old, and at least 1 reference should not be an
          immediate family member. Sky&rsquo;s Path to Home will contact references and must be
          able to speak with them before your adoption application can be approved.
        </p>
        <p className="text-sm leading-relaxed text-brand-charcoal/80">
          Please let your references know that we will be reaching out.
        </p>

        <ReferenceFieldset
          idPrefix="adopt-reference-one"
          title="Reference #1"
          values={{
            fullName: form.referenceOneFullName,
            relationship: form.referenceOneRelationship,
            yearsKnown: form.referenceOneYearsKnown,
            email: form.referenceOneEmail,
            phone: form.referenceOnePhone,
            observedAnimalCare: form.referenceOneObservedAnimalCare,
          }}
          onChange={(field, value) => update(REFERENCE_ONE_KEYS[field], value)}
        />
        <ReferenceFieldset
          idPrefix="adopt-reference-two"
          title="Reference #2"
          values={{
            fullName: form.referenceTwoFullName,
            relationship: form.referenceTwoRelationship,
            yearsKnown: form.referenceTwoYearsKnown,
            email: form.referenceTwoEmail,
            phone: form.referenceTwoPhone,
            observedAnimalCare: form.referenceTwoObservedAnimalCare,
          }}
          onChange={(field, value) => update(REFERENCE_TWO_KEYS[field], value)}
        />
        <ReferenceFieldset
          idPrefix="adopt-reference-three"
          title="Reference #3"
          values={{
            fullName: form.referenceThreeFullName,
            relationship: form.referenceThreeRelationship,
            yearsKnown: form.referenceThreeYearsKnown,
            email: form.referenceThreeEmail,
            phone: form.referenceThreePhone,
            observedAnimalCare: form.referenceThreeObservedAnimalCare,
          }}
          onChange={(field, value) => update(REFERENCE_THREE_KEYS[field], value)}
        />

        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-brand-deep-blue">
            Reference Authorization
          </h3>
          <label className="flex items-start gap-2 text-sm text-brand-charcoal">
            <input
              type="checkbox"
              checked={referenceAuthorized}
              onChange={(e) => setReferenceAuthorized(e.target.checked)}
              required
              className="mt-1"
            />
            <span>
              I authorize Sky&rsquo;s Path to Home to contact the references listed in this
              application and to ask questions regarding my reliability, responsibility,
              animal-care experience, and suitability to adopt a dog. I
              understand that Sky&rsquo;s Path to Home may consider the information provided by my
              references when reviewing my adoption application. *
            </span>
          </label>
        </div>
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
