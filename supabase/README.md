# Supabase — Viva Mais MVP v6

## Se você já está na v5
Execute somente:

1. `supabase/migration_v5_to_v6.sql`
2. depois, se quiser corrigir/criar os quatro acessos demo automaticamente, use `npm run setup:demo-users`.

Não rode `schema.sql` novamente em uma instalação v5 existente.

## Se você está na v4
Execute:

1. `migration_v4_to_v5.sql`
2. `migration_v5_to_v6.sql`

## Se você está na v3
Execute:

1. `migration_v3_to_v4.sql`
2. `migration_v4_to_v5.sql`
3. `migration_v5_to_v6.sql`

## Instalação limpa
Execute:

1. `schema.sql`
2. `seed.sql`
3. configure os quatro usuários demo com `npm run setup:demo-users` OU crie-os manualmente e rode `configure-demo-users.sql`.

## Hidratação
- `functions/send-hydration-reminders/index.ts`: Edge Function opcional para e-mail;
- `cron_hydration.sql`: agendamento opcional do envio.

## v6
A migration v6 adiciona setor no perfil, publicação educativa por profissional, mídia complementar, bucket de imagens e painel gerencial filtrável.
