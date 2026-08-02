"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { DogMedia } from "@/types/database";

const MAX_DOG_PHOTOS = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024;
const MAX_DOG_VIDEO_SECONDS = 15;

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video metadata"));
    };
    video.src = URL.createObjectURL(file);
  });
}

export default function DogMediaManager({ dogId, dogName }: { dogId: string; dogName: string }) {
  const [media, setMedia] = useState<DogMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function reload() {
    const { data } = await supabase
      .from("dog_media")
      .select("*")
      .eq("dog_id", dogId)
      .order("sort_order", { ascending: true });
    setMedia(data ?? []);
  }

  useEffect(() => {
    // External data fetch when dogId changes, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogId]);

  async function syncPrimaryPhoto(rows: DogMedia[]) {
    const primary = rows.find((m) => m.is_primary) ?? rows.find((m) => m.media_type === "image");
    await supabase.from("dogs").update({ primary_photo_url: primary?.url ?? null }).eq("id", dogId);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const photoCount = media.filter((m) => m.media_type === "image").length;
    let addedPhotos = 0;

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError(`${file.name}: unsupported file type.`);
        continue;
      }
      if (isImage && photoCount + addedPhotos >= MAX_DOG_PHOTOS) {
        setError(`A dog can have at most ${MAX_DOG_PHOTOS} photos.`);
        continue;
      }
      if (isImage && file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name}: images must be under ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB.`);
        continue;
      }
      if (isVideo && file.size > MAX_VIDEO_BYTES) {
        setError(`${file.name}: videos must be under ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB.`);
        continue;
      }
      if (isVideo) {
        try {
          const duration = await readVideoDuration(file);
          if (duration > MAX_DOG_VIDEO_SECONDS) {
            setError(`${file.name}: videos must be ${MAX_DOG_VIDEO_SECONDS} seconds or shorter.`);
            continue;
          }
        } catch {
          // If duration can't be read, let the upload proceed rather than
          // blocking on a browser quirk -- the bucket size limit still caps it.
        }
      }

      setUploading(true);
      const bucket = isImage ? "dog-photos" : "dog-videos";
      const ext = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
      const path = `${dogId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        setError(`${file.name}: upload failed (${uploadError.message}).`);
        setUploading(false);
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

      await supabase.from("dog_media").insert({
        dog_id: dogId,
        media_type: isImage ? "image" : "video",
        storage_path: path,
        url: publicUrlData.publicUrl,
        bytes: file.size,
        sort_order: media.length + addedPhotos,
        is_primary: media.length === 0 && addedPhotos === 0,
      });

      if (isImage) addedPhotos += 1;
      setUploading(false);
    }

    const { data: freshRows } = await supabase
      .from("dog_media")
      .select("*")
      .eq("dog_id", dogId)
      .order("sort_order", { ascending: true });
    setMedia(freshRows ?? []);
    await syncPrimaryPhoto(freshRows ?? []);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removeMedia(item: DogMedia) {
    if (!window.confirm("Remove this file?")) return;
    const bucket = item.media_type === "image" ? "dog-photos" : "dog-videos";
    await supabase.storage.from(bucket).remove([item.storage_path]);
    await supabase.from("dog_media").delete().eq("id", item.id);
    const remaining = media.filter((m) => m.id !== item.id);
    setMedia(remaining);
    await syncPrimaryPhoto(remaining);
  }

  async function makePrimary(item: DogMedia) {
    await supabase.from("dog_media").update({ is_primary: false }).eq("dog_id", dogId);
    await supabase.from("dog_media").update({ is_primary: true }).eq("id", item.id);
    await supabase.from("dogs").update({ primary_photo_url: item.url }).eq("id", dogId);
    await reload();
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-purple px-4 py-2 text-sm font-semibold text-brand-purple hover:bg-brand-lavender/20">
        {uploading ? "Uploading…" : `Upload photos or a short video of ${dogName}`}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {media.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((item) => (
            <li key={item.id} className="relative overflow-hidden rounded-lg border border-brand-soft-blue/60">
              <div className="relative aspect-square bg-brand-gray">
                {item.media_type === "image" ? (
                  <Image src={item.url} alt={item.alt_text || `Photo of ${dogName}`} fill className="object-cover" />
                ) : (
                  <video src={item.url} className="h-full w-full object-cover" muted />
                )}
                {item.is_primary && (
                  <span className="absolute left-1 top-1 rounded bg-brand-purple px-1.5 py-0.5 text-[10px] font-semibold text-brand-white">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex justify-between gap-1 bg-brand-white p-1.5 text-xs">
                {item.media_type === "image" && !item.is_primary && (
                  <button
                    type="button"
                    onClick={() => makePrimary(item)}
                    className="text-brand-purple hover:underline"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(item)}
                  className="ml-auto text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
