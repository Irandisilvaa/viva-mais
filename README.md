# Viva Mais MVP v5

MVP universal em **Expo / React Native / Web**, com **Supabase** e deploy web preparado para **Vercel**.

A v5 corrige os problemas encontrados no teste real com Supabase e mantém os quatro perfis do produto.

## Principais correções da v5

- cliente Supabase singleton para evitar múltiplos `GoTrueClient` no Web/HMR;
- diagnóstico de login HTTP 400;
- formulário real de inscrição antes de reservar uma vaga;
- inscrição idempotente via RPC, evitando conflito HTTP 409 por clique/requisição repetida;
- identificação visual de horários em que o trabalhador já está inscrito;
- check-in diário persistido via RPC e carregado novamente ao abrir a tela;
- confirmação visual de que o check-in foi salvo no Supabase;
- seleção manual de imagens por categoria ao cadastrar atividades;
- nenhuma seleção aleatória de foto;
- mantém landing page, hidratação e quatro perfis da v4.

## Perfis

- **Trabalhador**: agendamentos, conteúdos, bem-estar, hidratação, cancelamento e justificativa;
- **Profissional responsável**: atividades, imagens, horários, vagas, agenda, presença e justificativas;
- **Gestão**: indicadores consolidados;
- **Administrador**: usuários/perfis, conteúdos, campanhas e operação.

## 1. Atualizar da v4 para a v5

Se o seu banco já está na v4, **não rode `schema.sql` novamente**.

No Supabase:

`SQL Editor > New query`

execute somente:

```text
supabase/migration_v4_to_v5.sql
```

Essa migration não apaga usuários, senhas, agendamentos ou check-ins existentes.

Para uma instalação totalmente nova, execute nesta ordem:

```text
supabase/schema.sql
supabase/seed.sql
```

Depois crie os quatro usuários em `Authentication > Users` e rode:

```text
supabase/configure-demo-users.sql
```

## 2. Diagnosticar o HTTP 400 no login

Rode:

```text
supabase/diagnostico_auth.sql
```

Confirme que os quatro usuários têm `email_confirmed_at` preenchido e o papel correto.

Se `email_confirmed_at` estiver vazio, confirme/recrie o usuário no Dashboard com **Auto Confirm User**.

Se estiver confirmado e ainda retornar `Invalid login credentials`, redefina a senha no Dashboard. O Supabase não expõe a senha atual.

## 3. Ambiente

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

Não use `service_role`, `sb_secret_...`, senha do banco ou URI `postgresql://...` no app.

## 4. Instalar e executar

```bash
npm install
npx expo install --fix
npx expo start --web -c
```

Mobile:

```bash
npx expo start -c
```

## 5. Novo fluxo de inscrição

O trabalhador não agenda mais com um único clique.

Fluxo:

```text
Agendar
→ selecionar atividade
→ selecionar horário
→ Inscrever-se
→ formulário de inscrição
→ revisar nome, unidade, e-mail, profissional, horário, local e vagas
→ confirmar participação
→ Confirmar inscrição
```

O banco usa `create_booking()` para impedir duplicidade. Se o usuário já estiver inscrito, o app informa `Já inscrito(a)` em vez de gerar HTTP 409.

## 6. Check-in

O check-in usa `save_wellbeing_checkin()` e salva um registro por trabalhador/dia.

Salvar novamente no mesmo dia atualiza o registro existente. Ao reabrir a tela, as notas salvas são carregadas e aparece `Check-in de hoje salvo`.

## 7. Imagens das atividades

Em `Profissional > Atividades e agenda`, o profissional escolhe explicitamente uma das imagens disponíveis para a categoria.

As fotos não são sorteadas aleatoriamente.

## 8. Acessos sugeridos para o MVP

```text
trabalhador.demo@vivamais.com
profissional.demo@vivamais.com
gestao.demo@vivamais.com
admin.demo@vivamais.com
```

Senha sugerida apenas para apresentação local:

```text
VivaMais@2026!
```

Defina essa senha manualmente em `Authentication > Users`. O arquivo `.local/ACESSOS_DEMO.txt` também contém os acessos e está ignorado pelo Git.

## 9. Teste rápido no banco

Agendamentos do trabalhador:

```sql
select b.id, u.email, s.title, sl.starts_at, b.status
from public.bookings b
join auth.users u on u.id=b.user_id
join public.service_slots sl on sl.id=b.slot_id
join public.services s on s.id=sl.service_id
order by b.created_at desc;
```

Check-ins:

```sql
select u.email, w.occurred_on, w.mood, w.energy, w.stress, w.privacy_notice_acknowledged_at
from public.wellbeing_checkins w
join auth.users u on u.id=w.user_id
order by w.occurred_on desc;
```

## 10. Vercel

Framework preset: **Other**

Build:

```bash
npm run export:web
```

Output:

```text
dist
```

Variáveis:

```text
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## 11. Arquivos importantes

```text
app/inscricao/[slotId].tsx       formulário de inscrição
lib/supabase.ts                  singleton do cliente Supabase
lib/serviceImages.ts             galeria determinística de imagens
supabase/migration_v4_to_v5.sql  atualização segura v4 -> v5
supabase/diagnostico_auth.sql     diagnóstico dos quatro logins
docs/CORRECOES_V5.md             resumo técnico das correções
```
