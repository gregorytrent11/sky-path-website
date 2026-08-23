"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";

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

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminSettingsPage() {
  const { session } = useAdminSession();
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

  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  // Keyed by email, not id: resending recreates the pending account, so the
  // row comes back from loadAdmins with a fresh id.
  const [resentEmail, setResentEmail] = useState<string | null>(null);

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

  async function loadAdmins() {
    setAdminsError(null);
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admins", {
      body: { action: "list" },
    });
    if (invokeError || !data || data.error) {
      setAdminsError(data?.error ?? invokeError?.message ?? "Could not load admins.");
      return;
    }
    setAdmins(data.admins);
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFactors();
    loadAdmins();
  }, []);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteError(null);
    setInviteSent(false);

    setInviteBusy(true);
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admins", {
      body: { action: "invite", email: inviteEmail.trim() },
    });
    setInviteBusy(false);
    if (invokeError || !data || data.error) {
      setInviteError(data?.error ?? invokeError?.message ?? "Could not send invite.");
      return;
    }
    setInviteEmail("");
    setInviteSent(true);
    await loadAdmins();
  }

  async function handleResendInvite(admin: AdminUser) {
    setAdminsError(null);
    setResentEmail(null);
    setResendingId(admin.id);
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admins", {
      body: { action: "resend", userId: admin.id },
    });
    setResendingId(null);
    if (invokeError || !data || data.error) {
      setAdminsError(data?.error ?? invokeError?.message ?? "Could not resend the invite.");
      return;
    }
    setResentEmail(admin.email);
    await loadAdmins();
  }

  async function handleDeleteAdmin(admin: AdminUser) {
    if (!window.confirm(`Are you sure you want to delete ${admin.email}?`)) return;

    setAdminsError(null);
    setDeletingId(admin.id);
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admins", {
      body: { action: "delete", userId: admin.id },
    });
    setDeletingId(null);
    if (invokeError || !data || data.error) {
      setAdminsError(data?.error ?? invokeError?.message ?? "Could not delete admin.");
      return;
    }
    await loadAdmins();
  }

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
            <p className="mt-2 text-xs text-brand-charcoal/60">
              Two-factor authentication is required for all admins and cannot be disabled.
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

      <div className="mt-6 max-w-lg rounded-xl border border-brand-soft-blue/60 bg-brand-white p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">Admins</h2>

        {adminsError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {adminsError}
          </p>
        )}

        {!admins ? (
          <p className="mt-3 text-sm text-brand-charcoal/80">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-brand-soft-blue/40">
            {admins.map((admin) => {
              const isSelf = admin.id === session?.user.id;
              return (
                <li key={admin.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="text-brand-charcoal">
                    {admin.email}
                    {isSelf && <span className="ml-1 text-xs text-brand-charcoal/60">(you)</span>}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-brand-charcoal/60">
                    Joined {formatDate(admin.created_at)} &middot; Last sign-in{" "}
                    {formatDate(admin.last_sign_in_at)}
                    {!isSelf && !admin.last_sign_in_at && (
                      <button
                        type="button"
                        onClick={() => handleResendInvite(admin)}
                        disabled={resendingId === admin.id}
                        className="font-medium text-brand-purple hover:underline disabled:opacity-60"
                      >
                        {resendingId === admin.id
                          ? "Resending…"
                          : admin.email !== null && resentEmail === admin.email
                            ? "Invite resent"
                            : "Resend Invite"}
                      </button>
                    )}
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={deletingId === admin.id}
                        className="font-medium text-red-700 hover:underline disabled:opacity-60"
                      >
                        {deletingId === admin.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={handleInvite} className="mt-6 space-y-3 border-t border-brand-soft-blue/40 pt-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-brand-charcoal">
              Invite a new admin
            </label>
            <input
              id="invite-email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
            <p className="mt-1 text-xs text-brand-charcoal/60">
              They&rsquo;ll get an email with a link to set a password, then be required to set up
              two-factor authentication before using the dashboard.
            </p>
          </div>
          {inviteSent && <p className="text-sm text-green-700">Invite sent.</p>}
          {inviteError && (
            <p role="alert" className="text-sm text-red-700">
              {inviteError}
            </p>
          )}
          <button
            type="submit"
            disabled={inviteBusy}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
          >
            {inviteBusy ? "Sending…" : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
