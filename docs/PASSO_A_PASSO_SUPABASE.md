# Supabase — Viva Mais MVP v6

## Atualizar da v5
No SQL Editor execute todo o arquivo:

`supabase/migration_v5_to_v6.sql`

Ele preserva usuários e dados existentes.

## Instalação limpa
Execute:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. configure os quatro usuários demo.

## Configurar os quatro usuários demo automaticamente
Crie o arquivo local:

```bash
cp .env.admin.example .env.admin
```

Preencha:

```env
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE
DEMO_PASSWORD=VivaMais@2026!
```

Depois:

```bash
npm run setup:demo-users
```

O script cria ou atualiza os quatro usuários, confirma os e-mails, redefine a senha e sincroniza role/unidade/setor. `.env.admin` é ignorado pelo Git.

## Usuários do MVP
- `trabalhador.demo@vivamais.com`
- `profissional.demo@vivamais.com`
- `gestao.demo@vivamais.com`
- `admin.demo@vivamais.com`

Senha sugerida: `VivaMais@2026!`

## Quando o login retornar HTTP 400
Primeiro confirme que o `.env` aponta para o MESMO projeto Supabase onde os usuários foram criados.

Rode:

`supabase/diagnostico_auth.sql`

Confira `email_confirmed_at`, `banned_until`, `role`, `active` e `sector`.

Se quiser eliminar dúvida de senha/e-mail confirmado, rode novamente `npm run setup:demo-users`.

## .env do aplicativo

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

Nunca exponha `service_role`, `sb_secret_...`, senha do banco ou connection string no app.

Depois:

```bash
npx expo start --web -c
```

## Validar perfis

```sql
select u.email,p.full_name,p.role,p.sector,p.active,un.name as unidade
from public.profiles p
join auth.users u on u.id=p.id
left join public.units un on un.id=p.unit_id
order by p.role;
```

## Validar imagens importadas
No Dashboard do Supabase veja `Storage > viva-mais-media`.

## Validar conteúdos do profissional

```sql
select c.title,c.category,c.format,c.created_by,c.external_url,c.media_url,c.published
from public.contents c
order by c.created_at desc;
```

## Validar painel gerencial
Faça login como gestão e teste filtros por período, unidade e setor. A RPC gerencial retorna somente dados agregados.
