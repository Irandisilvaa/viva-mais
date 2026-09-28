# Viva Mais MVP v6

MVP universal em Expo/React Native Web + Supabase com quatro perfis: trabalhador, profissional responsável, gestão e administrador.

## O que a v6 adiciona

- feedback visual claro ao salvar configuração de hidratação;
- escolha manual OU importação de imagem em atividades;
- profissional responsável também publica atividades/conteúdos educativos;
- conteúdos aceitam texto, links, mídia complementar e foto de capa;
- painel gerencial com filtros por período, unidade e setor e novos gráficos agregados;
- script local para criar/corrigir os quatro usuários demo e redefinir as senhas;
- correções do typecheck da v5.

## Atualizando a partir da v5

No Supabase execute:

```text
supabase/migration_v5_to_v6.sql
```

Depois, na pasta do projeto:

```bash
npm install
npx expo install --fix
npm run typecheck
npx expo start --web -c
```

Detalhes: `docs/ATUALIZACAO_V5_PARA_V6.md`.

## Instalação nova

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql`.
3. Execute `supabase/seed.sql`.
4. Configure `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

5. Instale:

```bash
npm install
npx expo install --fix
```

6. Configure os usuários demo usando `npm run setup:demo-users` ou crie-os manualmente e execute `supabase/configure-demo-users.sql`.

## Corrigir os quatro usuários demo de uma vez

A forma mais confiável para evitar `400 Bad Request` por usuário ausente, e-mail não confirmado ou senha desconhecida é o script local da v6.

```bash
cp .env.admin.example .env.admin
```

Preencha **somente** com a credencial administrativa do MESMO projeto apontado por `EXPO_PUBLIC_SUPABASE_URL`:

```env
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE
# ou SUPABASE_SECRET_KEY=sb_secret_...
DEMO_PASSWORD=VivaMais@2026!
```

E execute:

```bash
npm run setup:demo-users
```

A `service_role` não vai para o app: `.env.admin` está no `.gitignore`. Nunca coloque secret/service_role em variável `EXPO_PUBLIC_*`.

### Acessos de apresentação

| Perfil | E-mail | Senha sugerida |
|---|---|---|
| Trabalhador | `trabalhador.demo@vivamais.com` | `VivaMais@2026!` |
| Profissional | `profissional.demo@vivamais.com` | `VivaMais@2026!` |
| Gestão | `gestao.demo@vivamais.com` | `VivaMais@2026!` |
| Administrador | `admin.demo@vivamais.com` | `VivaMais@2026!` |

A lista também fica em `.local/ACESSOS_DEMO.txt`, ignorada pelo Git.

## Perfis

**Trabalhador:** agenda, histórico, conteúdos, check-in, justificativa de ausência e hidratação.

**Profissional responsável:** cria atividades, escolhe/importa imagem, abre horários/vagas, controla presença e publica conteúdo educativo.

**Gestão:** visualiza apenas indicadores agregados e pode filtrar por período, unidade e setor.

**Administrador:** gerencia usuários/perfis e publicação institucional global.

## Imagens

A v6 usa `expo-image-picker`. Profissional/admin pode selecionar uma imagem sugerida ou importar uma foto. Imagens importadas são salvas no bucket `viva-mais-media`, limitado por RLS aos perfis autorizados.

## Conteúdo educativo

O profissional pode informar título, resumo, texto, categoria, formato, tempo estimado, link externo, mídia complementar e capa. O trabalhador visualiza esses materiais na biblioteca `Informação e Formação`.

## Gestão

O dashboard traz trabalhadores ativos, agendamentos, presença/ausência, acessos a conteúdos, campanhas, quantidade de unidades/setores e gráficos agregados por setor/categoria. O recorte de bem-estar não retorna linhas individuais.

## Estrutura útil

```text
app/profissional/atividades.tsx     atividades + imagem importada
app/profissional/conteudos.tsx      publicação educativa pelo profissional
app/gestao/index.tsx                filtros e gráficos gerenciais
app/(tabs)/bem-estar.tsx            check-in + hidratação
components/CoverImagePicker.tsx     fotos sugeridas/importadas
lib/mediaUpload.ts                  upload para Supabase Storage
scripts/setup-demo-users.mjs        corrige/cria acessos demo
supabase/migration_v5_to_v6.sql     migração incremental
supabase/schema.sql                 instalação limpa
```

## Vercel

Framework preset: `Other`

Build command:

```bash
expo export -p web
```

Output directory:

```text
dist
```

Configure no Vercel as mesmas três variáveis `EXPO_PUBLIC_*` do `.env`. Nunca configure a `SUPABASE_SERVICE_ROLE_KEY` no frontend.
