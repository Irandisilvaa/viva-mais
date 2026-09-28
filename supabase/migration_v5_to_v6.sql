-- Viva Mais MVP v6
-- Execute UMA VEZ em um banco que já está na v5.
-- Preserva auth.users, agendamentos, check-ins, conteúdos e demais dados existentes.

begin;

-- 1) Mais contexto organizacional para indicadores agregados da gestão.
alter table public.profiles add column if not exists sector text;

-- 2) Conteúdos criados por profissional/admin e materiais complementares.
alter table public.contents add column if not exists external_url text;
alter table public.contents add column if not exists media_url text;
alter table public.contents add column if not exists created_by uuid references public.profiles(id) on delete set null;

-- Profissional pode publicar/editar apenas os próprios conteúdos da organização.
drop policy if exists contents_prof_insert on public.contents;
drop policy if exists contents_prof_update on public.contents;
drop policy if exists contents_prof_delete on public.contents;
create policy contents_prof_insert on public.contents for insert to authenticated with check (
  public.current_user_role() = 'professional'
  and organization_id = public.current_user_organization()
  and created_by = auth.uid()
);
create policy contents_prof_update on public.contents for update to authenticated using (
  public.current_user_role() = 'professional'
  and created_by = auth.uid()
  and organization_id = public.current_user_organization()
) with check (
  created_by = auth.uid() and organization_id = public.current_user_organization()
);
create policy contents_prof_delete on public.contents for delete to authenticated using (
  public.current_user_role() = 'professional'
  and created_by = auth.uid()
  and organization_id = public.current_user_organization()
);

-- 3) Bucket para imagens importadas pelo profissional/admin.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('viva-mais-media','viva-mais-media',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists viva_mais_media_insert on storage.objects;
drop policy if exists viva_mais_media_update on storage.objects;
drop policy if exists viva_mais_media_delete on storage.objects;
create policy viva_mais_media_insert on storage.objects for insert to authenticated with check (
  bucket_id='viva-mais-media'
  and public.current_user_role() in ('professional','admin')
  and (storage.foldername(name))[1]=auth.uid()::text
);
create policy viva_mais_media_update on storage.objects for update to authenticated using (
  bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text)
) with check (
  bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text)
);
create policy viva_mais_media_delete on storage.objects for delete to authenticated using (
  bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text)
);

-- 4) Filtros agregados para gestão.
create or replace function public.get_manager_filter_options()
returns jsonb language plpgsql security definer set search_path = public as $$
declare org_id uuid; units_json jsonb; sectors_json jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'Acesso restrito a gestao'; end if;
  org_id := public.current_user_organization();

  select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name) order by u.name),'[]'::jsonb)
    into units_json
  from public.units u
  where u.organization_id=org_id and u.active=true;

  select coalesce(jsonb_agg(sector order by sector),'[]'::jsonb)
    into sectors_json
  from (
    select distinct trim(p.sector) sector
    from public.profiles p
    where p.organization_id=org_id and p.role='worker' and p.active=true
      and nullif(trim(p.sector),'') is not null
  ) q;

  return jsonb_build_object('units',units_json,'sectors',sectors_json);
end; $$;

-- Remove a assinatura antiga da v5 para não deixar duas RPCs com o mesmo nome.
drop function if exists public.get_manager_dashboard(integer);

