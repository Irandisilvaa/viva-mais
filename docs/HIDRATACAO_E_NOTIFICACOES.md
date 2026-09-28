# Hidratação e notificações — Viva Mais MVP v4

## O que foi implementado

A área de Bem-estar agora permite que cada trabalhador configure:

- meta diária de água em ml;
- quantidade padrão por registro (ex.: 250 ml);
- início e fim da rotina;
- intervalo dos lembretes;
- canal de lembrete: aplicativo, e-mail, ambos ou desativado;
- e-mail para lembretes.

O progresso diário de consumo (`Bebi X ml`) fica no **dispositivo**, via AsyncStorage. Ele não é salvo no Supabase e não gera histórico longitudinal no MVP. No banco ficam somente a meta, a rotina e as preferências de notificação.

## Notificação no aplicativo

O projeto usa `expo-notifications` para notificações locais recorrentes.

No celular:

1. abra a área `Bem-estar`;
2. configure a meta e os horários;
3. selecione `No aplicativo` ou `Aplicativo + e-mail`;
4. toque em `Salvar meta e lembretes`;
5. autorize as notificações do sistema operacional.

As notificações locais funcionam no Expo Go. Push remoto não é necessário para este MVP.

Na Web, a preferência é salva, mas o agendamento de notificação local deve ser feito pelo celular.

## E-mail — arquitetura

O envio por e-mail é opcional e está pronto no repositório por meio de:

- `supabase/functions/send-hydration-reminders/index.ts`
- `supabase/cron_hydration.sql`

A função consulta apenas usuários que escolheram `email` ou `both` e envia o lembrete conforme a rotina salva.

### Pré-requisito

Você precisa de um provedor de e-mail. O exemplo está preparado para **Resend**.

Crie uma API key no Resend e, para uso real, verifique o domínio remetente.

## Publicar a Edge Function

Instale e autentique o Supabase CLI, vincule o projeto e então execute:

```bash
supabase functions deploy send-hydration-reminders --no-verify-jwt
```

Defina os secrets:

```bash
supabase secrets set RESEND_API_KEY="SUA_CHAVE_RESEND"
supabase secrets set CRON_SECRET="UM_SEGREDO_GRANDE_E_ALEATORIO"
supabase secrets set HYDRATION_FROM_EMAIL="Viva Mais <saude@seudominio.com.br>"
```

Para teste inicial com Resend, ajuste o remetente conforme as regras da sua conta.

## Agendar a função

No SQL Editor, abra `supabase/cron_hydration.sql`.

Antes de executar, crie no Vault os dois valores indicados no próprio arquivo:

- URL do projeto;
- o mesmo `CRON_SECRET` definido na Edge Function.

O cron executa a cada 5 minutos, mas a função só envia e-mails quando o horário do usuário estiver dentro da janela configurada.

## LGPD / minimização

- e-mail é usado somente para o lembrete solicitado pelo próprio usuário;
- o usuário pode desativar o canal a qualquer momento;
- a meta e a rotina não são expostas ao painel da gestão;
- o progresso diário de água não é salvo no banco;
- não há histórico longitudinal de ingestão no MVP.
