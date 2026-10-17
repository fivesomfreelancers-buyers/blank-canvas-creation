-- lovable-cron-fallback-reviewed: 1-hour deadline reminders require a delivery window of minutes; no per-record delayed provider is available, so a 5-minute pg_cron backstop calling the idempotent order-deadlines edge function is the required design.
create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'fivesom-order-deadlines') then
    perform cron.unschedule('fivesom-order-deadlines');
  end if;
end $$;

select cron.schedule(
  'fivesom-order-deadlines',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := 'https://afjcjjelgppctsnmtbek.supabase.co/functions/v1/order-deadlines',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hook-secret', app_private.hook_secret('MESSAGE_EMAIL_HOOK_SECRET')
      ),
      body := '{}'::jsonb
    );
  $job$
);