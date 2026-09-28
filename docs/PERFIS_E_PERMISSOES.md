# Perfis e permissões — Viva Mais MVP v3

O Termo de Abertura validado define quatro perfis: trabalhador, profissional responsável, gestor e administrador. A v3 implementa os quatro.

## Trabalhador
- visualizar serviços e horários;
- realizar, cancelar e acompanhar agendamentos;
- acessar conteúdos e campanhas;
- registrar check-in de bem-estar;
- consultar o próprio histórico;
- registrar uma justificativa categorizada para ausência, sem texto livre no MVP.

## Profissional responsável
- visualizar somente os serviços sob sua responsabilidade;
- cadastrar uma nova atividade vinculada ao próprio perfil;
- cadastrar data, horário, local e quantidade de vagas;
- abrir/fechar horários;
- visualizar participantes de seus próprios horários;
- registrar presença ou não comparecimento;
- visualizar a categoria de justificativa de ausência dos participantes de seus próprios horários.

A possibilidade de visualizar justificativas não aparece literalmente no Termo de Abertura original. Ela foi adicionada nesta v3 por solicitação do responsável pelo MVP. Para reduzir exposição de dado sensível, a justificativa é categorizada e não possui campo de texto livre.

## Gestor
- visualizar apenas indicadores consolidados;
- escolher período de análise;
- consultar adesão, presença, conteúdos, campanhas e média agregada de bem-estar;
- não acessar respostas individuais de bem-estar, justificativas ou dados clínicos.

## Administrador
- visualizar os perfis da organização;
- alterar o papel de acesso por RPC protegida;
- gerenciar serviços, horários, conteúdos e campanhas;
- atuar na configuração operacional da plataforma.

## Regra de menor privilégio
O usuário não recebe acesso por ser “interno”. O acesso é concedido conforme o papel e, no caso do profissional, conforme a responsabilidade sobre o serviço.
