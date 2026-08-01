-- Switch dog_media from a Cloudinary-based design to Supabase Storage, and
-- set up the two buckets it uses. Split into photos/videos buckets so each
-- can carry its own size limit, matching the existing MAX_IMAGE_BYTES /
-- MAX_VIDEO_BYTES env vars.

alter table public.dog_media rename column cloudinary_public_id to storage_path;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dog-photos',
  'dog-photos',
  true,
  10485760, -- 10 MB, matches MAX_IMAGE_BYTES
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dog-videos',
  'dog-videos',
  true,
  157286400, -- 150 MB, matches MAX_VIDEO_BYTES
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

-- Public buckets already serve reads without an RLS policy; only writes
-- need to be locked down to admins (any authenticated user).
create policy "dog_media_buckets_admin_write" on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('dog-photos', 'dog-videos'));

create policy "dog_media_buckets_admin_update" on storage.objects
  for update
  to authenticated
  using (bucket_id in ('dog-photos', 'dog-videos'))
  with check (bucket_id in ('dog-photos', 'dog-videos'));

create policy "dog_media_buckets_admin_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('dog-photos', 'dog-videos'));
