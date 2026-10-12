-- Lets an admin crop and adjust a dog photo instead of only picking a focal
-- point. The crop is stored as a rectangle in fractions of the original
-- image ({"x","y","w","h"} in 0..1, plus "ar" = the crop's own pixel aspect
-- ratio), so the original upload is never altered and the crop can be
-- re-adjusted later. NULL means "no crop" and the photo renders with the
-- focal point exactly as before.

alter table public.dog_media
  add column if not exists crop jsonb
    check (
      crop is null
      or (
        jsonb_typeof(crop) = 'object'
        and jsonb_typeof(crop->'x') = 'number'
        and jsonb_typeof(crop->'y') = 'number'
        and jsonb_typeof(crop->'w') = 'number'
        and jsonb_typeof(crop->'h') = 'number'
        and jsonb_typeof(crop->'ar') = 'number'
      )
    );

-- dogs.primary_photo_url / _focal_* are a denormalized copy of the primary
-- dog_media row (kept in sync by the admin UI) so listing cards render without
-- a join. Mirror the crop the same way.
alter table public.dogs
  add column if not exists primary_photo_crop jsonb
    check (
      primary_photo_crop is null
      or (
        jsonb_typeof(primary_photo_crop) = 'object'
        and jsonb_typeof(primary_photo_crop->'x') = 'number'
        and jsonb_typeof(primary_photo_crop->'y') = 'number'
        and jsonb_typeof(primary_photo_crop->'w') = 'number'
        and jsonb_typeof(primary_photo_crop->'h') = 'number'
        and jsonb_typeof(primary_photo_crop->'ar') = 'number'
      )
    );
