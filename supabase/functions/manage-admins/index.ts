// Supabase Edge Function: lets a signed-in admin add a new admin, or list
// and delete existing admins, without needing direct access to the Supabase
// dashboard. Uses the service role key (never shipped to the browser) to
// call the Auth Admin API, gated behind a check that the caller is already
// an authenticated admin.
//
// Admins sign in with Microsoft only, and new sign-ups are switched off in
// Supabase, so "adding an admin" just creates the account row for their
// skyspath.com address. Their first Microsoft sign-in attaches to that row
// (same verified email); a Microsoft account with no row is turned away.
//
// Required secrets (supabase secrets set ...):
//   SERVICE_ROLE_KEY (the "SUPABASE_" prefix is reserved for default
//   secrets, so this can't be named SUPABASE_SERVICE_ROLE_KEY)
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL_DOMAIN = "@skyspath.com";

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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers });
  }

  // Only a signed-in admin (any authenticated Supabase user, matching the
  // rest of this app's model) can manage other admins -- never anon.
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user: caller },
    error: callerAuthError,
  } = await callerClient.auth.getUser();
  if (callerAuthError || !caller) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers });
  }
  const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

  let body: { action?: string; email?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers });
  }

  if (body.action === "list") {
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
    const admins = data.users
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));
    return new Response(JSON.stringify({ admins }), { status: 200, headers });
  }

  if (body.action === "add") {
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "A valid email address is required" }), {
        status: 400,
        headers,
      });
    }
    if (!email.endsWith(ADMIN_EMAIL_DOMAIN)) {
      return new Response(
        JSON.stringify({ error: "Admins must use a skyspath.com Microsoft account." }),
        { status: 400, headers }
      );
    }
    // email_confirm marks the address verified, which is what lets the
    // Microsoft sign-in attach to this account. No email is sent.
    const { error } = await adminClient.auth.admin.createUser({ email, email_confirm: true });
    if (error) {
      const message = /already/i.test(error.message)
        ? "That address is already an admin."
        : error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  if (body.action === "delete") {
    const userId = body.userId?.trim();
    if (!userId) {
      return new Response(JSON.stringify({ error: "A user id is required" }), {
        status: 400,
        headers,
      });
    }
    if (userId === caller.id) {
      return new Response(JSON.stringify({ error: "You can't delete your own account." }), {
        status: 400,
        headers,
      });
    }
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
});
