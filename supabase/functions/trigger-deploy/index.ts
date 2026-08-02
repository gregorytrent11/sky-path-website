// Supabase Edge Function: fires a GitHub Actions workflow_dispatch to
// rebuild and redeploy the static site. Called from the admin panel right
// after publishing/hiding/deleting a dog or event, so a brand-new page
// gets its own static shell within about a minute instead of waiting on
// the 6-hour cron fallback in .github/workflows/deploy.yml.
//
// The GitHub token needs write access to Actions on this one repo only --
// it's kept here (a secret, never shipped to the browser) rather than in
// client code specifically so a stolen anon key can't be used to spam
// rebuilds or touch anything outside Actions.
//
// Required secrets (supabase secrets set ...):
//   GITHUB_DEPLOY_TOKEN
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const GITHUB_REPO = "gregorytrent11/sky-path-website";
const GITHUB_WORKFLOW = "deploy.yml";

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
  // rest of this app's model) can trigger a rebuild -- never anon.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  const githubToken = Deno.env.get("GITHUB_DEPLOY_TOKEN");
  if (!githubToken) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers });
  }

  const dispatchRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "sky-path-website-admin",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );

  if (!dispatchRes.ok) {
    const detail = await dispatchRes.text();
    return new Response(JSON.stringify({ error: "GitHub dispatch failed", detail }), {
      status: 502,
      headers,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
