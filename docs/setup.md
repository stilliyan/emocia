# Setup

Prerequisites: Node.js 20+, npm, a Supabase project, and optionally Vercel.

1. Run `npm install` and copy `.env.example` to `.env.local`.
2. In Supabase SQL Editor run `supabase/migrations/202607120001_initial.sql`.
3. Create a public Storage bucket named `product-images`; policies are included in the migration.
4. In Authentication disable public sign-ups where appropriate. Create or sign in the owner, then follow `SUPABASE_SETUP.md` to grant that exact Auth user UUID the `admin` role. GitHub authentication alone does not grant CMS access.
5. Run `npm run dev`. Quality commands are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
6. Optional demo data: run `supabase/seed.sql` manually only in development.

For Vercel, import the repository, add the two public Supabase environment variables, and deploy with `vercel` or the dashboard. Never add a service-role key to browser-visible variables. Enable Supabase backups/PITR appropriate to the shop and periodically test exports.

A future public website should use a server-side Supabase anon client and query only `status = 'published'` products plus active categories. RLS already supports that access; keep admin-only/internal fields out of the public response mapper.

## AI product copy

The optional “AI помощник” requires `OPENAI_API_KEY` in `.env.local` (and in Vercel server environment variables for deployment). The key is read only inside a Server Action, is never prefixed with `NEXT_PUBLIC_`, and must not be committed. `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`. Restart the development server after changing environment variables. Run `npm run test:openai` for a minimal server-only connectivity check. The basic per-admin rate limiter is intentionally in-memory for local development and single-instance protection; production deployments that need cross-instance enforcement should replace its storage with a shared rate-limit store.

## Browser extensions during local development

Disable LanguageTool/Grammarly extensions on localhost if Next.js shows hydration mismatch warnings. These extensions may add attributes such as `data-lt-installed` to the server-rendered `<html>` before React hydrates; this is not an application data mismatch.

CMS text fields opt out of common LanguageTool/Grammarly editor overlays. Browser extensions still control the page and may inject icons despite these attributes; if an icon remains or changes the focus appearance, disable the writing-assistant extension for `localhost`.

## Settings and content ownership

`site_settings` is the single CMS source for the shop name, contact details, address, working hours, social links, Google Maps URL, and default SEO values. `site_content` is used only for editorial homepage copy (`hero_*` and `about_*`). Legacy contact columns in `site_content` remain in the database for compatibility but are not edited by the CMS.

## Dashboard calendar

The dashboard calendar uses `public.calendar_events` and requires `supabase/migrations/202607130001_calendar_events.sql`. For an existing hosted project, copy that complete file into Supabase Dashboard → SQL Editor and run it once, or use `supabase db push` only when the CLI is intentionally linked to the correct project. The migration keeps RLS enabled: authenticated administrators can read, update, and delete events, while inserts additionally require `created_by = auth.uid()`. The browser uses only the normal Supabase publishable/anon key; no service-role key is needed.

## Public appointment requests

The public “Запази час” buttons open a short form for a preferred date and time. Existing Supabase projects must run `supabase/migrations/202607200001_appointment_requests.sql` once in Supabase Dashboard → SQL Editor. Fresh manual installations already include the same setup in `supabase/manual-setup.sql`.

Public visitors do not receive direct table access. The form uses the limited `submit_appointment_request` RPC, validates the input on the server and in PostgreSQL, and rate-limits repeated requests by phone. RLS remains enabled and only approved CMS administrators can read or manage requests. Confirming a request in `/admin` atomically creates a one-hour `calendar_events` entry in the `Europe/Sofia` time zone; overlapping upcoming events are rejected. No service-role key is used or required.
