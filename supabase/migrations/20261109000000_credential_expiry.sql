-- Credentials that expire and take the site down if nobody renews them.
--
-- First entry: the Microsoft Entra client secret behind admin sign-in. When
-- it lapses, "Sign in with Microsoft" stops working for every admin.
--
-- The credential-expiry-reminder edge function runs once a day (pg_cron,
-- below). For each row with 30 days or fewer left and no reminder sent yet,
-- it emails the alert inbox once and stamps reminded_at. The Admin ->
-- Settings page also shows the date.
--
-- AFTER RENEWING a credential, record the new date so the next reminder is
-- armed again:
--   update public.credential_expirations
--      set expires_on = '<new date>', reminded_at = null
--    where name = 'Microsoft sign-in client secret';

create table if not exists public.credential_expirations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  renew_steps text not null,
  expires_on date not null,
  reminded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.credential_expirations enable row level security;

-- Signed-in admins can see the dates (Settings page). Nobody writes from the
-- browser; the reminder function uses the service role.
drop policy if exists "credential_expirations_admin_read" on public.credential_expirations;
create policy "credential_expirations_admin_read" on public.credential_expirations
  for select
  to authenticated
  using (true);

insert into public.credential_expirations (name, renew_steps, expires_on)
values (
  'Microsoft sign-in client secret',
  E'1. Go to entra.microsoft.com > App registrations > "Sky''s Path Website Admin Sign-in" > Certificates & secrets.\n'
  || E'2. Click New client secret (24 months), then copy its Value.\n'
  || E'3. In Supabase > Authentication > Sign In / Providers > Azure, paste it into Secret Value and Save.\n'
  || E'4. Sign in at skyspath.com/admin/login to confirm it works, then delete the old secret in Entra.\n'
  || E'5. In the Supabase SQL editor, record the new date (see supabase/migrations/20261109000000_credential_expiry.sql).',
  date '2028-11-08'
)
on conflict (name) do nothing;

-- Daily check at 15:00 UTC (8 or 9 am in Montana).
--
-- Before running: replace <ANON_KEY> below with the project's public anon
-- key (the NEXT_PUBLIC_SUPABASE_ANON_KEY value). The function keeps "Verify
-- JWT" on, so the job has to present it.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid) from cron.job where jobname = 'credential-expiry-reminder';

select cron.schedule(
  'credential-expiry-reminder',
  '0 15 * * *',
  $$
  select net.http_post(
    url := 'https://gggqscleapxeblhjflpd.supabase.co/functions/v1/credential-expiry-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
