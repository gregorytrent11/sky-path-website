"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import DogCard from "@/components/dogs/DogCard";

export default function FeaturedDogsPreview() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("dogs")
      .select("*")
      .eq("featured", true)
      .eq("is_visible", true)
      .in("status", ["published", "pending"])
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (cancelled) return;
        setDogs(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!dogs || dogs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        Dog profiles are being added. Check back soon to meet the dogs currently looking
        for a home.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
}
