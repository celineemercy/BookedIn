# BookedIn

Next.js App Router, React, Tailwind CSS, Supabase, Mapbox, and Resend. The live catalog shows approved real businesses only. Fictional stores and browser-only booking remain under `/demo` and never enter live accounts.

## Local development

Use Node.js 24 for the built-in TypeScript test runner. Copy `.env.example` to `.env.local`, then fill the development Supabase project values.

```bash
npm install
npm run dev
```

Without Supabase credentials, the design and `/demo` work, but live catalog, login, and account flows have no data. Without a Mapbox token, sellers can enter exact coordinates manually. Keep the service role key, Resend key, and cron secret server-side; never prefix them with `NEXT_PUBLIC_`.

## Supabase setup

1. Create **two separate Supabase projects**: one for the `dev` preview branch and one for `main` production. Use separate keys, data, Auth users, Storage, and email settings.
2. Apply `supabase/migrations/202610170001_marketplace.sql` through `202610170005_booking_launch_gate.sql` in order to each project. Review every migration before running it. The first migration creates RLS policies, Storage bucket, booking exclusion constraint, and service snapshots. The final migration leaves booking **closed** at the database level.
3. In Supabase Auth, configure email magic links and the exact site URL. Add redirect URLs for `https://YOUR_DOMAIN/auth/callback` and the preview domain. Configure [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) with a verified Resend sending domain for production; Supabase's default email is not suitable for public launch.
4. Sign in once with the operator email, then grant admin status in the Supabase SQL editor using the exact verified email:

   ```sql
   update public.profiles
   set is_admin = true
   where id = (select id from auth.users where email = 'operator@example.com');
   ```

   Admins review shops at `/admin`. Do not grant this flag from client code.
5. Configure `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET`. Verify the sender domain. Enable Supabase Cron and `pg_net`. Create Vault secrets `bookedin_app_url` (the HTTPS site origin) and `bookedin_cron_secret` (the same value as `CRON_SECRET`), then apply `supabase/cron.sql`. The jobs expire pending bookings and retry queued email every five minutes. Check the outbox and job history during testing.

## Launch gate

Booking requires **both** `BOOKING_LAUNCH_READY=true` in the deployed server environment and `public.platform_settings.bookings_open=true` in that environment's database. Keep both false while setting up. Before enabling either in production:

- Verify transactional and Auth emails arrive from the configured domain.
- Approve at least one real seller and check its address, pin, services, hours, and photos.
- Set the real operator name and privacy contact in the Vercel environment and review `/privacy` as the published notice.
- Test request → seller accept/decline → customer status on separate devices, including cancellation, expiry, and an overlapping request.
- Apply reviewed migrations and check build, accessibility, and mobile flow on the production candidate.

After the checks, set the server environment variable and enable the matching database flag:

```sql
update public.platform_settings
set enabled = true, updated_at = now()
where key = 'bookings_open';
```

To stop new requests immediately, set the database flag back to `false`. Existing bookings remain visible and can still be managed.

## Vercel branches

Connect this repository in Vercel. Set **Production Branch** to `main`; pushes to `dev` create preview deployments. Configure Supabase, site URL, Resend, Mapbox, operator, and cron variables separately for Production and Preview. Never copy production service role credentials into Preview. Apply each project's migrations before deploying code that depends on them. Merge `dev` into `main` only after the launch gate checklist and cross-device tests pass.

## Checks

```bash
npm test
npm run lint
npm run build
```

`npm test` covers WIB date handling, 15-minute steps, full service duration, overlap, closure, and the two-hour lead. Database concurrency, RLS isolation, email delivery, and the full three-role journey require a configured Supabase test project. Manual moderated usability testing and deployed Core Web Vitals measurement remain launch tasks.
