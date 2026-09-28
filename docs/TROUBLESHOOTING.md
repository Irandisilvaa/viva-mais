# Solução de problemas

## 401 / Invalid API key
O problema é a chave do projeto, não a senha do usuário.

Use:

```env
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Depois:

```bash
npx expo start -c
```

## Invalid login credentials
A API key já está funcionando. Confira e-mail e senha em Authentication > Users.

## Perfil não encontrado
Execute, nesta ordem:
1. `schema.sql`
2. `seed.sql`
3. crie os quatro usuários
4. `configure-demo-users.sql`

## relation public.profiles does not exist
O schema ainda não foi executado.

## Usuário abre a tela errada
Confira:

```sql
select u.email,p.role from public.profiles p join auth.users u on u.id=p.id;
```

## Expo ainda carrega variável antiga
Pare com `Ctrl+C` e execute:

```bash
npx expo start -c
```

## Web quebrando em largura menor
Teste a v3. O layout usa max-width, flex-wrap e breakpoints. Se ainda houver um caso específico, registre a largura exata e a tela.
