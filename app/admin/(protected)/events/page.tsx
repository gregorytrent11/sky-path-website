"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { triggerDeploy } from "@/lib/trigger-deploy";
import type { Event, EventStatus } from "@/types/database";
import { formatEventDate } from "@/components/events/event-display";

const statusStyles: Record<EventStatus, string> = {
  draft: "bg-brand-gray text-brand-charcoal",
  published: "bg-green-100 text-green-800",
  archived: "bg-brand-charcoal/10 text-brand-charcoal/80",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setEvents(data ?? []);
  }

  useEffect(() => {
    // Initial external data fetch on mount, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  async function setStatus(id: string, status: EventStatus) {
    setBusyId(id);
    await supabase.from("events").update({ status }).eq("id", id);
    await reload();
    setBusyId(null);
    triggerDeploy();
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(id);
    await supabase.from("events").delete().eq("id", id);
    await reload();
    setBusyId(null);
    triggerDeploy();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">Events</h1>
        <Link
          href="/admin/events/edit/"
          className="rounded-full bg-brand-purple px-4 py-2 text-sm font-semibold text-brand-white hover:bg-brand-deep-blue"
        >
          Add Event
        </Link>
      </div>

      {!events ? (
        <p className="mt-6 text-brand-charcoal/80">Loading…</p>
      ) : events.length === 0 ? (
        <p className="mt-6 text-brand-charcoal/80">No events yet. Add your first one.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-brand-soft-blue/60">
          <table className="min-w-full divide-y divide-brand-soft-blue/60 bg-brand-white text-sm">
            <thead className="bg-brand-gray/50 text-left text-xs uppercase tracking-wide text-brand-charcoal/80">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-soft-blue/30">
              {events.map((event) => (
                <tr key={event.id} className={busyId === event.id ? "opacity-50" : ""}>
                  <td className="px-4 py-3 font-medium text-brand-charcoal">{event.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/80">
                    {formatEventDate(event.event_date) || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/events/edit/?id=${event.id}`}
                        className="text-brand-purple hover:underline"
                      >
                        Edit
                      </Link>
                      {event.status !== "published" && (
                        <button
                          type="button"
                          disabled={busyId === event.id}
                          onClick={() => setStatus(event.id, "published")}
                          className="text-brand-purple hover:underline"
                        >
                          Publish
                        </button>
                      )}
                      {event.status === "published" && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === event.id}
                            onClick={() => setStatus(event.id, "draft")}
                            className="text-brand-charcoal/70 hover:underline"
                          >
                            Unpublish
                          </button>
                          <button
                            type="button"
                            disabled={busyId === event.id}
                            onClick={() => setStatus(event.id, "archived")}
                            className="text-brand-charcoal/70 hover:underline"
                          >
                            Archive
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={busyId === event.id}
                        onClick={() => remove(event.id, event.title)}
                        className="text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
