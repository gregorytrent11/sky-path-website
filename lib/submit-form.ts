import type { SubmissionFormType } from "@/types/database";

interface SubmitFormArgs {
  formType: SubmissionFormType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  payload?: Record<string, unknown>;
  dogId?: string;
  turnstileToken: string;
}

export async function submitForm(args: SubmitFormArgs): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase configuration.");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/submit-form`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
}
