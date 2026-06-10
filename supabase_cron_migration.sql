-- Monthly usage reset via pg_cron
-- Run in Supabase SQL editor (requires pg_cron extension — enabled by default on Supabase)
--
-- This replaces the lazy client-side reset in dashboard/page.tsx.
-- Runs at 00:00 UTC on the 1st of every month.

SELECT cron.schedule(
  'reset-monthly-usage',          -- job name (unique)
  '0 0 1 * *',                    -- cron: midnight on the 1st of every month
  $$
    UPDATE profiles
    SET
      current_usage = 0,
      last_usage_reset_at = NOW()
    WHERE subscription_tier = 'FREE';
  $$
);

-- To verify the job was created:
-- SELECT * FROM cron.job WHERE jobname = 'reset-monthly-usage';

-- To unschedule if needed:
-- SELECT cron.unschedule('reset-monthly-usage');
