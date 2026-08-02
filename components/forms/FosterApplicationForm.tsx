"use client";

import { FormEvent, useState } from "react";
import Turnstile from "@/components/forms/Turnstile";
import { submitForm } from "@/lib/submit-form";
import {
  CheckboxGroupField,
  RadioGroupField,
  SectionHeading,
  TextAreaField,
  TextField,
  YesNoField,
} from "@/components/forms/FormPrimitives";

type FormState = {
  // Applicant Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  applicantAge: string;
  // Foster Interest
  whyFoster: string;
  placementTypes: string[];
  fosterDuration: string;
  availability: string;
  howManyDogs: string;
  // Home and Household
  homeType: string;
  homeOwnership: string;
  landlordAllowsFoster: string;
  landlordInfo: string;
  household: string;
  householdAgrees: string;
  hasAllergies: string;
  allergyExplain: string;
  yardFenced: string;
  fenceDescription: string;
  restrictions: string;
  restrictionsExplain: string;
  // Current and Previous Pets
  hasCurrentPets: string;
  currentPetsList: string;
  currentPetsVaccinated: string;
  currentPetsHeartworm: string;
  hasPreviousPets: string;
  previousPetsOutcome: string;
  vetName: string;
  vetPhone: string;
  vetRecordsName: string;
  // Foster Experience
  fosteredBefore: string;
  volunteeredBefore: string;
  experienceDescription: string;
  comfortableWith: string[];
  cannotManage: string;
  // Daily Care and Supervision
  hoursAlone: string;
  whereStay: string;
  whereSleep: string;
  separationPlan: string;
  exercisePlan: string;
  followInstructions: string;
  useCrate: string;
  leashOrEnclosure: string;
  leftOutsideUnattended: string;
  leftOutsideExplain: string;
  // Transportation and Appointments
  reliableTransportation: string;
  validLicenseInsurance: string;
  ableToTransport: string;
  travelDistance: string;
  safeTransportRestraint: string;
  // Medical Care
  comfortableMedication: string;
  comfortableMonitoring: string;
  contactBeforeNonEmergencyVet: string;
  contactImmediatelyEmergency: string;
  useApprovedVetsOnly: string;
  // Adoption Support
  willingProvideUpdates: string;
  willingCommunicateHonestly: string;
  willingMeetGreets: string;
  willingSpeakWithApplicants: string;
  understandFinalDecision: string;
  understandNoOwnership: string;
  interestedAdoptingFoster: string;
  // Emergencies and Travel
  emergencyBackupCare: string;
  upcomingChanges: string;
  upcomingChangesExplain: string;
  noticeNeeded: string;
  agreeContactIfCannotFoster: string;
  agreeNoUnauthorizedTransfer: string;
  // Home Check and References
  willingHomeCheck: string;
  authorizeContact: string;
  ref1Name: string;
  ref1Relationship: string;
  ref1Contact: string;
  ref2Name: string;
  ref2Relationship: string;
  ref2Contact: string;
  previousRescueReference: string;
  // Certification
  signatureName: string;
  signatureDate: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  applicantAge: "",
  whyFoster: "",
  placementTypes: [],
  fosterDuration: "",
  availability: "",
  howManyDogs: "",
  homeType: "",
  homeOwnership: "",
  landlordAllowsFoster: "",
  landlordInfo: "",
  household: "",
  householdAgrees: "",
  hasAllergies: "",
  allergyExplain: "",
  yardFenced: "",
  fenceDescription: "",
  restrictions: "",
  restrictionsExplain: "",
  hasCurrentPets: "",
  currentPetsList: "",
  currentPetsVaccinated: "",
  currentPetsHeartworm: "",
  hasPreviousPets: "",
  previousPetsOutcome: "",
  vetName: "",
  vetPhone: "",
  vetRecordsName: "",
  fosteredBefore: "",
  volunteeredBefore: "",
  experienceDescription: "",
  comfortableWith: [],
  cannotManage: "",
  hoursAlone: "",
  whereStay: "",
  whereSleep: "",
  separationPlan: "",
  exercisePlan: "",
  followInstructions: "",
  useCrate: "",
  leashOrEnclosure: "",
  leftOutsideUnattended: "",
  leftOutsideExplain: "",
  reliableTransportation: "",
  validLicenseInsurance: "",
  ableToTransport: "",
  travelDistance: "",
  safeTransportRestraint: "",
  comfortableMedication: "",
  comfortableMonitoring: "",
  contactBeforeNonEmergencyVet: "",
  contactImmediatelyEmergency: "",
  useApprovedVetsOnly: "",
  willingProvideUpdates: "",
  willingCommunicateHonestly: "",
  willingMeetGreets: "",
  willingSpeakWithApplicants: "",
  understandFinalDecision: "",
  understandNoOwnership: "",
  interestedAdoptingFoster: "",
  emergencyBackupCare: "",
  upcomingChanges: "",
  upcomingChangesExplain: "",
  noticeNeeded: "",
  agreeContactIfCannotFoster: "",
  agreeNoUnauthorizedTransfer: "",
  willingHomeCheck: "",
  authorizeContact: "",
  ref1Name: "",
  ref1Relationship: "",
  ref1Contact: "",
  ref2Name: "",
  ref2Relationship: "",
  ref2Contact: "",
  previousRescueReference: "",
  signatureName: "",
  signatureDate: "",
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

  const renting = form.homeOwnership === "Rent";
  const hasCurrentOrPreviousPets = form.hasCurrentPets === "Yes" || form.hasPreviousPets === "Yes";

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
    if (form.hasAllergies === "Yes" && !form.allergyExplain.trim()) {
      setError("Please describe the household's pet allergies.");
      return;
    }
    if (form.yardFenced === "Yes" && !form.fenceDescription.trim()) {
      setError("Please describe the fence (height, material, and whether gates lock securely).");
      return;
    }
    if (form.restrictions === "Yes" && !form.restrictionsExplain.trim()) {
      setError("Please explain the restriction that could affect fostering.");
      return;
    }
    if (form.hasCurrentPets === "Yes" && !form.currentPetsList.trim()) {
      setError("Please list your current pets (species, breed, age, sex, and temperament).");
      return;
    }
    if (hasCurrentOrPreviousPets && !form.vetName.trim()) {
      setError("Please provide your veterinarian or clinic name.");
      return;
    }
    if (form.leftOutsideUnattended === "Yes" && !form.leftOutsideExplain.trim()) {
      setError("Please explain when the foster dog would be left outside unattended.");
      return;
    }
    if (form.upcomingChanges === "Yes" && !form.upcomingChangesExplain.trim()) {
      setError("Please explain the upcoming travel, move, or schedule change.");
      return;
    }
    if (!certified) {
      setError("Please review and check the foster agreement certification.");
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
          Thank you for applying to foster with Sky&rsquo;s Path to Home. We review every
          application carefully and will follow up as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="space-y-4">
        <SectionHeading>Applicant Information</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="foster-first-name" label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required />
          <TextField id="foster-last-name" label="Last name" value={form.lastName} onChange={(v) => update("lastName", v)} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="foster-email" label="Email address" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <TextField id="foster-phone" label="Phone number" type="tel" value={form.phone} onChange={(v) => update("phone", v)} required />
        </div>
        <TextField id="foster-street" label="Street address" value={form.streetAddress} onChange={(v) => update("streetAddress", v)} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="foster-city" label="City" value={form.city} onChange={(v) => update("city", v)} required />
          <TextField id="foster-state" label="State" value={form.state} onChange={(v) => update("state", v)} required />
          <TextField id="foster-zip" label="ZIP code" value={form.zip} onChange={(v) => update("zip", v)} required />
        </div>
        <TextField id="foster-age" label="Your age" type="number" min={18} value={form.applicantAge} onChange={(v) => update("applicantAge", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Foster Interest</SectionHeading>
        <TextAreaField id="foster-why" label="Why are you interested in fostering for Sky's Path to Home?" value={form.whyFoster} onChange={(v) => update("whyFoster", v)} required />
        <CheckboxGroupField
          label="What type of foster placement are you interested in?"
          values={form.placementTypes}
          onChange={(v) => update("placementTypes", v)}
          options={[
            "Short-term foster",
            "Long-term foster",
            "Emergency foster",
            "Medical foster",
            "Hospice foster",
            "Puppy foster",
            "Adult dog foster",
            "Senior dog foster",
            "Transport-only assistance",
            "Temporary respite foster",
          ]}
        />
        <RadioGroupField
          name="fosterDuration"
          label="How long can you typically foster a dog?"
          value={form.fosterDuration}
          onChange={(v) => update("fosterDuration", v)}
          options={["A few days", "One to two weeks", "Several weeks", "Until the dog is adopted", "It depends on the dog"]}
          required
        />
        <TextField id="foster-availability" label="How soon are you available to begin fostering?" value={form.availability} onChange={(v) => update("availability", v)} required />
        <TextField id="foster-how-many" label="How many dogs can you foster at one time?" type="number" min={1} value={form.howManyDogs} onChange={(v) => update("howManyDogs", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Home and Household</SectionHeading>
        <RadioGroupField name="homeType" label="What type of home do you live in?" value={form.homeType} onChange={(v) => update("homeType", v)} options={["House", "Apartment", "Townhome or condo", "Mobile home", "Other"]} required />
        <RadioGroupField name="homeOwnership" label="Do you own or rent your home?" value={form.homeOwnership} onChange={(v) => update("homeOwnership", v)} options={["Own", "Rent", "Live with family or another arrangement"]} required />
        {renting && (
          <>
            <RadioGroupField name="landlordAllowsFoster" label="Does your landlord or property manager allow foster dogs?" value={form.landlordAllowsFoster} onChange={(v) => update("landlordAllowsFoster", v)} options={["Yes", "No", "Not applicable"]} required />
            <TextAreaField id="foster-landlord" label="Landlord or property manager name and contact information" value={form.landlordInfo} onChange={(v) => update("landlordInfo", v)} required />
          </>
        )}
        <TextAreaField id="foster-household" label="Who lives in your household? (Include all adults and children, and ages of children.)" value={form.household} onChange={(v) => update("household", v)} required />
        <YesNoField name="householdAgrees" label="Does everyone in the household agree to fostering a dog?" value={form.householdAgrees} onChange={(v) => update("householdAgrees", v)} required />
        <YesNoField name="hasAllergies" label="Does anyone in the household have pet allergies?" value={form.hasAllergies} onChange={(v) => update("hasAllergies", v)} required />
        {form.hasAllergies === "Yes" && (
          <TextAreaField id="foster-allergy-explain" label="Please explain" value={form.allergyExplain} onChange={(v) => update("allergyExplain", v)} required />
        )}
        <RadioGroupField name="yardFenced" label="Is your yard fenced?" value={form.yardFenced} onChange={(v) => update("yardFenced", v)} options={["Yes", "No", "Partially"]} required />
        {(form.yardFenced === "Yes" || form.yardFenced === "Partially") && (
          <TextAreaField id="foster-fence-desc" label="Describe the fence (height, material, and whether gates lock securely)" value={form.fenceDescription} onChange={(v) => update("fenceDescription", v)} required />
        )}
        <YesNoField name="restrictions" label="Are there any homeowners association, lease, zoning, or local restrictions that could affect fostering?" value={form.restrictions} onChange={(v) => update("restrictions", v)} required />
        {form.restrictions === "Yes" && (
          <TextAreaField id="foster-restrictions-explain" label="Please explain" value={form.restrictionsExplain} onChange={(v) => update("restrictionsExplain", v)} required />
        )}
      </div>

      <div className="space-y-4">
        <SectionHeading>Current and Previous Pets</SectionHeading>
        <YesNoField name="hasCurrentPets" label="Do you currently have pets?" value={form.hasCurrentPets} onChange={(v) => update("hasCurrentPets", v)} required />
        {form.hasCurrentPets === "Yes" && (
          <>
            <TextAreaField
              id="foster-current-pets"
              label="List all current pets (species, breed, age, sex, spayed/neutered status, vaccination status, and temperament around other animals)"
              value={form.currentPetsList}
              onChange={(v) => update("currentPetsList", v)}
              required
            />
            <RadioGroupField name="currentPetsVaccinated" label="Are all current pets up to date on vaccinations and routine veterinary care?" value={form.currentPetsVaccinated} onChange={(v) => update("currentPetsVaccinated", v)} options={["Yes", "No", "Not applicable"]} required />
            <RadioGroupField name="currentPetsHeartworm" label="Have your current dogs been tested for heartworm, when appropriate?" value={form.currentPetsHeartworm} onChange={(v) => update("currentPetsHeartworm", v)} options={["Yes", "No", "Not applicable"]} required />
          </>
        )}
        <YesNoField name="hasPreviousPets" label="Have you owned pets previously?" value={form.hasPreviousPets} onChange={(v) => update("hasPreviousPets", v)} required />
        {form.hasPreviousPets === "Yes" && (
          <RadioGroupField
            name="previousPetsOutcome"
            label="What happened to your previous pets?"
            value={form.previousPetsOutcome}
            onChange={(v) => update("previousPetsOutcome", v)}
            options={["Still living with applicant", "Passed away", "Rehomed", "Returned to a rescue or shelter", "Other circumstances"]}
            required
          />
        )}
        {hasCurrentOrPreviousPets && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="foster-vet-name" label="Veterinarian or clinic name" value={form.vetName} onChange={(v) => update("vetName", v)} required />
              <TextField id="foster-vet-phone" label="Veterinarian phone number" type="tel" value={form.vetPhone} onChange={(v) => update("vetPhone", v)} />
            </div>
            <TextField id="foster-vet-records" label="Name under which veterinary records are listed" value={form.vetRecordsName} onChange={(v) => update("vetRecordsName", v)} />
          </>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeading>Foster Experience</SectionHeading>
        <YesNoField name="fosteredBefore" label="Have you fostered animals before?" value={form.fosteredBefore} onChange={(v) => update("fosteredBefore", v)} required />
        <YesNoField name="volunteeredBefore" label="Have you previously volunteered with a rescue, shelter, or animal-welfare organization?" value={form.volunteeredBefore} onChange={(v) => update("volunteeredBefore", v)} required />
        <TextAreaField id="foster-experience" label="Describe your experience caring for dogs" value={form.experienceDescription} onChange={(v) => update("experienceDescription", v)} required />
        <CheckboxGroupField
          label="Are you comfortable caring for dogs with any of the following needs?"
          values={form.comfortableWith}
          onChange={(v) => update("comfortableWith", v)}
          options={["Basic training needs", "House-training needs", "Separation anxiety", "Fear or shyness", "Leash reactivity", "Dog-selective behavior", "Medical needs", "Medication administration", "Post-surgical care", "Senior-dog care", "Puppy care", "None of the above"]}
        />
        <TextAreaField id="foster-cannot-manage" label="Are there any behaviors or medical needs you are not able to manage? (Enter 'None' if not applicable.)" value={form.cannotManage} onChange={(v) => update("cannotManage", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Daily Care and Supervision</SectionHeading>
        <TextField id="foster-hours-alone" label="How many hours will the foster dog usually be alone each day?" type="number" min={0} max={24} value={form.hoursAlone} onChange={(v) => update("hoursAlone", v)} required />
        <RadioGroupField name="whereStay" label="Where will the foster dog stay when no one is home?" value={form.whereStay} onChange={(v) => update("whereStay", v)} options={["Crate", "Separate room", "Loose inside the home", "Outdoor kennel", "Other"]} required />
        <TextField id="foster-where-sleep" label="Where will the foster dog sleep?" value={form.whereSleep} onChange={(v) => update("whereSleep", v)} required />
        <TextAreaField id="foster-separation" label="How will you keep the foster dog separated from resident animals during the initial adjustment period?" value={form.separationPlan} onChange={(v) => update("separationPlan", v)} required />
        <TextAreaField id="foster-exercise" label="How will you provide exercise, enrichment, and basic training?" value={form.exercisePlan} onChange={(v) => update("exercisePlan", v)} required />
        <YesNoField name="followInstructions" label="Are you willing to follow Sky's Path to Home's feeding, medication, training, and safety instructions?" value={form.followInstructions} onChange={(v) => update("followInstructions", v)} required />
        <YesNoField name="useCrate" label="Are you willing to use a crate when required for safety, decompression, transport, or medical recovery?" value={form.useCrate} onChange={(v) => update("useCrate", v)} required />
        <YesNoField name="leashOrEnclosure" label="Are you willing to keep the foster dog on a leash or in a secure enclosure whenever outdoors?" value={form.leashOrEnclosure} onChange={(v) => update("leashOrEnclosure", v)} required />
        <YesNoField name="leftOutsideUnattended" label="Will the foster dog ever be left outside unattended?" value={form.leftOutsideUnattended} onChange={(v) => update("leftOutsideUnattended", v)} required />
        {form.leftOutsideUnattended === "Yes" && (
          <TextAreaField id="foster-left-outside-explain" label="Please explain" value={form.leftOutsideExplain} onChange={(v) => update("leftOutsideExplain", v)} required />
        )}
      </div>

      <div className="space-y-4">
        <SectionHeading>Transportation and Appointments</SectionHeading>
        <YesNoField name="reliableTransportation" label="Do you have reliable transportation?" value={form.reliableTransportation} onChange={(v) => update("reliableTransportation", v)} required />
        <YesNoField name="validLicenseInsurance" label="Do you have a valid driver's license and current automobile insurance?" value={form.validLicenseInsurance} onChange={(v) => update("validLicenseInsurance", v)} required />
        <RadioGroupField name="ableToTransport" label="Are you able to transport the foster dog to veterinary appointments, adoption events, meet-and-greets, or transport handoffs?" value={form.ableToTransport} onChange={(v) => update("ableToTransport", v)} options={["Yes", "No", "Sometimes"]} required />
        <TextField id="foster-travel-distance" label="How far are you willing to travel for foster-related appointments or transport?" value={form.travelDistance} onChange={(v) => update("travelDistance", v)} required />
        <YesNoField name="safeTransportRestraint" label="Are you able to safely transport a dog in a crate or with an approved vehicle restraint?" value={form.safeTransportRestraint} onChange={(v) => update("safeTransportRestraint", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Medical Care</SectionHeading>
        <YesNoField name="comfortableMedication" label="Are you comfortable administering oral or topical medication?" value={form.comfortableMedication} onChange={(v) => update("comfortableMedication", v)} required />
        <YesNoField name="comfortableMonitoring" label="Are you comfortable monitoring a dog after surgery or during illness?" value={form.comfortableMonitoring} onChange={(v) => update("comfortableMonitoring", v)} required />
        <YesNoField name="contactBeforeNonEmergencyVet" label="Will you contact Sky's Path to Home before seeking non-emergency veterinary treatment?" value={form.contactBeforeNonEmergencyVet} onChange={(v) => update("contactBeforeNonEmergencyVet", v)} required />
        <YesNoField name="contactImmediatelyEmergency" label="Will you immediately contact Sky's Path to Home in a medical emergency and follow the organization's emergency procedures?" value={form.contactImmediatelyEmergency} onChange={(v) => update("contactImmediatelyEmergency", v)} required />
        <YesNoField name="useApprovedVetsOnly" label="Are you willing to use only veterinarians or clinics approved by Sky's Path to Home, except during a genuine emergency?" value={form.useApprovedVetsOnly} onChange={(v) => update("useApprovedVetsOnly", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Adoption Support</SectionHeading>
        <YesNoField name="willingProvideUpdates" label="Are you willing to provide photographs, videos, and written updates about the foster dog?" value={form.willingProvideUpdates} onChange={(v) => update("willingProvideUpdates", v)} required />
        <YesNoField name="willingCommunicateHonestly" label="Are you willing to communicate honestly about the dog's behavior, health, temperament, and progress?" value={form.willingCommunicateHonestly} onChange={(v) => update("willingCommunicateHonestly", v)} required />
        <YesNoField name="willingMeetGreets" label="Are you willing to make the foster dog available for approved meet-and-greets and adoption events?" value={form.willingMeetGreets} onChange={(v) => update("willingMeetGreets", v)} required />
        <YesNoField name="willingSpeakWithApplicants" label="Are you willing to speak with approved applicants about the foster dog's personality and routine?" value={form.willingSpeakWithApplicants} onChange={(v) => update("willingSpeakWithApplicants", v)} required />
        <YesNoField name="understandFinalDecision" label="Do you understand that Sky's Path to Home makes the final adoption decision?" value={form.understandFinalDecision} onChange={(v) => update("understandFinalDecision", v)} required />
        <YesNoField name="understandNoOwnership" label="Do you understand that fostering does not automatically give you ownership of the dog?" value={form.understandNoOwnership} onChange={(v) => update("understandNoOwnership", v)} required />
        <RadioGroupField name="interestedAdoptingFoster" label="Would you be interested in adopting your foster dog if approved?" value={form.interestedAdoptingFoster} onChange={(v) => update("interestedAdoptingFoster", v)} options={["Yes", "No", "Maybe"]} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Emergencies and Travel</SectionHeading>
        <TextAreaField id="foster-emergency-care" label="Who will care for the foster dog if you become unavailable or have an emergency?" value={form.emergencyBackupCare} onChange={(v) => update("emergencyBackupCare", v)} required />
        <YesNoField name="upcomingChanges" label="Do you have any upcoming travel, moves, major schedule changes, or other commitments that could affect your ability to foster?" value={form.upcomingChanges} onChange={(v) => update("upcomingChanges", v)} required />
        {form.upcomingChanges === "Yes" && (
          <TextAreaField id="foster-upcoming-explain" label="Please explain" value={form.upcomingChangesExplain} onChange={(v) => update("upcomingChangesExplain", v)} required />
        )}
        <TextField id="foster-notice" label="How much notice would you normally need before accepting a foster dog?" value={form.noticeNeeded} onChange={(v) => update("noticeNeeded", v)} required />
        <YesNoField name="agreeContactIfCannotFoster" label="If you can no longer foster a dog, do you agree to contact Sky's Path to Home and allow reasonable time for another placement to be arranged?" value={form.agreeContactIfCannotFoster} onChange={(v) => update("agreeContactIfCannotFoster", v)} required />
        <YesNoField name="agreeNoUnauthorizedTransfer" label="Do you agree not to give, sell, transfer, surrender, or release the foster dog to any person, shelter, rescue, or organization without written approval from Sky's Path to Home?" value={form.agreeNoUnauthorizedTransfer} onChange={(v) => update("agreeNoUnauthorizedTransfer", v)} required />
      </div>

      <div className="space-y-4">
        <SectionHeading>Home Check and References</SectionHeading>
        <YesNoField name="willingHomeCheck" label="Are you willing to participate in a home visit or virtual home check?" value={form.willingHomeCheck} onChange={(v) => update("willingHomeCheck", v)} required />
        <YesNoField name="authorizeContact" label="Do you authorize Sky's Path to Home to contact your landlord, veterinarian, personal references, or other animal-welfare organizations when evaluating your application?" value={form.authorizeContact} onChange={(v) => update("authorizeContact", v)} required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="foster-ref1-name" label="Personal reference name" value={form.ref1Name} onChange={(v) => update("ref1Name", v)} required />
          <TextField id="foster-ref1-rel" label="Relationship to applicant" value={form.ref1Relationship} onChange={(v) => update("ref1Relationship", v)} required />
          <TextField id="foster-ref1-contact" label="Reference phone number or email" value={form.ref1Contact} onChange={(v) => update("ref1Contact", v)} required />
        </div>
        <p className="text-sm font-medium text-brand-charcoal">Second reference (optional)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField id="foster-ref2-name" label="Reference name" value={form.ref2Name} onChange={(v) => update("ref2Name", v)} />
          <TextField id="foster-ref2-rel" label="Relationship to applicant" value={form.ref2Relationship} onChange={(v) => update("ref2Relationship", v)} />
          <TextField id="foster-ref2-contact" label="Reference phone number or email" value={form.ref2Contact} onChange={(v) => update("ref2Contact", v)} />
        </div>
        <TextField id="foster-rescue-ref" label="Previous rescue or shelter reference (optional)" value={form.previousRescueReference} onChange={(v) => update("previousRescueReference", v)} />
      </div>

      <div className="space-y-4">
        <SectionHeading>Foster Agreement and Certification</SectionHeading>
        <label className="flex items-start gap-2 text-sm text-brand-charcoal">
          <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)} required className="mt-1" />
          <span>
            I certify that the information in this application is true and complete; that
            submitting this application does not guarantee approval as a foster; that all foster
            dogs remain the property of Sky&rsquo;s Path to Home unless an adoption is completed
            through an approved written agreement; that I agree to follow all care, safety,
            medical, transport, and communication instructions provided by Sky&rsquo;s Path to
            Home; that I will not make independent medical, adoption, surrender, transfer, or
            euthanasia decisions for a foster dog; that I will immediately report escapes, bites,
            injuries, illnesses, behavioral concerns, or other significant incidents; and that I
            understand I may be required to sign a separate foster agreement before receiving a
            dog. *
          </span>
        </label>
        <TextField id="foster-signature" label="Electronic signature (type your full legal name)" value={form.signatureName} onChange={(v) => update("signatureName", v)} required />
        <TextField id="foster-signature-date" label="Date" type="date" value={form.signatureDate} onChange={(v) => update("signatureDate", v)} required />
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
        {status === "submitting" ? "Submitting…" : "Submit Foster Application"}
      </button>
    </form>
  );
}
