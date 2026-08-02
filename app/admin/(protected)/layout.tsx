"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";

const navItems = [
  { label: "Dashboard", href: "/admin/" },
  { label: "Dogs", href: "/admin/dogs/" },
  { label: "Events", href: "/admin/events/" },
  { label: "Submissions", href: "/admin/submissions/" },
  { label: "Settings", href: "/admin/settings/" },
];

const SETTINGS_PATH = "/admin/settings/";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, session } = useAdminSession();

  useEffect(() => {
    if (state === "anonymous") {
      router.replace("/admin/login/");
    } else if (state === "mfa-setup-required" && pathname !== SETTINGS_PATH) {
      // Two-factor is mandatory for every admin. Until a verified TOTP
      // factor exists, the only reachable page is Settings (where
      // enrollment happens) -- direct navigation to any other admin URL
      // bounces back here.
      router.replace(SETTINGS_PATH);
    }
  }, [state, pathname, router]);

  if (state === "loading" || state === "anonymous") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-charcoal/80">
        Loading…
      </div>
    );
  }

  if (state === "mfa-setup-required" && pathname !== SETTINGS_PATH) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-charcoal/80">
        Loading…
      </div>
    );
  }

  const mfaRequired = state === "mfa-setup-required";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="shrink-0 md:w-56">
        {mfaRequired && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          >
            Two-factor authentication is required for all admin accounts. Set it up below to
            continue.
          </p>
        )}
        <nav aria-label="Admin" className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const disabled = mfaRequired && item.href !== SETTINGS_PATH;
            if (disabled) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-brand-charcoal/40"
                >
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-brand-purple text-brand-white"
                    : "text-brand-charcoal hover:bg-brand-gray"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 hidden border-t border-brand-soft-blue/60 pt-4 text-xs text-brand-charcoal/80 md:block">
          {session?.user.email}
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="mt-2 block font-medium text-brand-purple hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
