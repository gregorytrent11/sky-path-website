import type { Submission } from "@/types/database";
import type { AdoptFormState } from "@/components/forms/AdoptApplicationForm";
import type { FosterFormState } from "@/components/forms/FosterApplicationForm";
import { humanizeKey, humanizeValue } from "@/lib/submission-format";

// The admin Submissions page and the PDF export both lay an application out
// from these tables, so a submitted application reads like the form the
// applicant filled in: same sections, same order, same question wording,
// same fields sharing a row. When a question is added to a form, add it here
// too -- the `...LayoutCoversForm` types at the bottom fail the build if a
// form key is missing.

const YES_NO = ["Yes", "No"] as const;
const YES_NO_NA = ["Yes", "No", "Not applicable"] as const;

export type LayoutField = {
  key: string;
  label: string;
  // Fields that share a row on the form. Full width when left out.
  width?: "half" | "third";
  // Radio choices, printed with the applicant's pick marked.
  options?: readonly string[];
  // A checkbox group (the stored answer is a list).
  multiple?: boolean;
  // The form only asks this after another answer, so a blank one is left out
  // rather than printed as unanswered.
  hideWhenEmpty?: boolean;
  // A statement the applicant ticks to agree to; the label is the statement.
  agreement?: boolean;
  // A yyyy-mm-dd answer from a date input.
  date?: boolean;
  // A textarea on the form: the blank paper copy leaves room to write.
  long?: boolean;
  // Wording for the blank paper copy, where a follow-up question can't
  // appear only after a "Yes" the way it does on screen.
  paperLabel?: string;
};

// A `note` is the form's guidance to the applicant; it's printed on the
// blank paper copy only, not alongside a submitted application's answers.
export type LayoutItem = LayoutField | { subheading: string } | { note: string };

export type LayoutSection = { title: string; items: readonly LayoutItem[] };

function referenceItems(number: "One" | "Two" | "Three", title: string) {
  return [
    { subheading: title },
    { key: `reference${number}FullName`, label: "Full name", width: "half" },
    { key: `reference${number}Relationship`, label: "Relationship to applicant", width: "half" },
    { key: `reference${number}YearsKnown`, label: "How long have you known this person?" },
    { key: `reference${number}Email`, label: "Email address (optional)", width: "half" },
    { key: `reference${number}Phone`, label: "Phone number", width: "half" },
    {
      key: `reference${number}ObservedAnimalCare`,
      label: "Has this person observed you caring for an animal?",
      options: YES_NO,
    },
  ] as const;
}

const APPLICANT_ITEMS = [
  { key: "firstName", label: "First name", width: "half" },
  { key: "lastName", label: "Last name", width: "half" },
  { key: "email", label: "Email address", width: "half" },
  { key: "phone", label: "Phone number", width: "half" },
  { key: "streetAddress", label: "Street address" },
  { key: "city", label: "City", width: "third" },
  { key: "state", label: "State", width: "third" },
  { key: "zip", label: "ZIP code", width: "third" },
] as const;

