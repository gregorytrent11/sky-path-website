"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAdminSession } from "@/lib/supabase/auth";

const navItems = [
  { label: "Dashboard", href: "/admin/" },
  { label: "Dogs", href: "/admin/dogs/" },
  { label: "Success Stories", href: "/admin/success-stories/" },
  { label: "Events", href: "/admin/events/" },
  { label: "Submissions", href: "/admin/submissions/" },
  { label: "Settings", href: "/admin/settings/" },
];

const SUBMISSIONS_PATH = "/admin/submissions/";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, session } = useAdminSession();
  const [newSubmissionCount, setNewSubmissionCount] = useState(0);

  useEffect(() => {
    if (state === "anonymous") {
      router.replace("/admin/login/");
    }
  }, [state, router]);

  useEffect(() => {
    if (state !== "authenticated") return;
    // Re-checked on every navigation so the badge clears soon after an
    // admin reads/resolves submissions and moves to another page.
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .then(({ count }) => setNewSubmissionCount(count ?? 0));
  }, [state, pathname]);

  if (state === "loading" || state === "anonymous") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-charcoal/80">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <nav aria-label="Admin" className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-brand-purple text-brand-white"
                    : "text-brand-charcoal hover:bg-brand-gray"
                }`}
              >
                {item.label}
                {item.href === SUBMISSIONS_PATH && newSubmissionCount > 0 && (
                  <span
                    className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      active ? "bg-brand-white text-brand-purple" : "bg-red-600 text-white"
                    }`}
                  >
                    {newSubmissionCount}
                  </span>
                )}
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
