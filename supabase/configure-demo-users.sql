-- Execute DEPOIS de criar os quatro usuários em Authentication > Users.
-- Este SQL configura perfis/roles/setores, mas NÃO altera senhas.
-- Para recriar/confirmar os 4 usuários e redefinir a senha do MVP automaticamente,
-- use: npm run setup:demo-users (com .env.admin contendo a service_role).

select public.sync_existing_auth_users();

update public.profiles p set full_name='Servidor(a) Demo',role='worker',sector='Administrativo',active=true,organization_id='00000000-0000-0000-0000-000000000001',unit_id='10000000-0000-0000-0000-000000000001'
from auth.users u where p.id=u.id and lower(u.email)='trabalhador.demo@vivamais.com';

update public.profiles p set full_name='Profissional Responsável Demo',role='professional',sector='NAS',active=true,organization_id='00000000-0000-0000-0000-000000000001',unit_id='10000000-0000-0000-0000-000000000002'
from auth.users u where p.id=u.id and lower(u.email)='profissional.demo@vivamais.com';

update public.profiles p set full_name='Gestão Demo',role='manager',sector='Gestão',active=true,organization_id='00000000-0000-0000-0000-000000000001',unit_id='10000000-0000-0000-0000-000000000001'
from auth.users u where p.id=u.id and lower(u.email)='gestao.demo@vivamais.com';

update public.profiles p set full_name='Administrador Viva Mais',role='admin',sector='TI',active=true,organization_id='00000000-0000-0000-0000-000000000001',unit_id='10000000-0000-0000-0000-000000000003'
from auth.users u where p.id=u.id and lower(u.email)='admin.demo@vivamais.com';

update public.services s set professional_id=u.id,professional_name='Profissional Responsável Demo'
from auth.users u where lower(u.email)='profissional.demo@vivamais.com'
and s.id in ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003');

select u.email,p.full_name,p.role,p.sector,p.active,un.name as unidade,u.email_confirmed_at
from public.profiles p join auth.users u on u.id=p.id left join public.units un on un.id=p.unit_id
where lower(u.email) in ('trabalhador.demo@vivamais.com','profissional.demo@vivamais.com','gestao.demo@vivamais.com','admin.demo@vivamais.com')
order by p.role;
