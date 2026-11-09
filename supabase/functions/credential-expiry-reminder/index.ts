// Supabase Edge Function: emails a reminder when a tracked credential
// (public.credential_expirations) is 30, then 15, then 5 days or fewer from
// expiring -- one email per step. Called once a day by .github/workflows/credential-expiry.yml;
// the table is in supabase/migrations/20261109000000_credential_expiry.sql.
//
// "Verify JWT" stays ON for this function; the workflow presents the
// project's public anon key as its bearer token. The function takes no
// input, and all it can ever do is send the reminder that is already due,
// once per step, to the fixed inbox below.
//
// Required secrets: RESEND_API_KEY (already set for submit-form).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const NOTIFY_EMAIL = "contact_us@skyspath.com";
// Days-before-expiry steps, widest first. The Settings page colours the row
// on the same steps (yellow, orange, red).
const REMIND_STEPS = [30, 15, 5];
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  return Math.round(
    (Date.parse(`${toIsoDate}T00:00:00Z`) - Date.parse(`${fromIsoDate}T00:00:00Z`)) / DAY_MS
  );
}

// The tightest step that `daysLeft` has reached: 12 days left -> 15, 3 -> 5,
// 40 -> null (nothing due yet).
function stepFor(daysLeft: number): number | null {
  let reached: number | null = null;
  for (const step of REMIND_STEPS) {
    if (daysLeft <= step) reached = step;
  }
  return reached;
}

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
  const cutoff = new Date(Date.now() + REMIND_STEPS[0] * DAY_MS).toISOString().slice(0, 10);

  const { data: close, error } = await db
    .from("credential_expirations")
    .select("id, name, renew_steps, expires_on, reminded_at")
    .lte("expires_on", cutoff);
  if (error) return json({ error: error.message }, 500);

  // reminded_at is when the last reminder went out, which also tells us
  // which step that reminder was for. A row is due when it has reached a
  // tighter step than the one already covered.
  const due = (close ?? []).filter((row) => {
    const step = stepFor(daysBetween(today, row.expires_on));
    if (step === null) return false;
    if (!row.reminded_at) return true;
    const covered = stepFor(daysBetween(row.reminded_at.slice(0, 10), row.expires_on));
    return covered === null || step < covered;
  });

  const sent: string[] = [];
  const failed: string[] = [];

  for (const row of due) {
    const daysLeft = daysBetween(today, row.expires_on);
    const step = stepFor(daysLeft);
    const laterSteps = REMIND_STEPS.filter((s) => step !== null && s < step);
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
          laterSteps.length
            ? `If it is still not renewed, another reminder follows at ${laterSteps.join(" and ")} days before the date.`
            : "This is the last reminder for this date.",
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
