"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";
import { siteConfig } from "@/lib/site-config";

export default function AdminLoginPage() {
  const router = useRouter();
  const { state } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state === "authenticated") {
      router.replace("/admin/");
    }
  }, [state, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError("Incorrect email or password.");
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
            width={72}
            height={72}
            className="h-18 w-18 object-contain"
          />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-brand-deep-blue">
            Staff Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
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
              className="mt-1 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
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
      </div>
    </div>
  );
}
