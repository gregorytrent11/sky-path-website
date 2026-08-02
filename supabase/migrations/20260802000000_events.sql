-- Sky's Path to Home -- events (blog-style event posts)

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  event_date date,
  location text,
  summary text,
  body text,
  cover_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists events_status_idx on public.events (status);
create index if not exists events_event_date_idx on public.events (event_date desc);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

alter table public.events enable row level security;

-- events: public can read published events; admins (any authenticated user)
-- can read and write everything -- mirrors the dogs table policy pattern.
create policy "events_public_read" on public.events
  for select
  to anon, authenticated
  using (status = 'published');

create policy "events_admin_read_all" on public.events
  for select
  to authenticated
  using (true);

create policy "events_admin_write" on public.events
  for insert
  to authenticated
  with check (true);

create policy "events_admin_update" on public.events
  for update
  to authenticated
  using (true)
  with check (true);

create policy "events_admin_delete" on public.events
  for delete
  to authenticated
  using (true);
