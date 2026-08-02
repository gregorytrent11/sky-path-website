-- Lets an admin hide a dog from the public site (e.g. after adoption)
-- without changing its status or deleting it -- status still drives the
-- "Adopted" badge and success-story eligibility; this is a separate
-- on/off switch for whether the dog's profile is publicly reachable at
-- all.

alter table public.dogs
  add column if not exists is_visible boolean not null default true;

alter policy "dogs_public_read" on public.dogs
  using (status in ('published', 'pending', 'adopted') and is_visible);
