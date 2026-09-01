"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import DogCard from "@/components/dogs/DogCard";

// `initialDogs` is the build-time snapshot (see lib/build-time-dogs.ts). It
// renders into the static HTML so crawlers see real dog cards, then the live
// query below replaces it so visitors always get the current list. An empty
// array at build time (e.g. Supabase unreachable) falls back to the skeleton
// so the page never claims "no dogs" before the browser has actually checked.
export default function DogsListClient({ initialDogs }: { initialDogs?: Dog[] }) {
  const [dogs, setDogs] = useState<Dog[] | null>(
    initialDogs && initialDogs.length > 0 ? initialDogs : null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("dogs")
      .select("*")
      .in("status", ["published", "pending"])
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(true);
          return;
        }
        setDogs(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A failed live refresh keeps showing the build-time cards rather than
  // replacing real dogs with an error message.
  if (error && !dogs) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        We couldn&rsquo;t load our dogs right now. Please try again in a moment.
      </p>
    );
  }

  if (!dogs) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-brand-gray" />
        ))}
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        We don&rsquo;t have any dogs available right now. Please check back soon, or{" "}
        <a href="/contact" className="font-medium text-brand-purple hover:underline">
          contact us
        </a>{" "}
        to be notified when a new dog is ready for adoption.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
}
