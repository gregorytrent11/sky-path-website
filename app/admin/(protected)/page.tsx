"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface Counts {
  publishedDogs: number;
  draftDogs: number;
  newSubmissions: number;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [publishedRes, draftRes, submissionsRes] = await Promise.all([
        supabase
          .from("dogs")
          .select("id", { count: "exact", head: true })
          .in("status", ["published", "pending"]),
        supabase.from("dogs").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      if (cancelled) return;
      setCounts({
        publishedDogs: publishedRes.count ?? 0,
        draftDogs: draftRes.count ?? 0,
        newSubmissions: submissionsRes.count ?? 0,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/dogs/"
          className="rounded-xl border border-brand-soft-blue/60 bg-brand-white p-5 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-brand-charcoal/60">Live &amp; pending dogs</p>
          <p className="mt-1 text-3xl font-semibold text-brand-deep-blue">
            {counts ? counts.publishedDogs : "…"}
          </p>
        </Link>
        <Link
          href="/admin/dogs/"
          className="rounded-xl border border-brand-soft-blue/60 bg-brand-white p-5 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-brand-charcoal/60">Draft dogs</p>
          <p className="mt-1 text-3xl font-semibold text-brand-deep-blue">
            {counts ? counts.draftDogs : "…"}
          </p>
        </Link>
        <Link
          href="/admin/submissions/"
          className="rounded-xl border border-brand-soft-blue/60 bg-brand-white p-5 shadow-sm hover:shadow-md"
        >
          <p className="text-sm text-brand-charcoal/60">New submissions</p>
          <p className="mt-1 text-3xl font-semibold text-brand-deep-blue">
            {counts ? counts.newSubmissions : "…"}
          </p>
        </Link>
      </div>
    </div>
  );
}
