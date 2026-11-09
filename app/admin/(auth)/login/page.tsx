"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";
import { siteConfig } from "@/lib/site-config";

// Microsoft sends a failed sign-in back to this page with the reason in the
// query string or the fragment, depending on where it failed.
function readSignInError(): string | null {
  const sources = [window.location.search, window.location.hash.replace(/^#/, "?")];
  for (const source of sources) {
    const params = new URLSearchParams(source);
    if (!params.get("error") && !params.get("error_code")) continue;
    const detail = (params.get("error_description") ?? "").toLowerCase();
    if (params.get("error_code") === "signup_disabled" || detail.includes("signups not allowed")) {
      return "That Microsoft account isn't on the admin list. Ask another admin to add you under Settings.";
    }
    return "Microsoft sign-in didn't finish. Please try again.";
  }
  return null;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { state } = useAdminSession();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const signInError = readSignInError();
    if (signInError) {
      // Reading the URL after mount is the point: it isn't known at build time.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(signInError);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace("/admin/");
    }
  }, [state, router]);

  async function handleMicrosoftSignIn() {
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email",
        redirectTo: `${window.location.origin}/admin/login/`,
      },
    });
    if (signInError) {
      setSubmitting(false);
      setError("Could not reach Microsoft sign-in. Please try again.");
    }
    // On success the browser is already leaving for Microsoft.
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo.png"
            alt={`${siteConfig.orgName} logo`}
            width={144}
            height={144}
            className="h-36 w-36 object-contain"
          />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-brand-deep-blue">
            Staff Login
          </h1>
        </div>

        <div className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={submitting || state === "loading"}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 21 21" className="h-4 w-4 shrink-0">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            {submitting ? "Opening Microsoft…" : "Sign in with Microsoft"}
          </button>

          <p className="text-center text-xs text-brand-charcoal/70">
            Use your Sky&rsquo;s Path Microsoft account.
          </p>
        </div>
      </div>
    </div>
  );
}
