"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: string;
  created_at: string;
}

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
} | null;

export default function AdminSettingsPage() {
  const [factors, setFactors] = useState<TotpFactor[] | null>(null);
  const [enroll, setEnroll] = useState<EnrollState>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordBusy(false);
    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
  }

  async function loadFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFactors();
  }, []);

  const verifiedFactor = factors?.find((f) => f.status === "verified");

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start enrollment.");
      return;
    }
    setEnroll({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function cancelEnroll() {
    if (enroll) {
      await supabase.auth.mfa.unenroll({ factorId: enroll.factorId });
    }
    setEnroll(null);
    setCode("");
    setError(null);
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enroll) return;
    setError(null);
    setBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (challengeError || !challenge) {
      setBusy(false);
      setError(challengeError?.message ?? "Could not verify code.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (verifyError) {
      setError("Incorrect code. Please try again.");
      setCode("");
      return;
    }
    setEnroll(null);
    setCode("");
    await loadFactors();
  }

  async function handleDisable(factorId: string) {
    if (!window.confirm("Disable two-factor authentication? You'll only need your password to sign in.")) {
      return;
    }
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    await loadFactors();
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Settings</h1>

      <div className="mt-6 max-w-lg rounded-xl border border-brand-soft-blue/60 bg-brand-white p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-brand-charcoal">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-brand-charcoal">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
          </div>
          {passwordSaved && (
            <p className="text-sm text-green-700">Password updated.</p>
          )}
          {passwordError && (
            <p role="alert" className="text-sm text-red-700">
              {passwordError}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordBusy}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
          >
            {passwordBusy ? "Saving…" : "Update Password"}
          </button>
        </form>
      </div>

      <div className="mt-6 max-w-lg rounded-xl border border-brand-soft-blue/60 bg-brand-white p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">
          Two-Factor Authentication
        </h2>

        {!factors ? (
          <p className="mt-3 text-sm text-brand-charcoal/80">Loading…</p>
        ) : enroll ? (
          <form onSubmit={handleVerify} className="mt-4 space-y-4">
            <p className="text-sm text-brand-charcoal">
              Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password,
              etc.), then enter the 6-digit code it generates.
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
              <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-brand-charcoal">
                6-digit code
              </label>
              <input
                id="mfa-verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 block w-40 rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-center text-lg tracking-[0.5em] text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
              >
                {busy ? "Verifying…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={cancelEnroll}
                disabled={busy}
                className="rounded-full border border-brand-soft-blue px-5 py-2 text-sm font-semibold text-brand-charcoal hover:bg-brand-gray"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : verifiedFactor ? (
          <div className="mt-4">
            <p className="text-sm text-brand-charcoal">
              Two-factor authentication is <span className="font-semibold text-green-700">enabled</span>.
              You&rsquo;ll be asked for a code from your authenticator app every time you sign in.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleDisable(verifiedFactor.id)}
              disabled={busy}
              className="mt-4 rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Disable two-factor authentication
            </button>
            <p className="mt-2 text-xs text-brand-charcoal/60">
              Two-factor is required for all admins. Disabling it will immediately prompt you to
              set up a new authenticator.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-brand-charcoal">
              Two-factor authentication is <span className="font-semibold text-amber-700">required</span> and
              not yet set up on this account. Add an authenticator app to continue using the admin
              dashboard.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={startEnroll}
              disabled={busy}
              className="mt-4 rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
            >
              {busy ? "Starting…" : "Enable two-factor authentication"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
