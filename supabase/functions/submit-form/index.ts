// Supabase Edge Function: verifies a Cloudflare Turnstile token server-side,
// then writes to `submissions` using the service role. This is the ONLY
// write path into that table -- the RLS policies deliberately grant no
// anon insert, so a bad actor hitting PostgREST directly can't skip the
// spam check (see supabase/migrations/20260731220000_init_schema.sql).
//
// Also fires an email alert via Resend on every successful submission.
// Sends from notifications@skyspath.com (domain verified in Resend; DKIM +
// send/rsend CNAMEs live in Bluehost DNS) to the contact_us@skyspath.com
// inbox. Deploying a NOTIFY_EMAIL/from change requires `supabase functions
// deploy submit-form` -- pushing to GitHub does not deploy this function.
//
// Required secrets (supabase secrets set ...):
//   TURNSTILE_SECRET_KEY
//   RESEND_API_KEY
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_FORM_TYPES = new Set([
  "contact",
  "volunteer",
  "request_help",
  "adopt_application",
  "foster_application",
]);

const NOTIFY_EMAIL = "contact_us@skyspath.com";

const FORM_TYPE_LABELS: Record<string, string> = {
  contact: "Contact Form",
  volunteer: "Volunteer Interest",
  request_help: "Request Help",
  adopt_application: "Adoption Application",
  foster_application: "Foster Application",
};

async function notifyByEmail(details: {
  formType: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;

  const label = FORM_TYPE_LABELS[details.formType] ?? details.formType;
  const lines = [
    `New ${label} submission from ${details.name}.`,
    "",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    details.phone ? `Phone: ${details.phone}` : null,
    details.message ? `Message: ${details.message}` : null,
    "",
    "Full details: https://skyspath.com/admin/submissions/",
  ].filter((line) => line !== null);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sky's Path to Home <notifications@skyspath.com>",
        to: NOTIFY_EMAIL,
        subject: `New ${label} Submission - ${details.name}`,
        text: lines.join("\n"),
      }),
    });
  } catch {
    // Email is a best-effort alert -- never let a Resend outage block a
    // submission that already saved successfully.
  }
}

const ALLOWED_ORIGINS = new Set([
  "https://skyspath.com",
  "https://www.skyspath.com",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://skyspath.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const formType = String(body.formType || "");
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const turnstileToken = String(body.turnstileToken || "");

  if (!ALLOWED_FORM_TYPES.has(formType) || !name || !email || !turnstileToken) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers,
    });
  }

  const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";

  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secretKey) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers,
    });
  }

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: turnstileToken,
      ...(clientIp ? { remoteip: clientIp } : {}),
    }),
  });
  const verifyResult = await verifyRes.json();

  if (!verifyResult.success) {
    return new Response(JSON.stringify({ error: "Spam check failed. Please try again." }), {
      status: 400,
      headers,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const phone = body.phone ? String(body.phone) : null;
  const message = body.message ? String(body.message) : null;

  const { error: insertError } = await supabase.from("submissions").insert({
    form_type: formType,
    name,
    email,
    phone,
    message,
    payload: typeof body.payload === "object" && body.payload !== null ? body.payload : {},
    dog_id: body.dogId ? String(body.dogId) : null,
    turnstile_verified: true,
    ip_hash: clientIp ? await hashIp(clientIp) : null,
  });

  if (insertError) {
    return new Response(JSON.stringify({ error: "Could not save submission" }), {
      status: 500,
      headers,
    });
  }

  await notifyByEmail({ formType, name, email, phone, message });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
