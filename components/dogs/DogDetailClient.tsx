"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Dog, DogMedia } from "@/types/database";
import {
  ageCategoryLabel,
  compatibilityBadges,
  sizeLabel,
} from "@/components/dogs/dog-display";
import { siteConfig } from "@/lib/site-config";

type LoadState = "loading" | "found" | "not-found" | "error";

export default function DogDetailClient({ slug }: { slug: string }) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [media, setMedia] = useState<DogMedia[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Resets load state before an external data fetch keyed on slug, not
    // derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("loading");

    async function load() {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setState("error");
        return;
      }
      if (!data) {
        setState("not-found");
        return;
      }
      const loadedDog: Dog = data;
      setDog(loadedDog);
      setActivePhoto(0);

      const { data: mediaRows } = await supabase
        .from("dog_media")
        .select("*")
        .eq("dog_id", loadedDog.id)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      setMedia(mediaRows ?? []);
      setState("found");
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-14 sm:px-6" aria-busy="true">
        <p className="sr-only">Loading dog profile…</p>
        <div className="aspect-[4/3] w-full rounded-xl bg-brand-gray" />
        <div className="mt-6 h-8 w-1/3 rounded bg-brand-gray" />
        <div className="mt-3 h-4 w-2/3 rounded bg-brand-gray" />
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-brand-deep-blue">
          We couldn&rsquo;t find that dog
        </h1>
        <p className="mt-3 text-brand-charcoal/80">
          This profile may have been adopted out of view or the link may be out of date.
        </p>
        <Link
          href="/dogs/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white hover:bg-brand-deep-blue"
        >
          See dogs available now
        </Link>
      </div>
    );
  }

  if (state === "error" || !dog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="text-brand-charcoal/80">
          We couldn&rsquo;t load this dog&rsquo;s profile right now. Please try again in a moment.
        </p>
      </div>
    );
  }

  const photos = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video");
  const gallery = photos.length > 0 ? photos : dog.primary_photo_url ? [{
    id: "primary",
    url: dog.primary_photo_url,
    alt_text: dog.name,
    focal_x: dog.primary_photo_focal_x,
    focal_y: dog.primary_photo_focal_y,
  }] : [];
  const badges = compatibilityBadges(dog);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-brand-gray">
            {gallery.length > 0 ? (
              <Image
                src={gallery[activePhoto]?.url ?? gallery[0].url}
                alt={gallery[activePhoto]?.alt_text || dog.name}
                fill
                className="object-cover"
                style={{
                  objectPosition: `${gallery[activePhoto]?.focal_x ?? gallery[0].focal_x}% ${
                    gallery[activePhoto]?.focal_y ?? gallery[0].focal_y
                  }%`,
                }}
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-brand-charcoal/70">
                Photo coming soon
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Show photo ${index + 1} of ${dog.name}`}
                  aria-current={index === activePhoto}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                    index === activePhoto ? "border-brand-purple" : "border-transparent"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ objectPosition: `${item.focal_x}% ${item.focal_y}%` }}
                  />
                </button>
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="mt-4">
              <video
                src={videos[0].url}
                controls
                preload="metadata"
                className="w-full rounded-xl bg-brand-gray"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold text-brand-deep-blue">{dog.name}</h1>
            {dog.status === "adopted" && (
              <span className="rounded-full bg-brand-deep-blue px-3 py-1 text-xs font-semibold text-brand-white">
                Adopted
              </span>
            )}
            {dog.status === "pending" && (
              <span className="rounded-full bg-brand-purple px-3 py-1 text-xs font-semibold text-brand-white">
                Adoption Pending
              </span>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {dog.breed && (
              <div>
                <dt className="text-brand-charcoal/70">Breed</dt>
                <dd className="font-medium text-brand-charcoal">{dog.breed}</dd>
              </div>
            )}
            {ageCategoryLabel(dog.age_category) && (
              <div>
                <dt className="text-brand-charcoal/70">Age</dt>
                <dd className="font-medium text-brand-charcoal">{ageCategoryLabel(dog.age_category)}</dd>
              </div>
            )}
            {dog.sex && dog.sex !== "unknown" && (
              <div>
                <dt className="text-brand-charcoal/70">Sex</dt>
                <dd className="font-medium text-brand-charcoal">{dog.sex === "male" ? "Male" : "Female"}</dd>
              </div>
            )}
            {sizeLabel(dog.size) && (
              <div>
                <dt className="text-brand-charcoal/70">Size</dt>
                <dd className="font-medium text-brand-charcoal">
                  {sizeLabel(dog.size)}
                  {dog.weight_lbs ? ` (${dog.weight_lbs} lbs)` : ""}
                </dd>
              </div>
            )}
            {dog.location && (
              <div>
                <dt className="text-brand-charcoal/70">Location</dt>
                <dd className="font-medium text-brand-charcoal">{dog.location}</dd>
              </div>
            )}
            {dog.energy_level && (
              <div>
                <dt className="text-brand-charcoal/70">Energy level</dt>
                <dd className="font-medium capitalize text-brand-charcoal">{dog.energy_level}</dd>
              </div>
            )}
          </dl>

          {badges.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full bg-brand-lavender/40 px-3 py-1 text-xs font-medium text-brand-deep-blue"
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}

          {dog.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-brand-charcoal">
              {dog.description}
            </p>
          )}

          {dog.status !== "adopted" && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/adopt/application/"
                className="inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-brand-white shadow-sm hover:bg-brand-deep-blue"
              >
                Apply to Adopt {dog.name}
              </Link>
              <Link
                href="/contact/"
                className="inline-flex items-center justify-center rounded-full border border-brand-purple px-6 py-3 text-sm font-semibold text-brand-purple hover:bg-brand-lavender/20"
              >
                Ask a Question
              </Link>
            </div>
          )}

          {dog.status === "adopted" && (
            <p className="mt-8 rounded-lg bg-brand-gray p-4 text-sm text-brand-charcoal/80">
              {dog.name} has found their forever home! Interested in adopting?{" "}
              <Link href="/dogs/" className="font-medium text-brand-purple hover:underline">
                See who&rsquo;s available now
              </Link>
              , or reach out to {siteConfig.orgName} with questions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
