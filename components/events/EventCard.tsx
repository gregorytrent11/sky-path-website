import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/types/database";
import { formatEventDate } from "@/components/events/event-display";

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.slug}/`}
      className="group block overflow-hidden rounded-xl border border-brand-soft-blue/60 bg-brand-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            style={{ objectPosition: `${event.cover_focal_x}% ${event.cover_focal_y}%` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-charcoal/70">
            Sky&rsquo;s Path to Home
          </div>
        )}
      </div>
      <div className="p-4">
        {formatEventDate(event.event_date) && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple">
            {formatEventDate(event.event_date)}
          </p>
        )}
        <h2 className="mt-1 font-heading text-lg font-semibold text-brand-deep-blue">
          {event.title}
        </h2>
        {event.summary && (
          <p className="mt-1 line-clamp-3 text-sm text-brand-charcoal/80">{event.summary}</p>
        )}
      </div>
    </Link>
  );
}
