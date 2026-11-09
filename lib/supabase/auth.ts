"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type SessionState = "loading" | "authenticated" | "anonymous";

// Caps how long an admin stays signed in, independent of Supabase's normal
// token auto-refresh (which would otherwise keep a session alive
// indefinitely). Supabase has a native server-enforced version of this
// ("Time-box user sessions"), but it's gated behind the paid Pro plan; this
// is the client-side stand-in until/unless that's upgraded. It won't stop
// a stolen access token from being replayed directly against the API, but
// it does force the admin UI itself to re-authenticate after 8 hours.
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const SESSION_STARTED_KEY = "admin_session_started_at";
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

function isSessionExpired(): boolean {
  const startedAt = Number(localStorage.getItem(SESSION_STARTED_KEY));
  if (!startedAt) return false;
  return Date.now() - startedAt > SESSION_TIMEOUT_MS;
}

// Admins sign in with their Sky's Path Microsoft account, and Microsoft
// handles the second step (authenticator prompt) on its side. Microsoft is
// the only OAuth provider switched on in Supabase, so "this session was
// started by an OAuth sign-in" means "this session came through Microsoft".
// A session started any other way (an old password sign-in still sitting in
// a browser) is ended so the admin goes back through Microsoft.
async function startedWithMicrosoft(): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return (data.currentAuthenticationMethods ?? []).some(
    (entry) => (typeof entry === "string" ? entry : entry.method) === "oauth"
  );
}

async function resolveState(session: Session | null): Promise<SessionState> {
  if (!session) {
    localStorage.removeItem(SESSION_STARTED_KEY);
    return "anonymous";
  }

  if (!localStorage.getItem(SESSION_STARTED_KEY)) {
    localStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
  }
  if (isSessionExpired() || !(await startedWithMicrosoft())) {
    localStorage.removeItem(SESSION_STARTED_KEY);
    await supabase.auth.signOut();
    return "anonymous";
  }

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
      setSession(resolved === "authenticated" ? data.session : null);
      setState(resolved);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // A fresh sign-in always restarts the 8-hour clock, even if a stale
      // timestamp from a previous session is still sitting in storage.
      if (event === "SIGNED_IN") {
        localStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
      }
      // Deferred a tick: supabase-js holds its auth lock while it runs this
      // callback, and resolveState calls back into supabase.auth.
      setTimeout(() => {
        resolveState(newSession).then((resolved) => {
          if (cancelled) return;
          setSession(resolved === "authenticated" ? newSession : null);
          setState(resolved);
        });
      }, 0);
    });

    // Catches a tab left open past the 8-hour mark with no other auth
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
