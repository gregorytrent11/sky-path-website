-- Same idea as the event cover-photo focal point: lets an admin choose
-- which part of a dog photo stays in view when it's cropped to different
-- aspect ratios (square admin thumbnail, 4:3 listing card, 4:3 detail
-- gallery).

alter table public.dog_media
  add column if not exists focal_x numeric not null default 50 check (focal_x between 0 and 100),
  add column if not exists focal_y numeric not null default 50 check (focal_y between 0 and 100);

-- dogs.primary_photo_url is a denormalized copy of the primary dog_media
-- row's url (kept in sync by the admin UI) so the dogs listing card can
-- render without an extra join. Mirror its focal point the same way.
alter table public.dogs
  add column if not exists primary_photo_focal_x numeric not null default 50 check (primary_photo_focal_x between 0 and 100),
  add column if not exists primary_photo_focal_y numeric not null default 50 check (primary_photo_focal_y between 0 and 100);
