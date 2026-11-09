"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";
import type { CredentialExpiration } from "@/types/database";

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

// expires_on is a plain date; pin it to UTC so it doesn't shift a day in
// Mountain time.
function formatExpiry(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Whole days from today (the admin's own calendar day) to the expiry date.
function daysUntil(isoDate: string): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.parse(`${isoDate}T00:00:00Z`) - today) / (24 * 60 * 60 * 1000));
}

// Same steps as the reminder emails: 30 days yellow, 15 orange, 5 red.
function expiryHighlight(daysLeft: number): string {
  if (daysLeft <= 5) return "border-red-300 bg-red-100 text-red-900";
  if (daysLeft <= 15) return "border-orange-300 bg-orange-100 text-orange-900";
  if (daysLeft <= 30) return "border-yellow-300 bg-yellow-100 text-yellow-900";
  return "border-transparent text-brand-charcoal";
}

function expiryText(isoDate: string, daysLeft: number): string {
  const date = formatExpiry(isoDate);
  if (daysLeft > 30) return `Expires ${date}`;
  if (daysLeft > 1) return `Expires ${date} (in ${daysLeft} days)`;
  if (daysLeft === 1) return `Expires ${date} (tomorrow)`;
  if (daysLeft === 0) return `Expires today`;
  return `Expired ${date}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminSettingsPage() {
  const { session } = useAdminSession();

  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addedEmail, setAddedEmail] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expirations, setExpirations] = useState<CredentialExpiration[]>([]);
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

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
    loadAdmins();
    supabase
      .from("credential_expirations")
      .select("*")
      .order("expires_on")
      .then(({ data }) => setExpirations(data ?? []));
  }, []);

  async function handleSendTestReminder() {
    setTestResult(null);
    setTestBusy(true);
    const { data, error: invokeError } = await supabase.functions.invoke(
      "credential-expiry-reminder",
      { body: { test: true } }
    );
    setTestBusy(false);
    if (invokeError || !data || data.error || data.failed?.length) {
      setTestResult({ ok: false, text: "The test reminder could not be sent." });
      return;
    }
    setTestResult({ ok: true, text: `Test reminder sent to ${data.to}.` });
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    setAddedEmail(null);

    const email = newEmail.trim().toLowerCase();
    setAddBusy(true);
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admins", {
      body: { action: "add", email },
    });
    setAddBusy(false);
    if (invokeError || !data || data.error) {
      // A refusal from the function arrives as invokeError with the reason
      // in the response body, not in `data`.
      let reason: string | undefined = data?.error;
      const response = (invokeError as { context?: Response } | null)?.context;
      if (!reason && response) {
        reason = await response
          .json()
          .then((body: { error?: string }) => body.error)
          .catch(() => undefined);
      }
      setAddError(reason ?? invokeError?.message ?? "Could not add that admin.");
      return;
    }
    setNewEmail("");
    setAddedEmail(email);
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

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Settings</h1>

      <div className="mt-6 max-w-lg rounded-xl border border-brand-soft-blue/60 bg-brand-white p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">Sign-in</h2>
        <p className="mt-3 text-sm text-brand-charcoal">
          Admins sign in with their Sky&rsquo;s Path Microsoft account. Passwords and the second
          sign-in step are managed by Microsoft, not on this site.
        </p>
        {expirations.length > 0 && (
          <div className="mt-4 border-t border-brand-soft-blue/40 pt-4">
            <h3 className="text-sm font-medium text-brand-charcoal">Renewal dates</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {expirations.map((item) => {
                const daysLeft = daysUntil(item.expires_on);
                return (
                  <li
                    key={item.id}
                    className={`flex flex-wrap justify-between gap-2 rounded-md border px-2 py-1 ${expiryHighlight(daysLeft)}`}
                  >
                    <span>{item.name}</span>
                    <span className={daysLeft <= 30 ? "font-semibold" : "text-brand-charcoal/70"}>
                      {expiryText(item.expires_on, daysLeft)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-brand-charcoal/60">
              Reminders with renewal steps are emailed to contact_us@skyspath.com 30, 15 and 5 days
              before each date.{" "}
              <button
                type="button"
                onClick={handleSendTestReminder}
                disabled={testBusy}
                className="font-medium text-brand-purple hover:underline disabled:opacity-60"
              >
                {testBusy ? "Sending…" : "Send a test reminder"}
              </button>
            </p>
            {testResult && (
              <p
                role={testResult.ok ? "status" : "alert"}
                className={`mt-1 text-xs ${testResult.ok ? "text-green-700" : "text-red-700"}`}
              >
                {testResult.text}
              </p>
            )}
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
                    Added {formatDate(admin.created_at)} &middot; Last sign-in{" "}
                    {formatDate(admin.last_sign_in_at)}
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

        <form onSubmit={handleAdd} className="mt-6 space-y-3 border-t border-brand-soft-blue/40 pt-4">
          <div>
            <label htmlFor="new-admin-email" className="block text-sm font-medium text-brand-charcoal">
              Add an admin
            </label>
            <input
              id="new-admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@skyspath.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
            <p className="mt-1 text-xs text-brand-charcoal/60">
              Enter their skyspath.com address. No email is sent: once added, they go to the Staff
              Login page and sign in with Microsoft.
            </p>
          </div>
          {addedEmail && (
            <p className="text-sm text-green-700">{addedEmail} can now sign in with Microsoft.</p>
          )}
          {addError && (
            <p role="alert" className="text-sm text-red-700">
              {addError}
            </p>
          )}
          <button
            type="submit"
            disabled={addBusy}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue disabled:opacity-60"
          >
            {addBusy ? "Adding…" : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
