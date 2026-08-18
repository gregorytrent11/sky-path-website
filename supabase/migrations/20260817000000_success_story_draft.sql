-- Success stories: draft/publish state, and a cap that matches the editor.
--
-- 1. The original success_story column capped at 500 characters, but the
--    admin editor now allows 1500. Without this the editor happily accepts a
--    longer story and the save fails on a constraint violation.
--
-- 2. Success stories previously went live the moment a dog was marked adopted
--    and the field was non-empty -- there was no way to write one ahead of
--    time. This adds the same draft/published split dogs and events already
--    have.

alter table public.dogs
  drop constraint if exists dogs_success_story_check;

alter table public.dogs
  add constraint dogs_success_story_check
  check (success_story is null or char_length(success_story) <= 1500);

alter table public.dogs
  add column if not exists success_story_status text not null default 'draft'
    check (success_story_status in ('draft', 'published'));

-- Backfill: any story already written on an adopted dog is on the public
-- Success Stories page right now. Defaulting the new column to 'draft' would
-- silently pull all of them off the site, so mark those published.
update public.dogs
set success_story_status = 'published'
where status = 'adopted'
  and success_story is not null
  and btrim(success_story) <> '';
