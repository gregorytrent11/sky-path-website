// Finds and removes files in Supabase Storage that nothing in the database
// points at any more.
//
// Usage:
//   node --env-file=.env.local scripts/cleanup-orphaned-media.mjs          (dry run)
//   node --env-file=.env.local scripts/cleanup-orphaned-media.mjs --delete
//
// Dry run by default: it lists what it would remove and changes nothing.
// Re-read that list before passing --delete, because deleting from Storage
// cannot be undone.
//
// Orphans come from deletions that predate the storage cleanup in the admin
// UI -- deleting a row never touched the bucket, so a deleted dog's photos or
// a replaced event cover stayed behind, still counting against the storage
// quota with nothing linking to them.
//
// Signs in as a real admin user (prompted at runtime, never hardcoded) and
// relies on the same RLS policies as the admin UI -- no service-role key
// needed.

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline";

const DOG_PHOTO_BUCKET = "dog-photos";
const DOG_VIDEO_BUCKET = "dog-videos";
const EVENT_PHOTO_BUCKET = "event-photos";

const ENTER_CHARS = new Set(["\n", "\r"]);
const BACKSPACE_CHARS = new Set(["\x7f", "\b"]);
const CTRL_C = "\x03";

function prompt(question, { mask = false } = {}) {
  return new Promise((resolve) => {
    if (!mask) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
      return;
    }

    process.stdout.write(question);
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const onData = (char) => {
      if (ENTER_CHARS.has(char)) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === CTRL_C) {
        process.stdout.write("\n");
        process.exit(1);
      }
      if (BACKSPACE_CHARS.has(char)) {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };
    process.stdin.on("data", onData);
  });
}

function storagePathFromPublicUrl(url, bucket) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

// storage.list() is one directory at a time and pages at 100, so walk it.
async function listAllObjects(supabase, bucket, prefix = "") {
  const found = [];
  const pageSize = 100;
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`Listing ${bucket}/${prefix}: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back as rows with no id and no metadata.
      if (entry.id === null) {
        found.push(...(await listAllObjects(supabase, bucket, path)));
      } else {
        found.push({ path, bytes: entry.metadata?.size ?? 0 });
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return found;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function main() {
  const shouldDelete = process.argv.includes("--delete");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    console.error("Run with: node --env-file=.env.local scripts/cleanup-orphaned-media.mjs");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, anonKey);

  const email = await prompt("Admin email: ");
  const password = await prompt("Admin password: ", { mask: true });
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    console.error(`Sign-in failed: ${authError.message}`);
    process.exit(1);
  }
  console.log("Signed in.\n");

  // Everything the database still points at, per bucket.
  const { data: media, error: mediaError } = await supabase
    .from("dog_media")
    .select("media_type,storage_path");
  if (mediaError) {
    console.error(`Could not read dog_media: ${mediaError.message}`);
    process.exit(1);
  }

  const { data: dogs, error: dogsError } = await supabase.from("dogs").select("primary_photo_url");
  if (dogsError) {
    console.error(`Could not read dogs: ${dogsError.message}`);
    process.exit(1);
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("cover_image_url");
  if (eventsError) {
    console.error(`Could not read events: ${eventsError.message}`);
    process.exit(1);
  }

  const referenced = {
    [DOG_PHOTO_BUCKET]: new Set(
      media.filter((row) => row.media_type === "image").map((row) => row.storage_path),
    ),
    [DOG_VIDEO_BUCKET]: new Set(
      media.filter((row) => row.media_type === "video").map((row) => row.storage_path),
    ),
    [EVENT_PHOTO_BUCKET]: new Set(
      events
        .map((row) => storagePathFromPublicUrl(row.cover_image_url, EVENT_PHOTO_BUCKET))
        .filter(Boolean),
    ),
  };

  // A dog's primary photo is normally also a dog_media row, but belt and
  // braces -- never delete something a live page is still rendering.
  for (const dog of dogs) {
    const path = storagePathFromPublicUrl(dog.primary_photo_url, DOG_PHOTO_BUCKET);
    if (path) referenced[DOG_PHOTO_BUCKET].add(path);
  }

  let totalOrphans = 0;
  let totalBytes = 0;

  for (const bucket of [DOG_PHOTO_BUCKET, DOG_VIDEO_BUCKET, EVENT_PHOTO_BUCKET]) {
    const objects = await listAllObjects(supabase, bucket);
    const orphans = objects.filter((object) => !referenced[bucket].has(object.path));
    const bucketBytes = orphans.reduce((sum, object) => sum + object.bytes, 0);

    console.log(
      `${bucket}: ${objects.length} file(s), ${orphans.length} orphaned (${formatBytes(bucketBytes)})`,
    );
    for (const orphan of orphans) {
      console.log(`  ${shouldDelete ? "deleting" : "would delete"} ${orphan.path} (${formatBytes(orphan.bytes)})`);
    }

    if (shouldDelete && orphans.length > 0) {
      // remove() caps at 1000 keys per call.
      for (let i = 0; i < orphans.length; i += 1000) {
        const batch = orphans.slice(i, i + 1000).map((object) => object.path);
        const { error } = await supabase.storage.from(bucket).remove(batch);
        if (error) console.error(`  Failed to delete from ${bucket}: ${error.message}`);
      }
    }

    totalOrphans += orphans.length;
    totalBytes += bucketBytes;
    console.log("");
  }

  if (totalOrphans === 0) {
    console.log("No orphaned files. Nothing to do.");
    return;
  }

  if (shouldDelete) {
    console.log(`Deleted ${totalOrphans} orphaned file(s), freeing ${formatBytes(totalBytes)}.`);
  } else {
    console.log(
      `${totalOrphans} orphaned file(s) using ${formatBytes(totalBytes)}.\n` +
        "Dry run -- nothing was deleted. Re-run with --delete to remove them.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
