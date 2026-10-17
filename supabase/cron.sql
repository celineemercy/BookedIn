-- Apply after enabling Supabase Cron in the project dashboard.
-- The database migration owns the function; this schedule keeps pending slots fresh.
select cron.schedule('bookedin-expire-bookings', '*/5 * * * *', $$select public.expire_bookings();$$);

-- Create Vault secrets named bookedin_app_url and bookedin_cron_secret first.
-- Enable pg_net, then apply this job to retry notification email every five minutes.
select cron.schedule('bookedin-email-outbox', '*/5 * * * *', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'bookedin_app_url') || '/api/internal/email',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'bookedin_cron_secret')),
    body := '{}'::jsonb
  );
$job$);
