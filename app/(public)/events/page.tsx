import PageHero from "@/components/layout/PageHero";
import EventsListClient from "@/components/events/EventsListClient";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Events",
  "Upcoming and past events from Sky's Path to Home."
);

export default function EventsPage() {
  return (
    <>
      <PageHero
        title="Events"
        intro="Adoption events, fundraisers, and updates from Sky's Path to Home."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <EventsListClient />
      </section>
    </>
  );
}
