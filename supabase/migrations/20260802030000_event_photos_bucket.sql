-- Storage bucket for event cover photos, so admins can upload an image
-- directly instead of pasting a URL. Mirrors the dog-photos bucket pattern.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "event_photos_admin_write" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'event-photos');

create policy "event_photos_admin_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'event-photos')
  with check (bucket_id = 'event-photos');

create policy "event_photos_admin_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'event-photos');
