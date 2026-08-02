-- Lets an admin pick which available dogs show in the "Featured Available
-- Dogs" section on the homepage, instead of that section being a static
-- placeholder with no data behind it.

alter table public.dogs
  add column if not exists featured boolean not null default false;
