import { supabase } from "@/lib/supabase/client";

// Deleting a row never touches Supabase Storage, so anything uploaded has to
// be removed explicitly or the object is orphaned in the bucket forever --
// still billed for, invisible from the admin UI. These helpers cover the
// paths where a row goes away but the file otherwise wouldn't.

export const DOG_PHOTO_BUCKET = "dog-photos";
export const DOG_VIDEO_BUCKET = "dog-videos";
export const EVENT_PHOTO_BUCKET = "event-photos";

// Public URLs look like
// https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    // A path that isn't valid percent-encoding is still a usable key.
    return path;
  }
}

// Removes every stored photo and video belonging to a dog. Call this BEFORE
// deleting the dog row: `dog_media` is `on delete cascade`, so once the dog is
// gone there's no record of which files were ever hers.
export async function removeDogMediaObjects(dogId: string): Promise<void> {
  const { data } = await supabase
    .from("dog_media")
    .select("media_type,storage_path")
    .eq("dog_id", dogId);
  if (!data || data.length === 0) return;

  const photos = data
    .filter((row) => row.media_type === "image")
    .map((row) => row.storage_path)
    .filter(Boolean);
  const videos = data
    .filter((row) => row.media_type === "video")
    .map((row) => row.storage_path)
    .filter(Boolean);

  // A storage failure shouldn't block the delete the admin actually asked
  // for -- worst case we leave an orphan, which the cleanup script sweeps.
  await Promise.all([
    photos.length > 0 ? supabase.storage.from(DOG_PHOTO_BUCKET).remove(photos) : null,
    videos.length > 0 ? supabase.storage.from(DOG_VIDEO_BUCKET).remove(videos) : null,
  ]);
}

export async function removeEventCoverObject(coverImageUrl: string | null): Promise<void> {
  if (!coverImageUrl) return;
  const path = storagePathFromPublicUrl(coverImageUrl, EVENT_PHOTO_BUCKET);
  // A pasted external URL has no object to remove.
  if (!path) return;
  await supabase.storage.from(EVENT_PHOTO_BUCKET).remove([path]);
}
