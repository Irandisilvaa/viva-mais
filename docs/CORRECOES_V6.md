# Viva Mais MVP v6 — alterações

## Hidratação
Após salvar meta/rotina, a tela exibe feedback persistente na própria interface: “Configuração salva com sucesso”, resumo da meta, horário e canal. O botão também passa a indicar “Configuração salva”.

## Imagens de atividades
O profissional escolhe uma imagem sugerida por categoria OU importa uma foto do próprio dispositivo. A imagem importada é enviada ao bucket público `viva-mais-media` no Supabase Storage. Não há escolha aleatória.

## Conteúdo educativo pelo profissional
Novo menu `Profissional > Conteúdos educativos`.
O profissional pode publicar:
- título;
- resumo;
- descrição/conteúdo;
- categoria;
- formato;
- tempo estimado;
- link externo opcional;
- link de mídia complementar opcional;
- foto de capa sugerida ou importada.

RLS limita criação/edição do profissional aos próprios conteúdos e à própria organização. O administrador mantém gestão global.

## Gestão
O painel ganhou:
- filtros por 7/30/90/365 dias;
- filtro por unidade;
- filtro por setor;
- trabalhadores ativos;
- taxa de presença e ausência;
- quantidade de unidades e setores;
- gráficos de trabalhadores por setor;
- agendamentos por setor;
- presença por setor;
- procura por categoria;
- check-ins agregados com limiar mínimo.

Nenhum nome ou resposta individual de bem-estar é devolvido pela RPC gerencial.

## Admin demo / autenticação
A v6 inclui `scripts/setup-demo-users.mjs`. Ele usa a Admin API do Supabase para criar ou atualizar os quatro usuários, confirmar e-mails, redefinir a senha de apresentação e sincronizar os perfis/roles.

A `service_role` deve existir apenas em `.env.admin`, que está no `.gitignore`. Nunca use a service_role em `EXPO_PUBLIC_*`.

## Typecheck
Também foram corrigidos os problemas já encontrados na v5:
- `StyleSheet.absoluteFillObject` -> `StyleSheet.absoluteFill`;
- validação de perfil nulo ao criar campanha;
- `baseUrl` removido do tsconfig;
- `supabase/functions` excluído do typecheck Expo, pois Edge Functions usam Deno.
