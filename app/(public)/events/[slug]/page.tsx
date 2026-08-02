import type { Metadata } from "next";
import EventDetailClient from "@/components/events/EventDetailClient";
import { fetchEventsForBuild } from "@/lib/build-time-events";

// A slug that can never collide with a real event (see events table: slug is
// a non-empty, unique, human-derived string). Used purely to guarantee
// `generateStaticParams` never returns zero entries -- with `output:
// "export"`, a dynamic route with zero static params fails the whole build.
const PLACEHOLDER_SLUG = "_placeholder";

export async function generateStaticParams() {
  const rows = await fetchEventsForBuild();
  const slugs = rows.map((row) => ({ slug: row.slug }));
  return slugs.length > 0 ? slugs : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) {
    return { title: "Event" };
  }
  const [event] = await fetchEventsForBuild(slug);
  if (!event) {
    return { title: "Event" };
  }
  return {
    title: event.title,
    description: event.summary?.slice(0, 160) || `${event.title} -- Sky's Path to Home.`,
    openGraph: {
      title: event.title,
      description: event.summary?.slice(0, 160) || `${event.title} -- Sky's Path to Home.`,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventDetailClient slug={slug} />;
}
