-- Execute DEPOIS de criar os quatro usuarios no Authentication > Users.
-- Ajuste os e-mails abaixo se voce usar outros enderecos.

select public.sync_existing_auth_users();

update public.profiles p set role='worker', organization_id='00000000-0000-0000-0000-000000000001', unit_id='10000000-0000-0000-0000-000000000001'
from auth.users u where p.id=u.id and u.email='trabalhador.demo@vivamais.com';

update public.profiles p set role='professional', organization_id='00000000-0000-0000-0000-000000000001', unit_id='10000000-0000-0000-0000-000000000002'
from auth.users u where p.id=u.id and u.email='profissional.demo@vivamais.com';

update public.profiles p set role='manager', organization_id='00000000-0000-0000-0000-000000000001', unit_id='10000000-0000-0000-0000-000000000001'
from auth.users u where p.id=u.id and u.email='gestao.demo@vivamais.com';

update public.profiles p set role='admin', organization_id='00000000-0000-0000-0000-000000000001', unit_id='10000000-0000-0000-0000-000000000003'
from auth.users u where p.id=u.id and u.email='admin.demo@vivamais.com';

-- Vincula os servicos demonstrativos ao profissional responsavel.
update public.services s
set professional_id=u.id, professional_name=coalesce(nullif(p.full_name,''),'Profissional responsável')
from auth.users u join public.profiles p on p.id=u.id
where u.email='profissional.demo@vivamais.com'
  and s.id in (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003'
  );

select u.email,p.full_name,p.role,un.name as unidade
from public.profiles p
join auth.users u on u.id=p.id
left join public.units un on un.id=p.unit_id
where u.email in (
 'trabalhador.demo@vivamais.com',
 'profissional.demo@vivamais.com',
 'gestao.demo@vivamais.com',
 'admin.demo@vivamais.com'
)
order by p.role;
