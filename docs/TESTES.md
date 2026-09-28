# Checklist de testes — Viva Mais MVP v4

## 1. Landing page

- abrir `/` sem login;
- confirmar que aparece apresentação do Viva Mais e botão `Entrar`;
- confirmar que nenhuma conta é aberta automaticamente;
- testar em 390, 768, 1366 e 1920 px;
- se já houver sessão, confirmar que `Minha área` aparece e `Trocar usuário` continua disponível.

## 2. Autenticação

Testar os quatro usuários:

- trabalhador;
- profissional;
- gestão;
- administrador.

Após login, cada conta deve abrir o portal correto.

## 3. Trabalhador

- listar serviços;
- abrir serviço;
- agendar horário;
- cancelar/reagendar conforme fluxo disponível;
- acessar conteúdos;
- registrar check-in;
- abrir perfil/histórico;
- justificar ausência categorizada.

## 4. Bem-estar / hidratação

- conferir se as escalas 1–5 ocupam corretamente a largura do card;
- salvar check-in após aceitar aviso;
- definir meta de hidratação;
- definir porção por registro;
- configurar início/fim da rotina;
- configurar intervalo;
- selecionar canal app/e-mail/ambos/off;
- salvar preferências;
- no celular, aceitar permissão e conferir notificações agendadas;
- tocar `Bebi X ml` e conferir barra de progresso;
- recarregar a tela no mesmo dia e confirmar o progresso local;
- confirmar que `hydration_preferences` recebe somente preferências, não registros de consumo.

## 5. Profissional

- criar atividade;
- criar horário;
- definir vagas;
- fechar/reabrir horário;
- abrir lista de participantes;
- registrar presença/não comparecimento;
- ver justificativa categorizada.

## 6. Gestão

- conferir que o painel exibe apenas agregados;
- alternar períodos;
- confirmar que não há nomes de trabalhadores, e-mails, check-ins individuais ou preferências de hidratação.

## 7. Administrador

- listar usuários;
- alterar papel por RPC;
- publicar conteúdo;
- criar campanha.

## 8. Web responsivo

Testar:

- 390 px;
- 768 px;
- 1366 px;
- 1920 px.

Verificar especialmente cards, botões animados, escalas de bem-estar e formulário de hidratação.

## 9. Qualidade

```bash
npm run typecheck
npm run doctor
npm run export:web
```

## 10. E-mail opcional

Depois de publicar a Edge Function e ativar Cron:

- selecionar `Por e-mail`;
- usar um e-mail de teste permitido pelo provedor;
- configurar um horário próximo;
- verificar logs da Edge Function;
- verificar recebimento;
- desativar o canal e confirmar que não há novos envios.
