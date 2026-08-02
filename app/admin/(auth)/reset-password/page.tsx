"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";

const inputClasses =
  "mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple";

type PageState = "checking" | "ready" | "no-session" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // The recovery link authenticates the browser (Supabase parses the
    // access/refresh tokens out of the URL fragment automatically) before
    // this component even mounts, so a plain session check is enough --
    // no need to race the "PASSWORD_RECOVERY" auth event specifically.
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "ready" : "no-session");
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setState("done");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo.png"
            alt={`${siteConfig.orgName} logo`}
            width={72}
            height={72}
            className="h-18 w-18 object-contain"
          />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-brand-deep-blue">
            Set New Password
          </h1>
        </div>

        {state === "checking" && <p className="text-center text-sm text-brand-charcoal/80">Loading…</p>}

        {state === "no-session" && (
          <div className="text-center">
            <p className="text-sm text-brand-charcoal">
              This link is invalid or has expired. Ask another admin to send you a new password
              reset email from the Supabase dashboard.
            </p>
          </div>
        )}

        {state === "done" && (
          <div className="text-center">
            <p className="text-sm text-brand-charcoal">
              Your password has been updated.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/admin/")}
              className="mt-6 w-full rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {state === "ready" && (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-brand-charcoal">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-brand-charcoal">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
