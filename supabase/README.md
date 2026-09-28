# Supabase — Viva Mais MVP v4

## Atualização de uma instalação v3

Execute apenas:

1. `migration_v3_to_v4.sql`

Não é necessário recriar usuários nem apagar dados.

## Instalação limpa

Execute:

1. `schema.sql`
2. `seed.sql`
3. crie os quatro usuários em Authentication > Users
4. `configure-demo-users.sql`

## Hidratação

- `migration_v3_to_v4.sql`: adiciona preferências de hidratação sem reset do banco;
- `functions/send-hydration-reminders/index.ts`: Edge Function opcional para e-mail;
- `cron_hydration.sql`: cron opcional que chama a função a cada 5 minutos.

Leia `docs/HIDRATACAO_E_NOTIFICACOES.md`.
