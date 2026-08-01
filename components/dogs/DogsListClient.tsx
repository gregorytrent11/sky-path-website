"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import DogCard from "@/components/dogs/DogCard";

export default function DogsListClient() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);
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

  if (error) {
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
