-- Viva Mais MVP v6 - dados demonstrativos. Nao use dados reais de trabalhadores.

insert into public.organizations (id,name,slug) values
('00000000-0000-0000-0000-000000000001','Secretaria de Estado da Saúde de Sergipe','ses-se')
on conflict (slug) do update set name=excluded.name;

insert into public.units (id,organization_id,name) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Administração Central'),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Núcleo de Atenção ao Servidor'),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Tecnologia da Informação')
on conflict (organization_id,name) do nothing;

-- Garante perfil para usuarios que ja existiam no Auth antes deste schema.
select public.sync_existing_auth_users();

insert into public.services (id,organization_id,title,category,description,duration_minutes,professional_name,location,image_url,active) values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Consulta de orientação nutricional','nutrition','Atendimento de orientação alimentar voltado à promoção da saúde no trabalho.',30,'Equipe de Nutrição','Sala do NAS','https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80',true),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Ginástica laboral','physical_activity','Sessão breve de mobilidade e alongamento realizada no ambiente de trabalho.',15,'Equipe de Educação Física','Bloco Administrativo','https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',true),
('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Orientação postural','ergonomics','Orientação educativa sobre postura, pausas e organização do posto de trabalho.',25,'Equipe de Saúde do Trabalhador','Sala Multiuso','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82',true)
on conflict (id) do update set title=excluded.title,description=excluded.description,active=true;

insert into public.service_slots (id,service_id,starts_at,ends_at,capacity,location,status) values
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',date_trunc('day',now())+interval '1 day 14 hours',date_trunc('day',now())+interval '1 day 14 hours 30 minutes',6,'Sala do NAS','open'),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',date_trunc('day',now())+interval '2 day 8 hours 30 minutes',date_trunc('day',now())+interval '2 day 8 hours 45 minutes',20,'Bloco Administrativo','open'),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002',date_trunc('day',now())+interval '3 day 10 hours',date_trunc('day',now())+interval '3 day 10 hours 15 minutes',20,'Bloco Administrativo','open'),
('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000003',date_trunc('day',now())+interval '4 day 15 hours',date_trunc('day',now())+interval '4 day 15 hours 25 minutes',8,'Sala Multiuso','open')
on conflict (id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,capacity=excluded.capacity,status='open';

insert into public.contents (id,organization_id,title,excerpt,body,category,format,duration_minutes,image_url,official_guide,source_label,source_url,published,published_at) values
('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Meu Prato no trabalho','Uma referência visual simples para organizar refeições sem contar calorias.','Priorize alimentos in natura ou minimamente processados, varie os grupos alimentares e adapte as escolhas à sua rotina. Esta tela é educativa e não substitui orientação individual de profissional habilitado.','nutrition','guide',4,'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80',true,'Baseado no Guia Alimentar para a População Brasileira','https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-a-saude/guia_alimentar_populacao_brasileira_2ed.pdf',true,now()),
('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Marmita prática para um dia corrido','Combinações e substituições para organizar a refeição no expediente.','Combine uma base, uma leguminosa, uma fonte de proteína e vegetais. A proposta é facilitar escolhas, não prescrever dieta.','nutrition','recipe',3,'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80',true,'Conteúdo educativo',null,true,now()),
('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Pausa ativa: 5 minutos para se movimentar','Uma sequência breve para interromper longos períodos sentado.','Faça movimentos leves de mobilidade respeitando seus limites. Em caso de dor ou restrição individual, procure orientação profissional.','movement','article',5,'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',false,'Equipe de Educação Física',null,true,now()),
('40000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Alimentação, pausa e estresse no trabalho','Pequenas decisões que podem tornar a rotina mais previsível.','Antecipar uma refeição, fazer pausas possíveis e manter água por perto pode ajudar a organizar a rotina. O foco é promoção da saúde e educação.','wellbeing','article',4,'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=1400&q=80',false,'Conteúdo interdisciplinar',null,true,now())
on conflict (id) do update set title=excluded.title,body=excluded.body,published=true;

insert into public.campaigns (id,organization_id,title,description,starts_at,ends_at,image_url,cta_label,active) values
('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Semana da Pausa Ativa','Reserve alguns minutos do expediente para movimentar o corpo e conhecer as ações do NAS.',now()-interval '1 day',now()+interval '7 day','https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80','Ver atividades',true)
on conflict (id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,active=true;
