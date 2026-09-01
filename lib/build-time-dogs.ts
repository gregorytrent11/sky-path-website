// Fetches dog data directly via the Supabase REST API (not the supabase-js
// client) so it can run during `next build` for generateStaticParams,
// generateMetadata, the sitemap, and the pre-rendered dog cards/profiles --
// all outside any React render tree.
//
// The public pages still live-fetch from Supabase in the browser (see the
// *Client components), so what's pre-rendered here is only the initial HTML.
// That initial HTML is what search engines index, which is why the listing,
// featured dogs, and each profile are seeded from build-time data rather than
// shipping as an empty skeleton.
//
// WHY node:https INSTEAD OF fetch(): Next.js patches the global `fetch` during
// prerendering and persists its responses in .next/cache/fetch-cache with a
// one-year lifetime. A later build on the same machine (or a CI job that
// restores .next/cache) then silently reuses that snapshot -- verified: a
// tampered cache entry showed up verbatim in the rebuilt HTML. Passing
// `cache: "no-store"` doesn't help either: under `output: "export"` it's a
// dynamic-rendering bailout inside page renders. Node's own HTTPS client is
// not patched, so every build reads the current database.

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { Dog, DogMedia } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface BuildTimeDog {
  slug: string;
  name?: string;
  description?: string | null;
  updated_at?: string;
}

function getJson<T>(url: string, headers: Record<string, string>): Promise<T[]> {
  const request = url.startsWith("http:") ? httpRequest : httpsRequest;
  return new Promise((resolve) => {
    try {
      const req = request(url, { method: "GET", headers }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          if ((res.statusCode ?? 500) >= 400) return resolve([]);
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch {
            resolve([]);
          }
        });
        res.on("error", () => resolve([]));
      });
      req.on("error", () => resolve([]));
      req.end();
    } catch {
      resolve([]);
    }
  });
}

export async function restGet<T>(table: string, query: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  return getJson<T>(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: "application/json",
  });
}

export async function fetchDogsForBuild(slug?: string): Promise<BuildTimeDog[]> {
  const query = slug
    ? `slug=eq.${encodeURIComponent(slug)}&status=in.(published,pending,adopted)&select=name,slug,description,updated_at`
    : `status=in.(published,pending,adopted)&select=slug,updated_at`;
  return restGet<BuildTimeDog>("dogs", query);
}

// Same filter/order as DogsListClient's browser query.
export async function fetchAvailableDogsForBuild(): Promise<Dog[]> {
  return restGet<Dog>(
    "dogs",
    "status=in.(published,pending)&select=*&order=sort_order.asc,created_at.desc"
  );
}

// Same filter/order/limit as FeaturedDogsPreview's browser query.
export async function fetchFeaturedDogsForBuild(): Promise<Dog[]> {
  return restGet<Dog>(
    "dogs",
    "featured=eq.true&is_visible=eq.true&status=in.(published,pending)&select=*&order=sort_order.asc,created_at.desc&limit=3"
  );
}

// Full row plus gallery for one profile page; mirrors DogDetailClient's load.
export async function fetchDogProfileForBuild(
  slug: string
): Promise<{ dog: Dog; media: DogMedia[] } | null> {
  const [dog] = await restGet<Dog>(
    "dogs",
    `slug=eq.${encodeURIComponent(slug)}&status=in.(published,pending,adopted)&select=*&limit=1`
  );
  if (!dog) return null;
  const media = await restGet<DogMedia>(
    "dog_media",
    `dog_id=eq.${encodeURIComponent(dog.id)}&select=*&order=sort_order.asc`
  );
  return { dog, media };
}
