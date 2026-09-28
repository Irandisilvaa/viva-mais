# Correções do Viva Mais MVP v5

## 1. Login HTTP 400

A v5 mantém uma única instância do cliente Supabase durante HMR/Hot Reload para evitar o aviso `Multiple GoTrueClient instances`.

O HTTP 400 em `/auth/v1/token?grant_type=password` é um erro de autenticação. Rode `supabase/diagnostico_auth.sql` e confira:

- usuário existe;
- `email_confirmed_at` está preenchido;
- usuário não está bloqueado;
- perfil existe e possui o papel correto.

Se o e-mail estiver confirmado e o login continuar retornando credenciais inválidas, redefina a senha em `Authentication > Users`.

## 2. Inscrição em atividade e HTTP 409

A v5 não insere mais o agendamento diretamente pelo cliente. A função `create_booking()` no banco torna a inscrição idempotente.

Se o trabalhador clicar duas vezes no mesmo horário, o banco retorna a inscrição já existente em vez de gerar uma violação de unicidade `23505 / HTTP 409`.

O fluxo agora é:

`atividade > horário > formulário de inscrição > confirmação > agendamento`

## 3. Check-in de bem-estar

A v5 usa a função `save_wellbeing_checkin()` no banco. O check-in do mesmo dia é atualizado, não duplicado.

Ao abrir a tela, o app carrega o check-in de hoje. Depois do salvamento, aparece a confirmação `Check-in de hoje salvo` com horário da última atualização.

## 4. Imagens das atividades

As imagens não são aleatórias. O profissional escolhe uma foto de uma galeria coerente com a categoria da atividade:

- Nutrição;
- Atividade física;
- Bem-estar;
- Ergonomia;
- Saúde mental.

Se o profissional não escolher uma foto, há uma regra determinística baseada na categoria e no título.
