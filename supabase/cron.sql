-- Apply after enabling Supabase Cron in the project dashboard.
-- The database migration owns the function; this schedule keeps pending slots fresh.
select cron.schedule('bookedin-expire-bookings', '*/5 * * * *', $$select public.expire_bookings();$$);
