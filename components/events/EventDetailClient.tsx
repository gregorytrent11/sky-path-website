"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Event } from "@/types/database";
import { formatEventDate } from "@/components/events/event-display";

type LoadState = "loading" | "found" | "not-found" | "error";

export default function EventDetailClient({ slug }: { slug: string }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    // Resets load state before an external data fetch keyed on slug, not
    // derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("loading");

    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState("error");
          return;
        }
        if (!data) {
          setState("not-found");
          return;
        }
        setEvent(data);
        setState("found");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-4 py-14 sm:px-6" aria-busy="true">
        <p className="sr-only">Loading event…</p>
        <div className="aspect-[16/9] w-full rounded-xl bg-brand-gray" />
        <div className="mt-6 h-8 w-1/2 rounded bg-brand-gray" />
        <div className="mt-3 h-4 w-1/3 rounded bg-brand-gray" />
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">
          We couldn&rsquo;t find that event
        </h1>
        <p className="mt-3 text-brand-charcoal/80">
          This event may have been removed or the link may be out of date.
        </p>
        <Link
          href="/events/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white hover:bg-brand-deep-blue"
        >
          See all events
        </Link>
      </div>
    );
  }

  if (state === "error" || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="text-brand-charcoal/80">
          We couldn&rsquo;t load this event right now. Please try again in a moment.
        </p>
      </div>
    );
  }

  const dateLabel = formatEventDate(event.event_date);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {event.cover_image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-brand-gray">
          <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="mt-6">
        {dateLabel && (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-purple">
            {dateLabel}
          </p>
        )}
        <h1 className="mt-1 font-heading text-3xl font-semibold text-brand-deep-blue">
          {event.title}
        </h1>
        {event.location && (
          <p className="mt-2 text-sm text-brand-charcoal/80">{event.location}</p>
        )}

        {event.body && (
          <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-brand-charcoal">
            {event.body}
          </div>
        )}

        <div className="mt-10">
          <Link href="/events/" className="text-sm font-semibold text-brand-purple hover:underline">
            &larr; Back to all events
          </Link>
        </div>
      </div>
    </div>
  );
}
