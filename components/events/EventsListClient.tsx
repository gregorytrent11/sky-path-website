"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Event } from "@/types/database";
import EventCard from "@/components/events/EventCard";

export default function EventsListClient() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(true);
          return;
        }
        setEvents(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        We couldn&rsquo;t load our events right now. Please try again in a moment.
      </p>
    );
  }

  if (!events) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-brand-gray" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        We don&rsquo;t have any events posted right now. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
