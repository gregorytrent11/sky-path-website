"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type SessionState = "loading" | "authenticated" | "anonymous";

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<SessionState>("loading");

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setState(data.session ? "authenticated" : "anonymous");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setState(newSession ? "authenticated" : "anonymous");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, state };
}
