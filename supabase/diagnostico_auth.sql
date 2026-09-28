-- Diagnostico dos quatro usuarios do MVP.
-- Rode no SQL Editor quando o login retornar HTTP 400.

select
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  u.banned_until,
  p.role,
  p.active,
  un.name as unidade
from auth.users u
left join public.profiles p on p.id = u.id
left join public.units un on un.id = p.unit_id
where u.email in (
  'trabalhador.demo@vivamais.com',
  'profissional.demo@vivamais.com',
  'gestao.demo@vivamais.com',
  'admin.demo@vivamais.com'
)
order by u.email;

-- O esperado:
-- email_confirmed_at: preenchido
-- banned_until: nulo
-- role: worker / professional / manager / admin
-- active: true
--
-- Se email_confirmed_at estiver nulo, confirme/recrie o usuario pelo Dashboard
-- em Authentication > Users usando a opcao Auto Confirm User.
-- Nao altere auth.users diretamente para definir senha.
