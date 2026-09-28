# Inventário de dados — MVP v6

O desenho segue minimização de dados: coletar apenas o necessário para a função do MVP.

| Grupo | Dados | Finalidade | Visibilidade |
|---|---|---|---|
| Auth | e-mail, credencial | autenticação | Supabase Auth |
| Perfil | nome, organização, unidade, setor, papel | controle de acesso, filtros agregados e identificação operacional | titular; admin para administração; gestor somente via agregados |
| Serviço | título, descrição, categoria, duração, responsável, local | catálogo de atividades | usuários autenticados da organização |
| Horário | início, fim, vagas, local, status | agenda e capacidade | usuários autenticados |
| Agendamento | usuário, horário, status | reserva e presença | titular; profissional responsável; admin |
| Justificativa | categoria sem texto livre | justificar ausência | titular; profissional do atendimento; admin; nunca gestor |
| Conteúdo | título, resumo, texto, categoria, formato, duração, capa, links/mídia complementares, criador | educação em saúde | usuários autenticados; profissional edita apenas o próprio; admin gerencia globalmente |
| Check-in | humor, energia, estresse 1–5 | acompanhamento individual e indicador agregado | somente titular na tabela; gestor via RPC agregada |
| Hidratação — preferências | meta diária, porção, início/fim da rotina, intervalo, canal, e-mail opcional, fuso | lembretes configurados pelo titular | somente titular; automação de e-mail via service role |
| Hidratação — progresso do dia | total de ml registrado no dia | mostrar progresso diário | somente no dispositivo via AsyncStorage; não vai ao Supabase |
| Campanha | título, período, participação | engajamento | catálogo; participação do titular |

## Não coletar no MVP

- peso;
- altura;
- IMC;
- dieta individual;
- diagnóstico;
- sintomas em texto livre;
- prontuário;
- anamnese;
- chat clínico;
- justificativa de ausência em texto livre;
- histórico longitudinal de consumo de água.

## Decisão de privacidade para hidratação

A v6 mantém meta e lembretes porque o próprio usuário solicitou/configurou a funcionalidade. O banco guarda somente a preferência necessária para entregar o lembrete. O botão `Bebi X ml` atualiza um total diário local no dispositivo e não cria uma série histórica centralizada.

Se o usuário escolher e-mail, o endereço é armazenado na tabela de preferências apenas enquanto esse canal estiver selecionado. Ao escolher somente `app` ou `off`, o e-mail é removido dessa tabela; o e-mail de autenticação continua administrado pelo Supabase Auth.

## Pontos para implantação real

Antes de usar dados reais, a SES-SE deve definir formalmente finalidade, base legal, retenção, descarte, responsáveis pelo tratamento, aviso de privacidade e procedimento de atendimento aos direitos dos titulares. O código do MVP não substitui análise jurídica, de segurança ou de proteção de dados.
