"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import RichText from "@/components/RichText";

export default function SuccessStoriesListClient() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("dogs")
      .select("*")
      .eq("status", "adopted")
      .eq("success_story_status", "published")
      .not("success_story", "is", null)
      .order("updated_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(true);
          return;
        }
        setDogs((data ?? []).filter((dog) => dog.success_story?.trim()));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        We couldn&rsquo;t load our success stories right now. Please try again in a moment.
      </p>
    );
  }

  if (!dogs) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" aria-busy="true">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-brand-gray" />
        ))}
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        Our first success stories will be published here once adopter permission has been
        confirmed.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {dogs.map((dog) => (
        <div
          key={dog.id}
          className="overflow-hidden rounded-xl border border-brand-soft-blue/60 bg-brand-white shadow-sm"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray">
            {dog.primary_photo_url ? (
              <Image
                src={dog.primary_photo_url}
                alt={dog.name}
                fill
                className="object-cover"
                style={{ objectPosition: `${dog.primary_photo_focal_x}% ${dog.primary_photo_focal_y}%` }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-brand-charcoal/70">
                Photo coming soon
              </div>
            )}
          </div>
          <div className="p-5">
            <h2 className="font-heading text-lg font-semibold text-brand-deep-blue">{dog.name}</h2>
            <RichText
              text={dog.success_story ?? ""}
              className="mt-2 text-sm leading-relaxed text-brand-charcoal"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
