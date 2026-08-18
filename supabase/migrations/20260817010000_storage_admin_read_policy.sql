-- Storage deletes were silently doing nothing.
--
-- supabase.storage.remove() looks an object up in storage.objects before
-- deleting it. There was no SELECT policy on that table at all -- only
-- INSERT, UPDATE and DELETE -- so the authenticated role could not see the
-- row. The delete then matched zero rows and returned success with an empty
-- result, no error. Every "delete" from the admin UI (dog photos, dog videos,
-- event cover photos) left the file sitting in the bucket.
--
-- The buckets are public, so reads over the public CDN URL never touch RLS.
-- That is why uploads and page rendering always looked fine and only deletes
-- were broken -- and why it went unnoticed.
--
-- This also unblocks storage.list(), which scripts/cleanup-orphaned-media.mjs
-- needs to find the files orphaned while deletes were failing.

drop policy if exists "media_buckets_admin_read" on storage.objects;

create policy "media_buckets_admin_read" on storage.objects
  for select
  to authenticated
  using (bucket_id in ('dog-photos', 'dog-videos', 'event-photos'));
