-- "Incoming" = a dog the rescue has committed to but who hasn't arrived yet
-- (in transport, waiting on a pull, etc.). Shown publicly with an "Incoming"
-- badge so people can apply ahead of arrival, same as pending dogs stay
-- listed and badged.

alter table public.dogs
  drop constraint if exists dogs_status_check;

alter table public.dogs
  add constraint dogs_status_check
    check (status in ('draft', 'incoming', 'published', 'pending', 'adopted', 'archived'));

alter policy "dogs_public_read" on public.dogs
  using (status in ('incoming', 'published', 'pending', 'adopted') and is_visible);

alter policy "dog_media_public_read" on public.dog_media
  using (
    exists (
      select 1 from public.dogs d
      where d.id = dog_media.dog_id
        and d.status in ('incoming', 'published', 'pending', 'adopted')
    )
  );
