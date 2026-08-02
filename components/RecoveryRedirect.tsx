"use client";

import { useEffect } from "react";

// Supabase's dashboard-triggered "Send password recovery" doesn't accept a
// custom redirect target -- it always sends the user back to the project's
// Site URL root with the session tokens in the URL fragment. This catches
// that landing (type=recovery in the hash) and forwards to the page that
// actually knows what to do with it, preserving the fragment so
// supabase-js's own session detection still picks it up there.
export default function RecoveryRedirect() {
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      window.location.replace(`/admin/reset-password/${window.location.hash}`);
    }
  }, []);

  return null;
}
