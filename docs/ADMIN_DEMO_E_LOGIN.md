# Admin demo e erro 400 no login

O erro HTTP 400 em `/auth/v1/token?grant_type=password` normalmente acontece antes do carregamento do perfil: o Auth não aceitou o e-mail/senha ou o usuário pertence a outro projeto Supabase.

## Regra principal
O `EXPO_PUBLIC_SUPABASE_URL` do `.env` e a secret/service role usada no script de configuração precisam pertencer ao MESMO projeto Supabase.

Confira:

```bash
grep '^EXPO_PUBLIC_SUPABASE_URL=' .env
```

## Forma recomendada na v6

```bash
cp .env.admin.example .env.admin
```

Cole em `.env.admin` a secret/service role do MESMO projeto do `.env` e execute:

```bash
npm run setup:demo-users
```

O script:
- cria o usuário se estiver ausente;
- confirma o e-mail;
- redefine a senha;
- ativa o perfil;
- aplica o role correto;
- define unidade e setor;
- vincula os serviços demonstrativos ao profissional.

## Admin esperado

```text
E-mail: admin.demo@vivamais.com
Senha: VivaMais@2026!
Role: admin
Setor: TI
Unidade: Tecnologia da Informação
```

Se `DEMO_PASSWORD` for alterada em `.env.admin`, use a nova senha.

## Segurança
Nunca copie secret/service_role para `.env` do Expo, Vercel frontend ou variável `EXPO_PUBLIC_*`. Apague `.env.admin` após a configuração se não precisar mais dele.
