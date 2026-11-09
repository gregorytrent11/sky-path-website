// Supabase Edge Function: emails a one-time reminder when a tracked
// credential (public.credential_expirations) is 30 days or fewer from
// expiring. Called once a day by .github/workflows/credential-expiry.yml;
// the table is in supabase/migrations/20261109000000_credential_expiry.sql.
//
// "Verify JWT" stays ON for this function; the workflow presents the
// project's public anon key as its bearer token. The function takes no
// input, and all it can ever do is send the reminder that is already due,
// once, to the fixed inbox below.
//
// Required secrets: RESEND_API_KEY (already set for submit-form).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const NOTIFY_EMAIL = "contact_us@skyspath.com";
const REMIND_DAYS_BEFORE = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

Deno.serve(async () => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return json({ error: "RESEND_API_KEY is not set" }, 500);

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() + REMIND_DAYS_BEFORE * DAY_MS).toISOString().slice(0, 10);

  const { data: due, error } = await db
    .from("credential_expirations")
    .select("id, name, renew_steps, expires_on")
    .is("reminded_at", null)
    .lte("expires_on", cutoff);
  if (error) return json({ error: error.message }, 500);

  const sent: string[] = [];
  const failed: string[] = [];

  for (const row of due ?? []) {
    const daysLeft = Math.round(
      (Date.parse(`${row.expires_on}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS
    );
    const when =
      daysLeft > 1
        ? `expires in ${daysLeft} days, on ${formatDate(row.expires_on)}`
        : daysLeft === 1
          ? `expires tomorrow, ${formatDate(row.expires_on)}`
          : daysLeft === 0
            ? "expires today"
            : `expired on ${formatDate(row.expires_on)}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sky's Path to Home <notifications@skyspath.com>",
        to: NOTIFY_EMAIL,
        subject: `Action needed: ${row.name} ${when}`,
        text: [
          `The ${row.name} for the Sky's Path website ${when}.`,
          "",
          "If it is not renewed before then, the part of the website that depends on it stops working.",
          "",
          "How to renew it:",
          row.renew_steps,
          "",
          "This is the only reminder that will be sent for this date.",
        ].join("\n"),
      }),
    }).catch(() => null);

    // Only stamp the row once the email is accepted, so a Resend outage
    // means tomorrow's run tries again instead of silently skipping it.
    if (response?.ok) {
      await db
        .from("credential_expirations")
        .update({ reminded_at: new Date().toISOString() })
        .eq("id", row.id);
      sent.push(row.name);
    } else {
      failed.push(row.name);
    }
  }

  return json({ checked: today, sent, failed }, failed.length ? 502 : 200);
});
