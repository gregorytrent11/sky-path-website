-- Sky's Path to Home -- initial schema
-- Tables: dogs, dog_media, submissions
-- Auth: handled entirely by Supabase Auth (auth.users) -- any authenticated
-- user is treated as an admin. Accounts are created manually by staff
-- (dashboard / admin API), there is no public sign-up.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- dogs
-- ---------------------------------------------------------------------
create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'pending', 'adopted', 'archived')),
  breed text,
  sex text check (sex in ('male', 'female', 'unknown')),
  age_category text check (age_category in ('puppy', 'young', 'adult', 'senior')),
  weight_lbs numeric,
  size text check (size in ('small', 'medium', 'large', 'xlarge')),
  good_with_kids boolean,
  good_with_dogs boolean,
  good_with_cats boolean,
  house_trained boolean,
  energy_level text check (energy_level in ('low', 'medium', 'high')),
  description text,
  foster_notes text,
  intake_date date,
  location text,
  primary_photo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists dogs_status_idx on public.dogs (status);
create index if not exists dogs_sort_order_idx on public.dogs (sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dogs_set_updated_at on public.dogs;
create trigger dogs_set_updated_at
  before update on public.dogs
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- dog_media
-- ---------------------------------------------------------------------
create table if not exists public.dog_media (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  storage_path text not null,
  url text not null,
  width integer,
  height integer,
  duration_seconds numeric,
  bytes integer,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  alt_text text,
  created_at timestamptz not null default now()
);

create index if not exists dog_media_dog_id_idx on public.dog_media (dog_id);

-- ---------------------------------------------------------------------
-- submissions (contact / volunteer / request-help / adopt / foster forms)
-- ---------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null
    check (form_type in ('contact', 'volunteer', 'request_help', 'adopt_application', 'foster_application')),
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved', 'archived')),
  name text not null,
  email text not null,
  phone text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  dog_id uuid references public.dogs (id) on delete set null,
  turnstile_verified boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_form_type_idx on public.submissions (form_type);
create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.dogs enable row level security;
alter table public.dog_media enable row level security;
alter table public.submissions enable row level security;

-- dogs: public can read published/pending/adopted dogs (pending = adoption
-- in progress but still shown, badged, so people don't duplicate-apply);
-- admins (any authenticated user) can read and write everything.
create policy "dogs_public_read" on public.dogs
  for select
  to anon, authenticated
  using (status in ('published', 'pending', 'adopted'));

create policy "dogs_admin_read_all" on public.dogs
  for select
  to authenticated
  using (true);

create policy "dogs_admin_write" on public.dogs
  for insert
  to authenticated
  with check (true);

create policy "dogs_admin_update" on public.dogs
  for update
  to authenticated
  using (true)
  with check (true);

create policy "dogs_admin_delete" on public.dogs
  for delete
  to authenticated
  using (true);

-- dog_media: public can read media belonging to a publicly-visible dog;
-- admins can read/write everything.
create policy "dog_media_public_read" on public.dog_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.dogs d
      where d.id = dog_media.dog_id
        and d.status in ('published', 'pending', 'adopted')
    )
  );

create policy "dog_media_admin_all" on public.dog_media
  for all
  to authenticated
  using (true)
  with check (true);

-- submissions: intentionally NO anon insert/select policy. Public form
-- writes go through the `submit-form` Edge Function using the service role
-- (after verifying the Cloudflare Turnstile token server-side), so a bad
-- actor can't hit PostgREST directly and skip the spam check. Admins can
-- read/manage everything via the authenticated role.
create policy "submissions_admin_all" on public.submissions
  for all
  to authenticated
  using (true)
  with check (true);
