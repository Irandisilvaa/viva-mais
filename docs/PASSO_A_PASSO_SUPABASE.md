# Supabase — Viva Mais MVP v5

## Se você já está usando a v4

**Não rode `schema.sql` novamente.** Execute somente:

1. `SQL Editor` → `New query`;
2. abra `supabase/migration_v4_to_v5.sql`;
3. copie todo o arquivo;
4. clique em `Run`.

Essa migration adiciona as RPCs de inscrição idempotente e de check-in diário sem apagar dados existentes.

## Se você ainda está na v3

Execute primeiro:

1. `supabase/migration_v3_to_v4.sql`;
2. depois `supabase/migration_v4_to_v5.sql`.

## Se estiver criando o banco do zero

Execute nesta ordem:

1. `supabase/schema.sql`;
2. `supabase/seed.sql`;
3. crie os quatro usuários em `Authentication > Users`;
4. execute `supabase/configure-demo-users.sql`.

## Usuários do MVP

- `trabalhador.demo@vivamais.com`
- `profissional.demo@vivamais.com`
- `gestao.demo@vivamais.com`
- `admin.demo@vivamais.com`

Senha sugerida somente para a apresentação:

`VivaMais@2026!`

Defina manualmente a senha em `Authentication > Users` e marque/garanta `Auto Confirm User`.

## Quando o login retornar HTTP 400

Rode:

`supabase/diagnostico_auth.sql`

Confira:

- `email_confirmed_at` preenchido;
- `banned_until` nulo;
- `active = true`;
- papel correto em `profiles`.

Se o e-mail já estiver confirmado e o login continuar falhando, redefina a senha pelo Dashboard. O Supabase não permite consultar a senha atual.

## Validar perfis

```sql
select u.email, p.full_name, p.role, un.name as unidade
from public.profiles p
join auth.users u on u.id = p.id
left join public.units un on un.id = p.unit_id
order by p.role;
```

## Validar inscrições

```sql
select b.id, u.email, s.title, sl.starts_at, b.status
from public.bookings b
join auth.users u on u.id=b.user_id
join public.service_slots sl on sl.id=b.slot_id
join public.services s on s.id=sl.service_id
order by b.created_at desc;
```

## Validar check-ins

```sql
select u.email, w.occurred_on, w.mood, w.energy, w.stress, w.privacy_notice_acknowledged_at
from public.wellbeing_checkins w
join auth.users u on u.id=w.user_id
order by w.occurred_on desc;
```

## Chaves do aplicativo

No Supabase use `Connect > Framework` ou `Project Settings > API Keys`.

Use somente:

- Project URL;
- Publishable key (`sb_publishable_...`).

Nunca use no cliente:

- `postgresql://...`;
- senha do banco;
- `service_role`;
- `sb_secret_...`.

`.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

Depois reinicie com cache limpo:

```bash
npx expo start --web -c
```

## Hidratação

A tabela continua sendo:

```sql
select * from public.hydration_preferences;
```

Para o fluxo de e-mail leia `docs/HIDRATACAO_E_NOTIFICACOES.md`.
