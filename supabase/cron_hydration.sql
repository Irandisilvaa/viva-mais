-- Opcional: automacao de e-mail para hidratacao.
-- Antes de executar, troque os valores abaixo.
-- A Edge Function deve ter sido publicada com --no-verify-jwt e possuir o mesmo CRON_SECRET.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create schema if not exists vault;
create extension if not exists supabase_vault with schema vault;

-- Execute UMA VEZ, substituindo os valores:
-- select vault.create_secret('https://SEU-PROJETO.supabase.co', 'viva_mais_project_url');
-- select vault.create_secret('SEU_CRON_SECRET_FORTE', 'viva_mais_cron_secret');

-- Remove agendamento anterior com o mesmo nome, se existir.
select cron.unschedule(jobid)
from cron.job
where jobname = 'viva-mais-hydration-email';

select cron.schedule(
  'viva-mais-hydration-email',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'viva_mais_project_url') || '/functions/v1/send-hydration-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'viva_mais_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);
