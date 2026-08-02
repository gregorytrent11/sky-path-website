# Sky's Path to Home

Next.js (static export) site + Supabase backend for Sky's Path to Home, a
Montana dog rescue. Deployed to GitHub Pages at `skyspath.com`.

## Local development

```
cp .env.example .env.local   # fill in the Supabase URL/anon key, Turnstile site key
npm install
npm run dev
```

Admin login is at `/admin/login`. Accounts are created manually in the
Supabase dashboard (Authentication → Users); there's no public sign-up.

## Architecture

- **Frontend:** Next.js App Router, `output: "export"` (fully static, no
  Node server at runtime). Dog listing/detail pages and the admin area
  client-fetch from Supabase directly.
- **Database:** Supabase Postgres. Schema + RLS policies live in
  `supabase/migrations/`.
- **Media:** Supabase Storage (`dog-photos`, `dog-videos` buckets), uploaded
  from the admin dog editor.
- **Forms:** Contact/Volunteer/Request Help all go through the `submit-form`
  Supabase Edge Function (`supabase/functions/submit-form/`), which verifies
  a Cloudflare Turnstile token server-side before writing to `submissions`.
  There is no direct public insert path into that table.

## Bulk photo import

To import existing photos from `Photos/Dogs/<Dog Name>/*`:

```
npm run import-photos
```

One subfolder per dog. Creates a draft dog record per folder if one doesn't
already exist (matched by slug), uploads every image/video inside, and skips
folders that already have media (safe to re-run). Prompts for an admin
email/password at runtime.

## Deploying

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to
`main`, on a schedule (so newly-published dogs get their own static URL
without waiting on a code push; the `/dogs` listing itself is always live
regardless), and via manual dispatch.

Before this can run, the repo needs:

- **Settings → Pages → Source:** "GitHub Actions"
- **Settings → Secrets and variables → Actions → Secrets:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- **Settings → Secrets and variables → Actions → Variables** (not secret,
  just build-time config):
  - `NEXT_PUBLIC_SITE_URL` (`https://skyspath.com`)
  - `NEXT_PUBLIC_DONATION_URL`
  - `NEXT_PUBLIC_ADOPT_APPLICATION_URL`
  - `NEXT_PUBLIC_FOSTER_APPLICATION_URL`

For the custom domain: add a `public/CNAME` file containing `skyspath.com`,
and point Bluehost DNS at GitHub Pages.