export const ADOPT_LAYOUT = [
  {
    title: "Dog Information",
    items: [
      { key: "dogName", label: "Which dog(s) are you interested in?" },
      { key: "whyInterested", long: true, label: "Why are you interested in this dog?" },
    ],
  },
  {
    title: "Applicant Information",
    items: [
      ...APPLICANT_ITEMS,
      { key: "atLeastTwentyOne", label: "Are you at least 21 years of age or older?", options: YES_NO },
    ],
  },
  {
    title: "Home and Household",
    items: [
      {
        key: "housingType",
        label: "Housing type",
        options: ["House", "Apartment", "Townhome or condo", "Mobile home", "Other"],
      },
      {
        key: "homeOwnership",
        label: "Home ownership status",
        options: ["Own", "Rent", "Live with family or another arrangement"],
      },
      {
        key: "landlordInfo", long: true,
        label: "Landlord or property manager name and phone number or email address (N/A if none)",
      },
      { key: "timeInCurrentHome", label: "How long have you lived in your current home?" },
      { key: "yardFenced", label: "Is the yard fenced?", options: ["Yes", "No", "Partially"] },
      {
        key: "unfencedYardPlan", long: true,
        label: "If no or partially fenced, how will you safely secure and supervise the dog while outside?",
        hideWhenEmpty: true,
      },
      {
        key: "agreesToFencePhotos",
        label:
          "Do you agree to provide photos of your fenced or secured outdoor area if requested by Sky's Path to Home?",
        options: YES_NO,
      },
      {
        key: "household", long: true,
        label: "Who lives in the household? (Include number of adults and children, and ages of children.)",
      },
      {
        key: "householdAgrees",
        label: "Does everyone in the household agree to the adoption?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "Dog Care Plan",
    items: [
      { key: "hoursAlone", label: "How many hours will the dog usually be alone each day?" },
      { key: "whereStay", long: true, label: "Where will the dog stay when no one is home?" },
      { key: "whereDogSleeps", long: true, label: "Where will your new dog sleep?" },
      { key: "exercisePlan", long: true, label: "How will you provide exercise, training, and enrichment?" },
      {
        key: "adjustmentTime", long: true,
        label: "How much time do you plan to give your new dog to adjust to their new home?",
      },
    ],
  },
  {
    title: "Readiness and Screening",
    items: [
      {
        key: "preparedForCosts",
        label:
          "Are you prepared for the ongoing costs of dog ownership (food, routine and emergency veterinary care, training, grooming, licensing, and other expenses)?",
        options: YES_NO,
      },
      { key: "annualVetBudget", label: "How much do you plan to spend on vet bills in a typical year?" },
      {
        key: "emergencyVetPlan", long: true,
        label: "How do you plan to handle unexpected or emergency veterinary expenses?",
      },
      {
        key: "lifelongCommitment",
        label:
          "Are you prepared to provide this dog with a permanent, lifelong home, regardless of their age or how many years that commitment may be?",
        options: YES_NO,
      },
      {
        key: "majorLifeChangePlan", long: true,
        label:
          "What would you do with the dog if you moved, changed jobs, had a baby, or experienced another major life change?",
      },
      { key: "currentPets", long: true, label: "Current Pets" },
      {
        key: "incompatiblePetsPlan", long: true,
        label: "What will you do if your new dog is not compatible with your current pets?",
      },
      { key: "vetName", label: "Veterinarian or clinic name", width: "half" },
      { key: "vetPhone", label: "Veterinarian phone number", width: "half" },
      { note: "Put N/A if this is your first animal or you have no other animals at this time." },
      { key: "currentPetVetStatus", long: true, label: "Current pet vaccination and veterinary care status" },
      { key: "behavioralPlan", long: true, label: "Plan for handling behavioral or adjustment challenges" },
      {
        key: "surrenderedPetBefore",
        label: "Have you ever surrendered, rehomed, given away, or returned a pet?",
        options: YES_NO,
      },
      { key: "surrenderedPetExplanation", long: true, label: "If yes, please explain why. If no, please type N/A." },
      { key: "houseTrainingPlan", long: true, label: "How will you deal with house training accidents?" },
      {
        key: "rescueDogExperience", long: true,
        label:
          "Have you previously cared for a rescue dog, particularly one with medical needs, special needs, or a history of abuse or neglect? Please describe your experience and the type of care you provided.",
      },
      { key: "growlingPlan", long: true, label: "How will you deal with the dog growling/showing teeth?" },
      {
        key: "rehomingCircumstances", long: true,
        label: "Under what circumstances, if any, would you consider returning or rehoming the dog?",
      },
      {
        key: "willContactRescueFirst",
        label:
          "If you can no longer care for the dog, do you agree to contact Sky's Path to Home rather than giving the dog away, surrendering them to a shelter, or rehoming them yourself?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "References",
    items: [
      {
        note: "References must be at least 18 years old, and at least 1 reference should not be an immediate family member. Sky's Path to Home will contact references and must be able to speak with them before your adoption application can be approved.",
      },
      { note: "Please let your references know that we will be reaching out." },
      ...referenceItems("One", "Reference #1"),
      ...referenceItems("Two", "Reference #2"),
      ...referenceItems("Three", "Reference #3"),
      { subheading: "Reference Authorization" },
      {
        key: "referenceAuthorization",
        agreement: true,
        label:
          "I authorize Sky's Path to Home to contact the references listed in this application and to ask questions regarding my reliability, responsibility, animal-care experience, and suitability to adopt a dog. I understand that Sky's Path to Home may consider the information provided by my references when reviewing my adoption application.",
      },
    ],
  },
  {
    title: "Certification and Signature",
    items: [
      {
        key: "certified",
        agreement: true,
        label:
          "I certify that the information in this application is true and complete; that Sky's Path to Home may contact my veterinarian, landlord, property manager, or references when necessary; and that submitting this application does not guarantee adoption.",
      },
      {
        key: "signatureName",
        label: "Electronic signature (type your full legal name)",
        paperLabel: "Signature (sign your full legal name)",
        width: "half",
      },
      { key: "signatureDate", label: "Date", width: "half", date: true },
    ],
  },
] as const satisfies readonly LayoutSection[];

export const FOSTER_LAYOUT = [
  {
    title: "Applicant Information",
    items: [...APPLICANT_ITEMS, { key: "applicantAge", label: "Your age" }],
  },
  {
    title: "Foster Interest",
    items: [
      { key: "whyFoster", long: true, label: "Why are you interested in fostering for Sky's Path to Home?" },
      {
        key: "placementTypes",
        label: "What type of foster placement are you interested in?",
        multiple: true,
        options: [
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
        ],
      },
      {
        key: "fosterDuration",
        label: "How long can you typically foster a dog?",
        options: ["A few days", "One to two weeks", "Several weeks", "Until the dog is adopted", "It depends on the dog"],
      },
      { key: "availability", label: "How soon are you available to begin fostering?" },
      { key: "howManyDogs", label: "How many dogs can you foster at one time?" },
    ],
  },
  {
    title: "Home and Household",
    items: [
      {
        key: "homeType",
        label: "What type of home do you live in?",
        options: ["House", "Apartment", "Townhome or condo", "Mobile home", "Other"],
      },
      {
        key: "homeOwnership",
        label: "Do you own or rent your home?",
        options: ["Own", "Rent", "Live with family or another arrangement"],
      },
      {
        key: "landlordAllowsFoster", paperLabel: "If you rent: does your landlord or property manager allow foster dogs?",
        label: "Does your landlord or property manager allow foster dogs?",
        options: YES_NO_NA,
        hideWhenEmpty: true,
      },
      {
        key: "landlordInfo", long: true, paperLabel: "If you rent: landlord or property manager name and contact information",
        label: "Landlord or property manager name and contact information",
        hideWhenEmpty: true,
      },
      {
        key: "household", long: true,
        label: "Who lives in your household? (Include all adults and children, and ages of children.)",
      },
      {
        key: "householdAgrees",
        label: "Does everyone in the household agree to fostering a dog?",
        options: YES_NO,
      },
      { key: "hasAllergies", label: "Does anyone in the household have pet allergies?", options: YES_NO },
      { key: "allergyExplain", long: true, paperLabel: "If yes, please explain", label: "Please explain", hideWhenEmpty: true },
      { key: "yardFenced", label: "Is your yard fenced?", options: ["Yes", "No", "Partially"] },
      {
        key: "fenceDescription", long: true, paperLabel: "If fenced or partially fenced: describe the fence (height, material, and whether gates lock securely)",
        label: "Describe the fence (height, material, and whether gates lock securely)",
        hideWhenEmpty: true,
      },
      {
        key: "restrictions",
        label:
          "Are there any homeowners association, lease, zoning, or local restrictions that could affect fostering?",
        options: YES_NO,
      },
      { key: "restrictionsExplain", long: true, paperLabel: "If yes, please explain", label: "Please explain", hideWhenEmpty: true },
    ],
  },
  {
    title: "Current and Previous Pets",
    items: [
      { key: "hasCurrentPets", label: "Do you currently have pets?", options: YES_NO },
      {
        key: "currentPetsList", long: true, paperLabel: "If yes: list all current pets (species, breed, age, sex, spayed/neutered status, vaccination status, and temperament around other animals)",
        label:
          "List all current pets (species, breed, age, sex, spayed/neutered status, vaccination status, and temperament around other animals)",
        hideWhenEmpty: true,
      },
      {
        key: "currentPetsVaccinated", paperLabel: "If yes: are all current pets up to date on vaccinations and routine veterinary care?",
        label: "Are all current pets up to date on vaccinations and routine veterinary care?",
        options: YES_NO_NA,
        hideWhenEmpty: true,
      },
      {
        key: "currentPetsHeartworm", paperLabel: "If yes: have your current dogs been tested for heartworm, when appropriate?",
        label: "Have your current dogs been tested for heartworm, when appropriate?",
        options: YES_NO_NA,
        hideWhenEmpty: true,
      },
      { key: "hasPreviousPets", label: "Have you owned pets previously?", options: YES_NO },
      {
        key: "previousPetsOutcome", paperLabel: "If yes: what happened to your previous pets?",
        label: "What happened to your previous pets?",
        options: [
          "Still living with applicant",
          "Passed away",
          "Rehomed",
          "Returned to a rescue or shelter",
          "Other circumstances",
        ],
        hideWhenEmpty: true,
      },
      { key: "vetName", paperLabel: "Veterinarian or clinic name (if you have or had pets)", label: "Veterinarian or clinic name", width: "half", hideWhenEmpty: true },
      { key: "vetPhone", label: "Veterinarian phone number", width: "half", hideWhenEmpty: true },
      {
        key: "vetRecordsName",
        label: "Name under which veterinary records are listed",
        hideWhenEmpty: true,
      },
    ],
  },
  {
    title: "Foster Experience",
    items: [
      { key: "fosteredBefore", label: "Have you fostered animals before?", options: YES_NO },
      {
        key: "volunteeredBefore",
        label: "Have you previously volunteered with a rescue, shelter, or animal-welfare organization?",
        options: YES_NO,
      },
      { key: "experienceDescription", long: true, label: "Describe your experience caring for dogs" },
      {
        key: "comfortableWith",
        label: "Are you comfortable caring for dogs with any of the following needs?",
        multiple: true,
        options: [
          "Basic training needs",
          "House-training needs",
          "Separation anxiety",
          "Fear or shyness",
          "Leash reactivity",
          "Dog-selective behavior",
          "Medical needs",
          "Medication administration",
          "Post-surgical care",
          "Senior-dog care",
          "Puppy care",
          "None of the above",
        ],
      },
      {
        key: "cannotManage", long: true,
        label:
          "Are there any behaviors or medical needs you are not able to manage? (Enter 'None' if not applicable.)",
      },
    ],
  },
  {
    title: "Daily Care and Supervision",
    items: [
      { key: "hoursAlone", label: "How many hours will the foster dog usually be alone each day?" },
      {
        key: "whereStay",
        label: "Where will the foster dog stay when no one is home?",
        options: ["Crate", "Separate room", "Loose inside the home", "Outdoor kennel", "Other"],
      },
      { key: "whereSleep", label: "Where will the foster dog sleep?" },
      {
        key: "separationPlan", long: true,
        label:
          "How will you keep the foster dog separated from resident animals during the initial adjustment period?",
      },
      { key: "exercisePlan", long: true, label: "How will you provide exercise, enrichment, and basic training?" },
      {
        key: "followInstructions",
        label:
          "Are you willing to follow Sky's Path to Home's feeding, medication, training, and safety instructions?",
        options: YES_NO,
      },
      {
        key: "useCrate",
        label:
          "Are you willing to use a crate when required for safety, decompression, transport, or medical recovery?",
        options: YES_NO,
      },
      {
        key: "leashOrEnclosure",
        label: "Are you willing to keep the foster dog on a leash or in a secure enclosure whenever outdoors?",
        options: YES_NO,
      },
      {
        key: "leftOutsideUnattended",
        label: "Will the foster dog ever be left outside unattended?",
        options: YES_NO,
      },
      { key: "leftOutsideExplain", long: true, paperLabel: "If yes, please explain", label: "Please explain", hideWhenEmpty: true },
    ],
  },
  {
    title: "Transportation and Appointments",
    items: [
      { key: "reliableTransportation", label: "Do you have reliable transportation?", options: YES_NO },
      {
        key: "validLicenseInsurance",
        label: "Do you have a valid driver's license and current automobile insurance?",
        options: YES_NO,
      },
      {
        key: "ableToTransport",
        label:
          "Are you able to transport the foster dog to veterinary appointments, adoption events, meet-and-greets, or transport handoffs?",
        options: ["Yes", "No", "Sometimes"],
      },
      {
        key: "travelDistance",
        label: "How far are you willing to travel for foster-related appointments or transport?",
      },
      {
        key: "safeTransportRestraint",
        label: "Are you able to safely transport a dog in a crate or with an approved vehicle restraint?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "Medical Care",
    items: [
      {
        key: "comfortableMedication",
        label: "Are you comfortable administering oral or topical medication?",
        options: YES_NO,
      },
      {
        key: "comfortableMonitoring",
        label: "Are you comfortable monitoring a dog after surgery or during illness?",
        options: YES_NO,
      },
      {
        key: "contactBeforeNonEmergencyVet",
        label: "Will you contact Sky's Path to Home before seeking non-emergency veterinary treatment?",
        options: YES_NO,
      },
      {
        key: "contactImmediatelyEmergency",
        label:
          "Will you immediately contact Sky's Path to Home in a medical emergency and follow the organization's emergency procedures?",
        options: YES_NO,
      },
      {
        key: "useApprovedVetsOnly",
        label:
          "Are you willing to use only veterinarians or clinics approved by Sky's Path to Home, except during a genuine emergency?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "Adoption Support",
    items: [
      {
        key: "willingProvideUpdates",
        label: "Are you willing to provide photographs, videos, and written updates about the foster dog?",
        options: YES_NO,
      },
      {
        key: "willingCommunicateHonestly",
        label:
          "Are you willing to communicate honestly about the dog's behavior, health, temperament, and progress?",
        options: YES_NO,
      },
      {
        key: "willingMeetGreets",
        label: "Are you willing to make the foster dog available for approved meet-and-greets and adoption events?",
        options: YES_NO,
      },
      {
        key: "willingSpeakWithApplicants",
        label: "Are you willing to speak with approved applicants about the foster dog's personality and routine?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "Emergencies and Travel",
    items: [
      {
        key: "emergencyBackupCare", long: true,
        label: "Who will care for the foster dog if you become unavailable or have an emergency?",
      },
      {
        key: "upcomingChanges",
        label:
          "Do you have any upcoming travel, moves, major schedule changes, or other commitments that could affect your ability to foster?",
        options: YES_NO,
      },
      { key: "upcomingChangesExplain", long: true, paperLabel: "If yes, please explain", label: "Please explain", hideWhenEmpty: true },
      { key: "noticeNeeded", label: "How much notice would you normally need before accepting a foster dog?" },
      {
        key: "agreeContactIfCannotFoster",
        label:
          "If you can no longer foster a dog, do you agree to contact Sky's Path to Home and allow reasonable time for another placement to be arranged?",
        options: YES_NO,
      },
      {
        key: "agreeNoUnauthorizedTransfer",
        label:
          "Do you agree not to give, sell, transfer, surrender, or release the foster dog to any person, shelter, rescue, or organization without written approval from Sky's Path to Home?",
        options: YES_NO,
      },
    ],
  },
  {
    title: "References",
    items: [
      {
        key: "authorizeContact",
        label:
          "Do you authorize Sky's Path to Home to contact your landlord, veterinarian, personal references, or other animal-welfare organizations when evaluating your application?",
        options: YES_NO,
      },
      { key: "ref1Name", label: "Personal reference name", width: "third" },
      { key: "ref1Relationship", label: "Relationship to applicant", width: "third" },
      { key: "ref1Contact", label: "Reference phone number or email", width: "third" },
      { subheading: "Second reference (optional)" },
      { key: "ref2Name", label: "Reference name", width: "third" },
      { key: "ref2Relationship", label: "Relationship to applicant", width: "third" },
      { key: "ref2Contact", label: "Reference phone number or email", width: "third" },
      { key: "previousRescueReference", label: "Previous rescue or shelter reference (optional)" },
    ],
  },
  {
    title: "Foster Agreement and Certification",
    items: [
      {
        key: "certified",
        agreement: true,
        label:
          "I certify that the information in this application is true and complete; that submitting this application does not guarantee approval as a foster; that all foster dogs remain the property of Sky's Path to Home unless an adoption is completed through an approved written agreement; that I agree to follow all care, safety, medical, transport, and communication instructions provided by Sky's Path to Home; that I will not make independent medical, adoption, surrender, transfer, or euthanasia decisions for a foster dog; that I will immediately report escapes, bites, injuries, illnesses, behavioral concerns, or other significant incidents; and that I understand I may be required to sign a separate foster agreement before receiving a dog.",
      },
      {
        key: "signatureName",
        label: "Electronic signature (type your full legal name)",
        paperLabel: "Signature (sign your full legal name)",
        width: "half",
      },
      { key: "signatureDate", label: "Date", width: "half", date: true },
    ],
  },
] as const satisfies readonly LayoutSection[];

const LAYOUTS: Partial<Record<Submission["form_type"], readonly LayoutSection[]>> = {
  adopt_application: ADOPT_LAYOUT,
  foster_application: FOSTER_LAYOUT,
};

// What the two renderers actually draw: the layout with this submission's
// answers filled in and the fields already grouped into rows.
export type ResolvedField = {
  key: string;
  label: string;
  // Display text, or null when the question was left blank.
  value: string | null;
  // Present for radio / checkbox questions.
  options?: readonly string[];
  multiple?: boolean;
  selected: string[];
  agreement?: boolean;
  checked?: boolean;
  long?: boolean;
};

export type ResolvedRow =
  | { kind: "fields"; columns: 1 | 2 | 3; fields: ResolvedField[] }
  | { kind: "subheading"; text: string }
  | { kind: "note"; text: string };

export type ResolvedSection = { title: string; rows: ResolvedRow[] };

// Answers the edge function also stores in their own columns. Every
// application carries them in the payload too, but fall back just in case.
function columnFallback(submission: Submission, key: string): unknown {
  if (key === "email") return submission.email;
  if (key === "phone") return submission.phone;
  if (key === "whyInterested" || key === "whyFoster") return submission.message;
  return undefined;
}

function formatDateAnswer(value: string): string {
  // Split by hand: `new Date("2026-09-21")` is UTC midnight, which prints as
  // the day before in Montana.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[2]}/${match[3]}/${match[1]}` : value;
}

function resolveField(submission: Submission, field: LayoutField): ResolvedField {
  const payload = submission.payload || {};
  const raw = payload[field.key] ?? columnFallback(submission, field.key);
  let value = humanizeValue(raw);
  if (value !== null && field.date) value = formatDateAnswer(value);
  const selected = Array.isArray(raw)
    ? raw.map((item) => String(item))
    : typeof raw === "string" && raw !== ""
      ? [raw]
      : [];
  // An answer saved before an option was reworded isn't one of today's
  // choices, so print it as plain text rather than an unmarked option list.
  const optionsStillFit = selected.every((item) => field.options?.includes(item));
  return {
    key: field.key,
    label: field.label,
    value,
    options: field.options && optionsStillFit ? field.options : undefined,
    multiple: field.multiple,
    selected,
    agreement: field.agreement,
    checked: field.agreement ? raw === true : undefined,
  };
}

// A subheading's block (Reference #3, the optional second foster reference)
// is left out when nothing in it was answered -- applications sent in before
// that block existed would otherwise show a run of empty boxes.
function dropBlankGroups(rows: ResolvedRow[]): ResolvedRow[] {
  const kept: ResolvedRow[] = [];
  for (let i = 0; i < rows.length; ) {
    let end = i + 1;
    if (rows[i].kind === "subheading") {
      while (end < rows.length && rows[end].kind !== "subheading") end += 1;
      const fields = rows.slice(i + 1, end).flatMap((row) => (row.kind === "fields" ? row.fields : []));
      const blank = fields.length > 0 && fields.every((field) => field.value === null);
      if (blank) {
        i = end;
        continue;
      }
    }
    kept.push(...rows.slice(i, end));
    i = end;
  }
  return kept;
}

const COLUMNS = { half: 2, third: 3 } as const;

// Groups a section's fields into rows the way the form does. `resolve`
// returns null for a field that should be left out.
function buildRows(
  items: readonly LayoutItem[],
  resolve: (item: LayoutField) => ResolvedField | null,
  withNotes = false
): ResolvedRow[] {
  const rows: ResolvedRow[] = [];
  for (const item of items) {
    if ("subheading" in item) {
      rows.push({ kind: "subheading", text: item.subheading });
      continue;
    }
    if ("note" in item) {
      if (withNotes) rows.push({ kind: "note", text: item.note });
      continue;
    }
    const field = resolve(item);
    if (!field) continue;
    const columns = item.width ? COLUMNS[item.width] : 1;
    const last = rows[rows.length - 1];
    if (columns > 1 && last?.kind === "fields" && last.columns === columns && last.fields.length < columns) {
      last.fields.push(field);
    } else {
      rows.push({ kind: "fields", columns, fields: [field] });
    }
  }
  return rows;
}

export type ApplicationFormType = "adopt_application" | "foster_application";

// The form with nothing filled in, for printing and handing out at events:
// every question (including the follow-ups the online form only reveals
// after a "Yes"), every option unmarked, and the form's notes to applicants.
export function blankApplication(formType: ApplicationFormType): ResolvedSection[] {
  return (LAYOUTS[formType] ?? []).map((section) => ({
    title: section.title,
    rows: buildRows(
      section.items,
      (item) => ({
        key: item.key,
        label: item.paperLabel ?? item.label,
        value: null,
        options: item.options,
        multiple: item.multiple,
        selected: [],
        agreement: item.agreement,
        checked: item.agreement ? false : undefined,
        long: item.long,
      }),
      true
    ),
  }));
}

// Returns null for the form types that aren't applications (contact,
// volunteer, request help) -- those keep the short generic view.
export function layoutApplication(submission: Submission): ResolvedSection[] | null {
  const layout = LAYOUTS[submission.form_type];
  if (!layout) return null;

  const placed = new Set<string>();
  const sections: ResolvedSection[] = layout.map((section) => ({
    title: section.title,
    rows: dropBlankGroups(
      buildRows(section.items, (item) => {
        placed.add(item.key);
        const field = resolveField(submission, item);
        return item.hideWhenEmpty && field.value === null ? null : field;
      })
    ),
  }));

  // Questions that have since been dropped from the form (older
  // applications still carry their answers) and anything else unplaced.
  const leftovers = Object.entries(submission.payload || {}).filter(
    ([key, value]) => !placed.has(key) && key !== "subject" && humanizeValue(value) !== null
  );
  if (leftovers.length > 0) {
    const rows: ResolvedRow[] = [];
    leftovers.forEach(([key, value], i) => {
      const field: ResolvedField = { key, label: humanizeKey(key), value: humanizeValue(value), selected: [] };
      if (i % 2 === 0) rows.push({ kind: "fields", columns: 2, fields: [field] });
      else (rows[rows.length - 1] as Extract<ResolvedRow, { kind: "fields" }>).fields.push(field);
    });
    sections.push({ title: "Other Answers", rows });
  }

  return sections;
}

// Build-time guard: every key a form submits must appear in its layout.
type LayoutKeys<L extends readonly LayoutSection[]> = Extract<L[number]["items"][number], { key: string }>["key"];
type AssertNone<T extends never> = T;
export type AdoptLayoutCoversForm = AssertNone<
  Exclude<keyof AdoptFormState | "dogName" | "referenceAuthorization" | "certified", LayoutKeys<typeof ADOPT_LAYOUT>>
>;
export type FosterLayoutCoversForm = AssertNone<
  Exclude<keyof FosterFormState | "certified", LayoutKeys<typeof FOSTER_LAYOUT>>
>;
