"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";

export default function SuccessStoriesPreview() {
  const [dogs, setDogs] = useState<Dog[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("dogs")
      .select("*")
      .eq("status", "adopted")
      .not("success_story", "is", null)
      .order("updated_at", { ascending: false })
      .limit(2)
      .then(({ data }) => {
        if (cancelled) return;
        setDogs((data ?? []).filter((dog) => dog.success_story?.trim()));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!dogs || dogs.length === 0) {
    return (
      <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-dashed border-brand-soft-blue bg-brand-gray/50 p-8 text-center text-brand-charcoal/70">
        Our first adoption stories will be shared here soon.
      </p>
    );
  }

  return (
    <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
      {dogs.map((dog) => (
        <Link
          key={dog.id}
          href={`/dogs/${dog.slug}/`}
          className="overflow-hidden rounded-xl border border-brand-soft-blue/60 bg-brand-white text-left shadow-sm transition-shadow hover:shadow-md"
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
            <h3 className="font-heading text-lg font-semibold text-brand-deep-blue">{dog.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-charcoal">
              {dog.success_story}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
