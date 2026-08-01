"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type SessionState = "loading" | "authenticated" | "anonymous";

// A session only counts as "authenticated" once it has satisfied whatever
// assurance level it's enrolled for -- a user with a verified TOTP factor
// who has only completed the password step is aal1/aal2-pending, not fully
// signed in. Re-checked on every auth state change (not just at mount) so a
// tab left open through an enrollment/unenrollment elsewhere still reflects
// the current requirement.
async function resolveState(session: Session | null): Promise<SessionState> {
  if (!session) return "anonymous";
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return "anonymous";
  if (data.currentLevel !== data.nextLevel) return "anonymous";
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      resolveState(newSession).then((resolved) => {
        if (cancelled) return;
        setSession(newSession);
        setState(resolved);
      });
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, state };
}
