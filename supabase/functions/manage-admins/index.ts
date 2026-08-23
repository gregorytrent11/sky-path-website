// Supabase Edge Function: lets a signed-in admin invite a new admin by
// email, or list existing admins, without needing direct access to the
// Supabase dashboard. Uses the service role key (never shipped to the
// browser) to call the Auth Admin API, gated behind a check that the
// caller is already an authenticated admin.
//
// Required secrets (supabase secrets set ...):
//   SERVICE_ROLE_KEY (the "SUPABASE_" prefix is reserved for default
//   secrets, so this can't be named SUPABASE_SERVICE_ROLE_KEY)
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE_URL = "https://skyspath.com";

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

  if (body.action === "invite") {
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "A valid email address is required" }), {
        status: 400,
        headers,
      });
    }
    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/admin/reset-password/`,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  if (body.action === "resend") {
    const userId = body.userId?.trim();
    if (!userId) {
      return new Response(JSON.stringify({ error: "A user id is required" }), {
        status: 400,
        headers,
      });
    }
    const { data: target, error: lookupError } = await adminClient.auth.admin.getUserById(userId);
    if (lookupError || !target?.user?.email) {
      return new Response(JSON.stringify({ error: "That admin no longer exists." }), {
        status: 404,
        headers,
      });
    }
    if (target.user.last_sign_in_at) {
      return new Response(
        JSON.stringify({ error: "That admin has already signed in and doesn't need an invite." }),
        { status: 400, headers }
      );
    }
    // inviteUserByEmail refuses an email that's already registered, and
    // expired invite links can't be refreshed in place -- so recreate the
    // pending account. Safe only because we just checked they've never
    // signed in, meaning there's no real account state to lose.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(target.user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 400, headers });
    }
    const { error: reinviteError } = await adminClient.auth.admin.inviteUserByEmail(
      target.user.email,
      { redirectTo: `${SITE_URL}/admin/reset-password/` }
    );
    if (reinviteError) {
      return new Response(JSON.stringify({ error: reinviteError.message }), { status: 400, headers });
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