create or replace function public.get_manager_dashboard(
  p_days integer default 30,
  p_unit_id uuid default null,
  p_sector text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  org_id uuid; total_bookings integer; attended integer; no_show integer; content_views integer;
  campaign_participants integer; wellbeing_responses integer; average_mood numeric;
  active_workers integer; units_count integer; sectors_count integer;
  by_category jsonb; by_sector jsonb; workers_sector jsonb; attendance_sector jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'Acesso restrito a gestao'; end if;
  if p_days not in (7,30,90,365) then p_days := 30; end if;
  org_id := public.current_user_organization();

  select count(*)::integer, count(distinct p.unit_id)::integer, count(distinct nullif(trim(p.sector),''))::integer
  into active_workers, units_count, sectors_count
  from public.profiles p
  where p.organization_id=org_id and p.role='worker' and p.active=true
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select count(*) filter (where b.status <> 'cancelled')::integer,
         count(*) filter (where b.status='attended')::integer,
         count(*) filter (where b.status='no_show')::integer
  into total_bookings, attended, no_show
  from public.bookings b join public.profiles p on p.id=b.user_id
  where p.organization_id=org_id
    and b.created_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select count(*)::integer into content_views
  from public.content_progress cp join public.profiles p on p.id=cp.user_id
  where p.organization_id=org_id and cp.last_accessed_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select count(*)::integer into campaign_participants
  from public.campaign_participations cp join public.profiles p on p.id=cp.user_id
  where p.organization_id=org_id and cp.joined_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select count(*)::integer,
         case when count(*) >= 5 then round(avg(w.mood)::numeric,1) else null end
  into wellbeing_responses, average_mood
  from public.wellbeing_checkins w join public.profiles p on p.id=w.user_id
  where p.organization_id=org_id and w.occurred_on >= current_date - p_days
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb)
  into by_category from (
    select case s.category
      when 'nutrition' then 'Nutrição'
      when 'physical_activity' then 'Movimento'
      when 'ergonomics' then 'Ergonomia'
      when 'mental_health' then 'Saúde mental'
      else 'Bem-estar' end label,
      count(*)::integer value
    from public.bookings b
    join public.service_slots sl on sl.id=b.slot_id
    join public.services s on s.id=sl.service_id
    join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id and b.status <> 'cancelled'
      and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id)
      and (p_sector is null or p.sector=p_sector)
    group by s.category
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb)
  into by_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label, count(*)::integer value
    from public.bookings b join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id and b.status <> 'cancelled'
      and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id)
      and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb)
  into workers_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label, count(*)::integer value
    from public.profiles p
    where p.organization_id=org_id and p.role='worker' and p.active=true
      and (p_unit_id is null or p.unit_id=p_unit_id)
      and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value,'total',total,'attended',attended) order by value desc),'[]'::jsonb)
  into attendance_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label,
      case when count(*) filter (where b.status <> 'cancelled')=0 then 0
      else round((count(*) filter (where b.status='attended')::numeric / count(*) filter (where b.status <> 'cancelled')::numeric)*100)::integer end value,
      count(*) filter (where b.status <> 'cancelled')::integer total,
      count(*) filter (where b.status='attended')::integer attended
    from public.bookings b join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id
      and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id)
      and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  return jsonb_build_object(
    'total_bookings',coalesce(total_bookings,0),
    'attendance_rate',case when coalesce(total_bookings,0)=0 then 0 else round((coalesce(attended,0)::numeric/total_bookings::numeric)*100)::integer end,
    'absence_rate',case when coalesce(total_bookings,0)=0 then 0 else round((coalesce(no_show,0)::numeric/total_bookings::numeric)*100)::integer end,
    'content_views',coalesce(content_views,0),
    'campaign_participants',coalesce(campaign_participants,0),
    'wellbeing_responses',coalesce(wellbeing_responses,0),
    'wellbeing_average',average_mood,
    'active_workers',coalesce(active_workers,0),
    'units_count',coalesce(units_count,0),
    'sectors_count',coalesce(sectors_count,0),
    'bookings_by_category',by_category,
    'bookings_by_sector',by_sector,
    'workers_by_sector',workers_sector,
    'attendance_by_sector',attendance_sector
  );
end; $$;

-- Alguns valores demonstrativos para os filtros, sem criar novos usuários.
update public.profiles p set sector='Administrativo'
from auth.users u where p.id=u.id and u.email='trabalhador.demo@vivamais.com' and p.sector is null;
update public.profiles p set sector='NAS'
from auth.users u where p.id=u.id and u.email='profissional.demo@vivamais.com' and p.sector is null;
update public.profiles p set sector='Gestão'
from auth.users u where p.id=u.id and u.email='gestao.demo@vivamais.com' and p.sector is null;
update public.profiles p set sector='TI'
from auth.users u where p.id=u.id and u.email='admin.demo@vivamais.com' and p.sector is null;

grant execute on function public.get_manager_filter_options() to authenticated;
grant execute on function public.get_manager_dashboard(integer,uuid,text) to authenticated;
revoke execute on function public.get_manager_filter_options() from public, anon;
revoke execute on function public.get_manager_dashboard(integer,uuid,text) from public, anon;

commit;

-- Conferência rápida
select u.email,p.role,p.sector,un.name as unidade
from public.profiles p
join auth.users u on u.id=p.id
left join public.units un on un.id=p.unit_id
where u.email like '%.demo@vivamais.com'
order by p.role;
