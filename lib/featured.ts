import type { Dog, DogStatus } from "@/types/database";

// The homepage "Featured Available Dogs" section shows at most this many.
export const MAX_FEATURED_DOGS = 8;

// Only dogs in these statuses are listed publicly, so only they can appear
// in the featured section regardless of the flag. Keep in step with the
// public read policy and the browser/build-time queries.
export const FEATURED_STATUSES: DogStatus[] = ["incoming", "published", "pending"];

// Whether a dog actually takes one of the homepage's featured slots. An
// adopted or hidden dog can still carry the flag (it was featured once) but
// it doesn't show and shouldn't count against the cap.
export function showsOnHomepage(dog: Pick<Dog, "featured" | "is_visible" | "status">): boolean {
  return dog.featured && dog.is_visible && FEATURED_STATUSES.includes(dog.status);
}
