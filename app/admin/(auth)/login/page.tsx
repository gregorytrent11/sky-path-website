"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";
import { siteConfig } from "@/lib/site-config";

const inputClasses =
  "mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple";

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
} | null;

export default function AdminLoginPage() {
  const router = useRouter();
  const { state } = useAdminSession();
  const [step, setStep] = useState<"credentials" | "challenge" | "enroll">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const [enroll, setEnroll] = useState<EnrollState>(null);
  const [enrollCode, setEnrollCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace("/admin/");
    }
  }, [state, router]);

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setSubmitting(false);
      setError("Incorrect email or password.");
      return;
    }

    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      setSubmitting(false);
      setError("Could not verify your session. Please try again.");
      return;
    }

    if (aal.currentLevel === aal.nextLevel) {
      if (aal.nextLevel === "aal2") {
        // Already fully satisfied (rare on a fresh sign-in, but possible).
        setSubmitting(false);
        router.replace("/admin/");
        return;
      }
      // No verified factor exists -- two-factor is mandatory, so start
      // enrollment right here instead of letting the admin into the
      // dashboard first.
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      setSubmitting(false);
      if (enrollError || !enrollData) {
        setError(enrollError?.message ?? "Could not start two-factor setup. Please try again.");
        return;
      }
      setEnroll({
        factorId: enrollData.id,
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
      });
      setStep("enroll");
      return;
    }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    const factor = factorsData?.totp.find((f) => f.status === "verified");
    setSubmitting(false);
    if (factorsError || !factor) {
      setError("Two-factor authentication is required but no verified device was found. Contact another admin for help.");
      return;
    }
    setMfaFactorId(factor.id);
    setStep("challenge");
  }

  async function handleChallengeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mfaFactorId) return;
    setError(null);
    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: mfaFactorId,
      code: mfaCode,
    });
    setSubmitting(false);
    if (verifyError) {
      setError("Incorrect code. Please try again.");
      setMfaCode("");
      return;
    }
    router.replace("/admin/");
  }

  async function handleEnrollSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enroll) return;
    setError(null);
    setSubmitting(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (challengeError || !challenge) {
      setSubmitting(false);
      setError(challengeError?.message ?? "Could not verify code.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.id,
      code: enrollCode,
    });
    setSubmitting(false);
    if (verifyError) {
      setError("Incorrect code. Please try again.");
      setEnrollCode("");
      return;
    }
    router.replace("/admin/");
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

        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-brand-charcoal">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-brand-charcoal">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {step === "challenge" && (
          <form onSubmit={handleChallengeSubmit} noValidate className="space-y-4">
            <p className="text-sm text-brand-charcoal/80">
              Enter the 6-digit code from your authenticator app.
            </p>
            <div>
              <label htmlFor="admin-mfa-code" className="block text-sm font-medium text-brand-charcoal">
                Authentication code
              </label>
              <input
                id="admin-mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClasses} text-center text-lg tracking-[0.5em]`}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || mfaCode.length !== 6}
              className="w-full rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}

        {step === "enroll" && enroll && (
          <form onSubmit={handleEnrollSubmit} noValidate className="space-y-4">
            <p className="text-sm text-brand-charcoal">
              Two-factor authentication is required for all admin accounts. Scan this QR code
              with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter
              the 6-digit code it generates to finish signing in.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI SVG from Supabase, not an optimizable asset */}
            <img
              src={enroll.qrCode}
              alt="Scan this QR code with your authenticator app to enable two-factor authentication"
              className="h-48 w-48"
            />
            <p className="text-xs text-brand-charcoal/70">
              Can&rsquo;t scan? Enter this code manually:{" "}
              <code className="rounded bg-brand-gray px-1.5 py-0.5">{enroll.secret}</code>
            </p>

            <div>
              <label htmlFor="admin-enroll-code" className="block text-sm font-medium text-brand-charcoal">
                6-digit code
              </label>
              <input
                id="admin-enroll-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={6}
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClasses} text-center text-lg tracking-[0.5em]`}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || enrollCode.length !== 6}
              className="w-full rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Confirm & Finish Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
