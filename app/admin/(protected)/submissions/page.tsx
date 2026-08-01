"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Submission, SubmissionFormType, SubmissionStatus } from "@/types/database";

const formTypeLabels: Record<SubmissionFormType, string> = {
  contact: "Contact",
  volunteer: "Volunteer",
  request_help: "Request Help",
  adopt_application: "Adopt Application",
  foster_application: "Foster Application",
};

const statusStyles: Record<SubmissionStatus, string> = {
  new: "bg-brand-purple text-brand-white",
  in_progress: "bg-brand-soft-blue/60 text-brand-deep-blue",
  resolved: "bg-green-100 text-green-800",
  archived: "bg-brand-charcoal/10 text-brand-charcoal/80",
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [filter, setFilter] = useState<SubmissionFormType | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubmissions(data ?? []);
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  async function setStatus(id: string, status: SubmissionStatus) {
    await supabase.from("submissions").update({ status }).eq("id", id);
    await reload();
  }

  const visible = submissions?.filter((s) => filter === "all" || s.form_type === filter) ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Submissions</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "contact", "volunteer", "request_help"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === type
                ? "bg-brand-purple text-brand-white"
                : "bg-brand-gray text-brand-charcoal hover:bg-brand-soft-blue/40"
            }`}
          >
            {type === "all" ? "All" : formTypeLabels[type]}
          </button>
        ))}
      </div>

      {!submissions ? (
        <p className="mt-6 text-brand-charcoal/80">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 text-brand-charcoal/80">No submissions yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((submission) => (
            <li
              key={submission.id}
              className="rounded-xl border border-brand-soft-blue/60 bg-brand-white p-4"
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === submission.id ? null : submission.id)}
                aria-expanded={expanded === submission.id}
                aria-controls={`submission-${submission.id}-details`}
                className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
              >
                <div>
                  <span className="font-medium text-brand-charcoal">{submission.name}</span>{" "}
                  <span className="text-sm text-brand-charcoal/80">
                    · {formTypeLabels[submission.form_type]} ·{" "}
                    {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[submission.status]}`}>
                  {submission.status.replace("_", " ")}
                </span>
              </button>

              {expanded === submission.id && (
                <div
                  id={`submission-${submission.id}-details`}
                  className="mt-3 space-y-2 border-t border-brand-soft-blue/40 pt-3 text-sm"
                >
                  <p>
                    <span className="text-brand-charcoal/80">Email:</span>{" "}
                    <a href={`mailto:${submission.email}`} className="text-brand-purple hover:underline">
                      {submission.email}
                    </a>
                  </p>
                  {submission.phone && (
                    <p>
                      <span className="text-brand-charcoal/80">Phone:</span> {submission.phone}
                    </p>
                  )}
                  {submission.message && (
                    <p className="whitespace-pre-line">
                      <span className="text-brand-charcoal/80">Message:</span> {submission.message}
                    </p>
                  )}
                  {Object.keys(submission.payload || {}).length > 0 && (
                    <pre className="overflow-x-auto rounded bg-brand-gray p-3 text-xs">
                      {JSON.stringify(submission.payload, null, 2)}
                    </pre>
                  )}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {(["new", "in_progress", "resolved", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatus(submission.id, status)}
                        disabled={submission.status === status}
                        className="text-xs font-medium text-brand-purple hover:underline disabled:text-brand-charcoal/70 disabled:no-underline"
                      >
                        Mark {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
