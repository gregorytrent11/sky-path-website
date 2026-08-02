"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type SessionState = "loading" | "authenticated" | "mfa-setup-required" | "anonymous";

// Caps how long an admin stays signed in, independent of Supabase's normal
// token auto-refresh (which would otherwise keep a session alive
// indefinitely). Supabase has a native server-enforced version of this
// ("Time-box user sessions"), but it's gated behind the paid Pro plan; this
// is the client-side stand-in until/unless that's upgraded. It won't stop
// a stolen access token from being replayed directly against the API, but
// it does force the admin UI itself to re-authenticate after 12 hours.
const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000;
const SESSION_STARTED_KEY = "admin_session_started_at";
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

function isSessionExpired(): boolean {
  const startedAt = Number(localStorage.getItem(SESSION_STARTED_KEY));
  if (!startedAt) return false;
  return Date.now() - startedAt > SESSION_TIMEOUT_MS;
}

// A session only counts as "authenticated" once it has satisfied whatever
// assurance level it's enrolled for -- a user with a verified TOTP factor
// who has only completed the password step is aal1/aal2-pending, not fully
// signed in. Re-checked on every auth state change (not just at mount) so a
// tab left open through an enrollment/unenrollment elsewhere still reflects
// the current requirement.
//
// Two-factor is mandatory for admins: a session that's fully satisfied at
// aal1 (nextLevel never rose to aal2) means no verified TOTP factor exists
// yet, so it's routed to "mfa-setup-required" instead of "authenticated".
async function resolveState(session: Session | null): Promise<SessionState> {
  if (!session) {
    localStorage.removeItem(SESSION_STARTED_KEY);
    return "anonymous";
  }

  if (!localStorage.getItem(SESSION_STARTED_KEY)) {
    localStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
  }
  if (isSessionExpired()) {
    localStorage.removeItem(SESSION_STARTED_KEY);
    await supabase.auth.signOut();
    return "anonymous";
  }

  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return "anonymous";
  if (data.currentLevel !== data.nextLevel) return "anonymous";
  if (data.nextLevel !== "aal2") return "mfa-setup-required";
  return "authenticated";
}

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<SessionState>("loading");

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      const resolved = await resolveState(data.session);
      if (cancelled) return;
      setSession(data.session);
      setState(resolved);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // A fresh sign-in always restarts the 12-hour clock, even if a stale
      // timestamp from a previous session is still sitting in storage.
      if (event === "SIGNED_IN") {
        localStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
      }
      resolveState(newSession).then((resolved) => {
        if (cancelled) return;
        setSession(newSession);
        setState(resolved);
      });
    });

    // Catches a tab left open past the 12-hour mark with no other auth
    // event to trigger a recheck.
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        supabase.auth.signOut();
      }
    }, RECHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { session, state };
}
