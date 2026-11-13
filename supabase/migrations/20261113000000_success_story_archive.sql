-- Success stories: a third state, 'archived'.
--
-- The site carries at most 10 published stories. When an 11th is published
-- the oldest one moves to the archive (Admin > Success Stories) instead of
-- being lost or set back to a draft. Archived stories keep their text and
-- are never shown publicly: every public query filters on 'published'.

alter table public.dogs
  drop constraint if exists dogs_success_story_status_check;

alter table public.dogs
  add constraint dogs_success_story_status_check
  check (success_story_status in ('draft', 'published', 'archived'));
