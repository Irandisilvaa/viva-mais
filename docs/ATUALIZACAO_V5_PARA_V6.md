# Atualização da v5 para a v6

## 1. Banco de dados
No Supabase > SQL Editor, execute todo o arquivo:

`supabase/migration_v5_to_v6.sql`

Ele preserva os dados existentes e adiciona:
- `profiles.sector`;
- `contents.external_url`;
- `contents.media_url`;
- `contents.created_by`;
- políticas para publicação de conteúdo pelo profissional;
- bucket `viva-mais-media`;
- filtros/indicadores gerenciais agregados.

Não rode `schema.sql` se você já está na v5.

## 2. Dependências
Na raiz do projeto:

```bash
npm install
npx expo install --fix
```

A v6 usa `expo-image-picker` para importar imagens.

## 3. Corrigir/criar os quatro usuários demo
Copie:

```bash
cp .env.admin.example .env.admin
```

No Supabase, copie a `service_role`/secret key SOMENTE para `.env.admin`:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_service_role
DEMO_PASSWORD=VivaMais@2026!
```

Depois:

```bash
npm run setup:demo-users
```

O script cria ou atualiza:
- trabalhador.demo@vivamais.com
- profissional.demo@vivamais.com
- gestao.demo@vivamais.com
- admin.demo@vivamais.com

Todos recebem a senha definida em `DEMO_PASSWORD`, e o script confirma os e-mails e aplica os roles corretos.

Depois de usar, você pode apagar `.env.admin`.

## 4. Teste

```bash
npm run typecheck
npx expo start --web -c
```

No celular:

```bash
npx expo start -c
```

## 5. Checklist v6
1. Trabalhador: login, inscrição, check-in e hidratação.
2. Hidratação: salvar e confirmar o feedback inline.
3. Profissional: criar atividade com imagem sugerida.
4. Profissional: importar imagem e criar atividade.
5. Profissional: publicar conteúdo educativo com link/mídia.
6. Gestão: alternar período, unidade e setor.
7. Admin: login e gestão de usuários/conteúdos.
