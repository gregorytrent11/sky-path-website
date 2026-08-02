-- Lets an admin reposition which part of the cover photo stays visible when
-- it's cropped to different aspect ratios (event card vs. detail hero),
-- instead of always cropping to dead-center.

alter table public.events
  add column if not exists cover_focal_x numeric not null default 50 check (cover_focal_x between 0 and 100),
  add column if not exists cover_focal_y numeric not null default 50 check (cover_focal_y between 0 and 100);
