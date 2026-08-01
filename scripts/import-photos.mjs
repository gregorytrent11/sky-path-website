// Bulk-imports dog photos/videos from Photos/Dogs/<Dog Name>/* into
// Supabase Storage + the dog_media table, creating a draft dog record per
// folder if one doesn't already exist (matched by slug).
//
// Usage:
//   node --env-file=.env.local scripts/import-photos.mjs
//
// Folder convention: one subfolder per dog, named after the dog
// (e.g. Photos/Dogs/Bella/photo1.jpg). Re-running is safe -- a dog whose
// folder already has matching media rows is skipped entirely, so partially
// imported dogs are the only ones that get retried.
//
// Signs in as a real admin user (prompted at runtime, never hardcoded) and
// relies on the same RLS policies as the admin UI -- no service-role key
// needed.

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOGS_DIR = path.join(ROOT, "Photos", "Dogs");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const MAX_DOG_PHOTOS = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

const ENTER_CHARS = new Set(["\n", "\r"]);
const BACKSPACE_CHARS = new Set(["\x7f", "\b"]);
const CTRL_C = "\x03";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    console.error("Run with: node --env-file=.env.local scripts/import-photos.mjs");
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

  let dogFolders;
  try {
    dogFolders = (await readdir(DOGS_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    console.error(`Could not read ${DOGS_DIR}`);
    process.exit(1);
  }

  if (dogFolders.length === 0) {
    console.log(`No subfolders found in ${DOGS_DIR}. Add one folder per dog and re-run.`);
    return;
  }

  let dogsCreated = 0;
  let dogsSkipped = 0;
  let filesUploaded = 0;
  let filesSkipped = 0;

  for (const folderName of dogFolders) {
    const dogDir = path.join(DOGS_DIR, folderName);
    const slug = slugify(folderName);

    const files = (await readdir(dogDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
      });

    if (files.length === 0) {
      console.log(`- ${folderName}: no image/video files, skipping.`);
      continue;
    }

    let { data: dog } = await supabase.from("dogs").select("*").eq("slug", slug).maybeSingle();

    if (!dog) {
      const { data: created, error: createError } = await supabase
        .from("dogs")
        .insert({ name: folderName, slug, status: "draft" })
        .select("*")
        .single();
      if (createError) {
        console.error(`- ${folderName}: could not create dog record (${createError.message})`);
        continue;
      }
      dog = created;
      dogsCreated += 1;
      console.log(`- ${folderName}: created draft dog record.`);
    }

    const { count: existingMediaCount } = await supabase
      .from("dog_media")
      .select("id", { count: "exact", head: true })
      .eq("dog_id", dog.id);

    if (existingMediaCount && existingMediaCount > 0) {
      console.log(`- ${folderName}: already has ${existingMediaCount} media rows, skipping.`);
      dogsSkipped += 1;
      continue;
    }

    let photoCount = 0;
    let sortOrder = 0;
    let firstImageUrl = null;

    for (const fileName of files) {
      const ext = path.extname(fileName).toLowerCase();
      const isImage = IMAGE_EXT.has(ext);
      const filePath = path.join(dogDir, fileName);
      const { size } = await stat(filePath);

      if (isImage && photoCount >= MAX_DOG_PHOTOS) {
        console.log(`  - ${fileName}: skipped (dog already has ${MAX_DOG_PHOTOS} photos)`);
        filesSkipped += 1;
        continue;
      }
      if (isImage && size > MAX_IMAGE_BYTES) {
        console.log(`  - ${fileName}: skipped (over ${MAX_IMAGE_BYTES / 1024 / 1024}MB)`);
        filesSkipped += 1;
        continue;
      }
      if (!isImage && size > MAX_VIDEO_BYTES) {
        console.log(`  - ${fileName}: skipped (over ${MAX_VIDEO_BYTES / 1024 / 1024}MB)`);
        filesSkipped += 1;
        continue;
      }

      const bucket = isImage ? "dog-photos" : "dog-videos";
      const storagePath = `${dog.id}/${crypto.randomUUID()}${ext}`;
      const buffer = await readFile(filePath);

      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
        contentType: isImage ? `image/${ext.slice(1) === "jpg" ? "jpeg" : ext.slice(1)}` : `video/${ext.slice(1)}`,
        upsert: false,
      });
      if (uploadError) {
        console.error(`  - ${fileName}: upload failed (${uploadError.message})`);
        filesSkipped += 1;
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const isPrimary = isImage && !firstImageUrl;
      if (isPrimary) firstImageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("dog_media").insert({
        dog_id: dog.id,
        media_type: isImage ? "image" : "video",
        storage_path: storagePath,
        url: publicUrlData.publicUrl,
        bytes: size,
        sort_order: sortOrder,
        is_primary: isPrimary,
      });
      if (insertError) {
        console.error(`  - ${fileName}: db insert failed (${insertError.message})`);
        filesSkipped += 1;
        continue;
      }

      sortOrder += 1;
      if (isImage) photoCount += 1;
      filesUploaded += 1;
      console.log(`  - ${fileName}: uploaded`);
    }

    if (firstImageUrl) {
      await supabase.from("dogs").update({ primary_photo_url: firstImageUrl }).eq("id", dog.id);
    }
  }

  console.log(
    `\nDone. Dogs created: ${dogsCreated}, dogs skipped (already imported): ${dogsSkipped}, files uploaded: ${filesUploaded}, files skipped: ${filesSkipped}.`
  );
  console.log("New dogs are saved as drafts -- review and publish them from /admin/dogs/.");
}

main();
