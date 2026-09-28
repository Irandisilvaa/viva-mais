-- Viva Mais MVP v6
-- ATENCAO: este script recria SOMENTE o dominio public do Viva Mais e preserva auth.users.
-- Use no ambiente MVP/demo. Nao execute em producao sem backup e estrategia de migracao.

create extension if not exists pgcrypto;

-- Remove trigger antigo do Auth para permitir recriacao limpa do perfil.
drop trigger if exists on_auth_user_created on auth.users;

-- Remove objetos do dominio anterior.
drop table if exists public.hydration_preferences cascade;
drop table if exists public.booking_absence_justifications cascade;
drop table if exists public.notifications cascade;
drop table if exists public.privacy_acceptances cascade;
drop table if exists public.wellbeing_checkins cascade;
drop table if exists public.campaign_participations cascade;
drop table if exists public.campaigns cascade;
drop table if exists public.certificates cascade;
drop table if exists public.quiz_attempts cascade;
drop table if exists public.trail_items cascade;
drop table if exists public.learning_trails cascade;
drop table if exists public.content_progress cascade;
drop table if exists public.contents cascade;
drop table if exists public.bookings cascade;
drop table if exists public.service_slots cascade;
drop table if exists public.services cascade;
drop table if exists public.profiles cascade;
drop table if exists public.units cascade;
drop table if exists public.organizations cascade;

drop type if exists public.hydration_channel cascade;
drop type if exists public.absence_reason cascade;
drop type if exists public.content_format cascade;
drop type if exists public.content_category cascade;
drop type if exists public.slot_status cascade;
drop type if exists public.booking_status cascade;
drop type if exists public.service_category cascade;
drop type if exists public.app_role cascade;

create type public.app_role as enum ('worker', 'professional', 'manager', 'admin');
create type public.service_category as enum ('nutrition', 'physical_activity', 'wellbeing', 'ergonomics', 'mental_health');
create type public.booking_status as enum ('confirmed', 'cancelled', 'attended', 'no_show');
create type public.slot_status as enum ('open', 'closed', 'cancelled');
create type public.content_category as enum ('nutrition', 'movement', 'wellbeing', 'mental_health', 'ergonomics');
create type public.content_format as enum ('article', 'recipe', 'guide', 'video', 'audio');
create type public.absence_reason as enum ('work_demand', 'schedule_conflict', 'personal', 'other');
create type public.hydration_channel as enum ('app', 'email', 'both', 'off');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

-- Perfil minimo. O e-mail continua exclusivamente no auth.users.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  unit_id uuid references public.units(id),
  full_name text not null,
  sector text,
  role public.app_role not null default 'worker',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  category public.service_category not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes between 5 and 240),
  professional_id uuid references public.profiles(id),
  professional_name text,
  location text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check (capacity > 0 and capacity <= 500),
  booked_count integer not null default 0 check (booked_count >= 0),
  location text,
  status public.slot_status not null default 'open',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index service_slots_service_starts_idx on public.service_slots(service_id, starts_at);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.service_slots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  checked_in_at timestamptz
);
create unique index one_active_booking_per_user_slot on public.bookings(user_id, slot_id) where status <> 'cancelled';
create index bookings_user_idx on public.bookings(user_id, created_at desc);
create index bookings_slot_idx on public.bookings(slot_id, status);

-- Justificativa separada para reduzir exposicao de dados. Nao possui texto livre no MVP.
create table public.booking_absence_justifications (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason public.absence_reason not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  excerpt text not null,
  body text not null,
  category public.content_category not null,
  format public.content_format not null,
  duration_minutes integer not null default 3 check (duration_minutes between 1 and 180),
  image_url text,
  official_guide boolean not null default false,
  source_label text,
  source_url text,
  external_url text,
  media_url text,
  created_by uuid references public.profiles(id) on delete set null,
  audience text not null default 'all',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table public.learning_trails (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.trail_items (
  trail_id uuid not null references public.learning_trails(id) on delete cascade,
  content_id uuid not null references public.contents(id) on delete cascade,
  position integer not null check (position > 0),
  primary key (trail_id, content_id),
  unique (trail_id, position)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trail_id uuid not null references public.learning_trails(id) on delete cascade,
  score numeric(5,2) check (score between 0 and 100),
  completed_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trail_id uuid not null references public.learning_trails(id) on delete cascade,
  verification_code text not null unique default encode(gen_random_bytes(8), 'hex'),
  issued_at timestamptz not null default now(),
  unique(user_id, trail_id)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  image_url text,
  cta_label text not null default 'Participar',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.campaign_participations (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

-- Dado sensivel: propositalmente sem texto livre, sintomas, diagnostico, peso, altura ou dieta.
create table public.wellbeing_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_on date not null default current_date,
  mood smallint not null check (mood between 1 and 5),
  energy smallint not null check (energy between 1 and 5),
  stress smallint not null check (stress between 1 and 5),
  privacy_notice_version text not null,
  privacy_notice_acknowledged_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(user_id, occurred_on)
);

create table public.privacy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('privacy_notice', 'terms')),
  version text not null,
  acknowledged_at timestamptz not null default now(),
  unique(user_id, document_type, version)
);

-- Preferencias de hidratacao. O progresso diario de consumo fica local no dispositivo;
-- o banco armazena apenas meta, rotina e canal de lembrete.
create table public.hydration_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_goal_ml integer not null default 2000 check (daily_goal_ml between 500 and 6000),
  serving_ml integer not null default 250 check (serving_ml between 50 and 1000),
  routine_start time not null default '08:00',
  routine_end time not null default '18:00',
  interval_minutes integer not null default 120 check (interval_minutes between 30 and 360),
  channel public.hydration_channel not null default 'app',
  email text,
  timezone text not null default 'America/Maceio',
  enabled boolean not null default true,
  email_opt_in_at timestamptz,
  last_email_sent_at timestamptz,
  updated_at timestamptz not null default now(),
  check (routine_end > routine_start),
  check (channel not in ('email','both') or email is not null)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_organization()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_manager_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('manager','admin'), false);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger contents_set_updated_at before update on public.contents for each row execute function public.set_updated_at();
create trigger absence_set_updated_at before update on public.booking_absence_justifications for each row execute function public.set_updated_at();
create trigger hydration_set_updated_at before update on public.hydration_preferences for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare default_org uuid;
begin
  select id into default_org from public.organizations where slug = 'ses-se' limit 1;
  insert into public.profiles (id, full_name, role, organization_id)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(coalesce(new.email, 'Usuario'), '@', 1)),
    'worker',
    default_org
  ) on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Sincroniza usuarios Auth que ja existiam antes deste schema.
create or replace function public.sync_existing_auth_users()
returns void language plpgsql security definer set search_path = public, auth as $$
declare default_org uuid;
begin
  select id into default_org from public.organizations where slug = 'ses-se' limit 1;
  insert into public.profiles (id, full_name, role, organization_id)
  select u.id,
         coalesce(nullif(u.raw_user_meta_data->>'full_name',''), split_part(coalesce(u.email,'Usuario'),'@',1)),
         'worker'::public.app_role,
         default_org
  from auth.users u
  on conflict (id) do nothing;
end; $$;

create or replace function public.refresh_slot_booked_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_slot uuid;
begin
  target_slot := coalesce(new.slot_id, old.slot_id);
  update public.service_slots s set booked_count = (
    select count(*) from public.bookings b where b.slot_id = target_slot and b.status = 'confirmed'
  ) where s.id = target_slot;
  return coalesce(new, old);
end; $$;
create trigger bookings_refresh_count after insert or update or delete on public.bookings for each row execute function public.refresh_slot_booked_count();

create or replace function public.check_slot_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap integer; used integer; slot_state public.slot_status;
begin
  if new.status <> 'confirmed' then return new; end if;
  select capacity, status into cap, slot_state from public.service_slots where id = new.slot_id for update;
  if slot_state <> 'open' then raise exception 'Horario indisponivel'; end if;
  select count(*) into used from public.bookings where slot_id = new.slot_id and status = 'confirmed' and id <> new.id;
  if used >= cap then raise exception 'Nao ha vagas disponiveis'; end if;
  return new;
end; $$;
create trigger bookings_check_capacity before insert or update on public.bookings for each row execute function public.check_slot_capacity();

create or replace function public.enforce_booking_status_transition()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() = old.user_id and public.current_user_role() = 'worker' then
    if new.user_id <> old.user_id or new.slot_id <> old.slot_id then raise exception 'Alteracao de agendamento nao permitida'; end if;
    if new.status not in ('confirmed','cancelled') then raise exception 'Trabalhador nao pode registrar presenca'; end if;
  end if;
  return new;
end; $$;
create trigger bookings_status_guard before update on public.bookings for each row execute function public.enforce_booking_status_transition();

-- RPC de inscricao idempotente: evita conflito 409 por clique repetido.
create or replace function public.create_booking(p_slot_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_booking public.bookings%rowtype;
  v_slot_status public.slot_status;
  v_slot_start timestamptz;
begin
  if v_user is null then raise exception 'Sessao expirada'; end if;
  if public.current_user_role() <> 'worker' then raise exception 'Apenas trabalhadores podem realizar inscricoes em atividades'; end if;
  select status, starts_at into v_slot_status, v_slot_start from public.service_slots where id=p_slot_id;
  if not found or v_slot_status <> 'open' or v_slot_start <= now() then raise exception 'Horario indisponivel'; end if;

  select b.* into v_booking
  from public.bookings b
  where b.user_id = v_user and b.slot_id = p_slot_id and b.status <> 'cancelled'
  order by b.created_at desc limit 1;

  if found then
    return jsonb_build_object('booking_id',v_booking.id,'status',v_booking.status,'created',false);
  end if;

  insert into public.bookings(slot_id,user_id,status)
  values(p_slot_id,v_user,'confirmed')
  returning * into v_booking;

  return jsonb_build_object('booking_id',v_booking.id,'status',v_booking.status,'created',true);
end; $$;

-- RPC de check-in idempotente: salva/atualiza o registro do dia.
create or replace function public.save_wellbeing_checkin(p_mood smallint,p_energy smallint,p_stress smallint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row public.wellbeing_checkins%rowtype;
begin
  if v_user is null then raise exception 'Sessao expirada'; end if;
  if public.current_user_role() <> 'worker' then raise exception 'Apenas trabalhadores podem registrar check-in de bem-estar'; end if;
  if p_mood not between 1 and 5 or p_energy not between 1 and 5 or p_stress not between 1 and 5 then
    raise exception 'Valores do check-in devem estar entre 1 e 5';
  end if;

  insert into public.wellbeing_checkins(user_id,occurred_on,mood,energy,stress,privacy_notice_version,privacy_notice_acknowledged_at)
  values(v_user,current_date,p_mood,p_energy,p_stress,'mvp-5.0',now())
  on conflict(user_id,occurred_on) do update set
    mood=excluded.mood,
    energy=excluded.energy,
    stress=excluded.stress,
    privacy_notice_version=excluded.privacy_notice_version,
    privacy_notice_acknowledged_at=excluded.privacy_notice_acknowledged_at
  returning * into v_row;

  return to_jsonb(v_row);
end; $$;

-- RLS
alter table public.organizations enable row level security;
alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_absence_justifications enable row level security;
alter table public.contents enable row level security;
alter table public.content_progress enable row level security;
alter table public.learning_trails enable row level security;
alter table public.trail_items enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_participations enable row level security;
alter table public.wellbeing_checkins enable row level security;
alter table public.privacy_acceptances enable row level security;
alter table public.notifications enable row level security;
alter table public.hydration_preferences enable row level security;

create policy organizations_read on public.organizations for select to authenticated using (id = public.current_user_organization());
create policy units_read on public.units for select to authenticated using (organization_id = public.current_user_organization());

create policy profile_self_read on public.profiles for select to authenticated using (id = auth.uid());
create policy profile_admin_read on public.profiles for select to authenticated using (public.is_admin() and organization_id = public.current_user_organization());
create policy profile_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Servicos: todos autenticados leem; profissional gerencia SOMENTE os proprios; admin gerencia todos.
create policy services_read on public.services for select to authenticated using (organization_id = public.current_user_organization() and active = true);
create policy services_prof_insert on public.services for insert to authenticated with check (
  public.current_user_role() = 'professional' and professional_id = auth.uid() and organization_id = public.current_user_organization()
);
create policy services_prof_update on public.services for update to authenticated using (
  public.current_user_role() = 'professional' and professional_id = auth.uid() and organization_id = public.current_user_organization()
) with check (professional_id = auth.uid() and organization_id = public.current_user_organization());
create policy services_prof_delete on public.services for delete to authenticated using (
  public.current_user_role() = 'professional' and professional_id = auth.uid()
);
create policy services_admin_all on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy slots_read on public.service_slots for select to authenticated using (
  exists (select 1 from public.services s where s.id = service_id and s.organization_id = public.current_user_organization())
);
create policy slots_prof_insert on public.service_slots for insert to authenticated with check (
  public.current_user_role() = 'professional' and exists (select 1 from public.services s where s.id = service_id and s.professional_id = auth.uid())
);
create policy slots_prof_update on public.service_slots for update to authenticated using (
  public.current_user_role() = 'professional' and exists (select 1 from public.services s where s.id = service_id and s.professional_id = auth.uid())
);
create policy slots_prof_delete on public.service_slots for delete to authenticated using (
  public.current_user_role() = 'professional' and exists (select 1 from public.services s where s.id = service_id and s.professional_id = auth.uid())
);
create policy slots_admin_all on public.service_slots for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy booking_self_read on public.bookings for select to authenticated using (user_id = auth.uid());
create policy booking_prof_read on public.bookings for select to authenticated using (
  public.current_user_role() = 'professional' and exists (
    select 1 from public.service_slots sl join public.services s on s.id = sl.service_id
    where sl.id = slot_id and s.professional_id = auth.uid()
  )
);
create policy booking_admin_read on public.bookings for select to authenticated using (public.is_admin());
create policy booking_self_insert on public.bookings for insert to authenticated with check (user_id = auth.uid());
create policy booking_self_update on public.bookings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy booking_prof_update on public.bookings for update to authenticated using (
  public.current_user_role() = 'professional' and exists (
    select 1 from public.service_slots sl join public.services s on s.id = sl.service_id
    where sl.id = slot_id and s.professional_id = auth.uid()
  )
);
create policy booking_admin_update on public.bookings for update to authenticated using (public.is_admin());

create policy absence_self_read on public.booking_absence_justifications for select to authenticated using (user_id = auth.uid());
create policy absence_self_insert on public.booking_absence_justifications for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
);
create policy absence_self_update on public.booking_absence_justifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy absence_prof_read on public.booking_absence_justifications for select to authenticated using (
  public.current_user_role() = 'professional' and exists (
    select 1 from public.bookings b join public.service_slots sl on sl.id=b.slot_id join public.services s on s.id=sl.service_id
    where b.id=booking_id and s.professional_id=auth.uid()
  )
);
create policy absence_admin_read on public.booking_absence_justifications for select to authenticated using (public.is_admin());

create policy contents_read on public.contents for select to authenticated using ((organization_id is null or organization_id = public.current_user_organization()) and published = true);
create policy contents_prof_insert on public.contents for insert to authenticated with check (
  public.current_user_role() = 'professional' and organization_id = public.current_user_organization() and created_by = auth.uid()
);
create policy contents_prof_update on public.contents for update to authenticated using (
  public.current_user_role() = 'professional' and created_by = auth.uid() and organization_id = public.current_user_organization()
) with check (created_by = auth.uid() and organization_id = public.current_user_organization());
create policy contents_prof_delete on public.contents for delete to authenticated using (
  public.current_user_role() = 'professional' and created_by = auth.uid() and organization_id = public.current_user_organization()
);
create policy contents_admin_all on public.contents for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy progress_self_read on public.content_progress for select to authenticated using (user_id = auth.uid());
create policy progress_self_insert on public.content_progress for insert to authenticated with check (user_id = auth.uid());
create policy progress_self_update on public.content_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trails_read on public.learning_trails for select to authenticated using ((organization_id is null or organization_id = public.current_user_organization()) and active = true);
create policy trails_admin_all on public.learning_trails for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy trail_items_read on public.trail_items for select to authenticated using (true);
create policy trail_items_admin_all on public.trail_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quiz_self_read on public.quiz_attempts for select to authenticated using (user_id = auth.uid());
create policy quiz_self_insert on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid());
create policy cert_self_read on public.certificates for select to authenticated using (user_id = auth.uid());
create policy cert_admin_insert on public.certificates for insert to authenticated with check (public.is_admin());

create policy campaigns_read on public.campaigns for select to authenticated using (organization_id = public.current_user_organization() and active = true);
create policy campaigns_admin_all on public.campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy campaign_participation_self_read on public.campaign_participations for select to authenticated using (user_id = auth.uid());
create policy campaign_participation_self_insert on public.campaign_participations for insert to authenticated with check (user_id = auth.uid());
create policy campaign_participation_self_delete on public.campaign_participations for delete to authenticated using (user_id = auth.uid());

create policy checkin_self_read on public.wellbeing_checkins for select to authenticated using (user_id = auth.uid());
create policy checkin_self_insert on public.wellbeing_checkins for insert to authenticated with check (user_id = auth.uid());
create policy checkin_self_update on public.wellbeing_checkins for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy checkin_self_delete on public.wellbeing_checkins for delete to authenticated using (user_id = auth.uid());

create policy privacy_self_read on public.privacy_acceptances for select to authenticated using (user_id = auth.uid());
create policy privacy_self_insert on public.privacy_acceptances for insert to authenticated with check (user_id = auth.uid());
create policy notifications_self_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy hydration_self_read on public.hydration_preferences for select to authenticated using (user_id = auth.uid());
create policy hydration_self_insert on public.hydration_preferences for insert to authenticated with check (user_id = auth.uid());
create policy hydration_self_update on public.hydration_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy hydration_self_delete on public.hydration_preferences for delete to authenticated using (user_id = auth.uid());

-- RPC de presenca: profissional ve apenas nome e status dos participantes de um horario sob sua responsabilidade.
create or replace function public.get_professional_slot_attendees(p_slot_id uuid)
returns table (
  booking_id uuid,
  user_id uuid,
  full_name text,
  booking_status public.booking_status,
  absence_reason public.absence_reason
)
language plpgsql security definer set search_path = public as $$
begin
  if public.current_user_role() not in ('professional','admin') then raise exception 'Acesso restrito'; end if;
  if public.current_user_role() = 'professional' and not exists (
    select 1 from public.service_slots sl join public.services s on s.id=sl.service_id
    where sl.id=p_slot_id and s.professional_id=auth.uid()
  ) then raise exception 'Horario fora da responsabilidade do profissional'; end if;

  return query
  select b.id, b.user_id, p.full_name, b.status, j.reason
  from public.bookings b
  join public.profiles p on p.id=b.user_id
  left join public.booking_absence_justifications j on j.booking_id=b.id
  where b.slot_id=p_slot_id and b.status <> 'cancelled'
  order by p.full_name;
end; $$;

create or replace function public.set_booking_attendance(p_booking_id uuid, p_status public.booking_status)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('attended','no_show','confirmed') then raise exception 'Status invalido para controle de presenca'; end if;
  if public.current_user_role() = 'professional' then
    if not exists (
      select 1 from public.bookings b join public.service_slots sl on sl.id=b.slot_id join public.services s on s.id=sl.service_id
      where b.id=p_booking_id and s.professional_id=auth.uid()
    ) then raise exception 'Agendamento fora da responsabilidade do profissional'; end if;
  elsif not public.is_admin() then
    raise exception 'Acesso restrito';
  end if;
  update public.bookings set status=p_status, checked_in_at=case when p_status='attended' then now() else null end where id=p_booking_id;
end; $$;

-- Gestao: somente agregados, nunca identificadores individuais.
create or replace function public.get_manager_filter_options()
returns jsonb language plpgsql security definer set search_path = public as $$
declare org_id uuid; units_json jsonb; sectors_json jsonb;
begin
  if not public.is_manager_or_admin() then raise exception 'Acesso restrito a gestao'; end if;
  org_id := public.current_user_organization();
  select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.name) order by u.name),'[]'::jsonb)
    into units_json from public.units u where u.organization_id=org_id and u.active=true;
  select coalesce(jsonb_agg(sector order by sector),'[]'::jsonb) into sectors_json
    from (select distinct trim(p.sector) sector from public.profiles p where p.organization_id=org_id and p.role='worker' and p.active=true and nullif(trim(p.sector),'') is not null) q;
  return jsonb_build_object('units',units_json,'sectors',sectors_json);
end; $$;

create or replace function public.get_manager_dashboard(p_days integer default 30, p_unit_id uuid default null, p_sector text default null)
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
  where p.organization_id=org_id and b.created_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id)
    and (p_sector is null or p.sector=p_sector);

  select count(*)::integer into content_views from public.content_progress cp join public.profiles p on p.id=cp.user_id
  where p.organization_id=org_id and cp.last_accessed_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector);

  select count(*)::integer into campaign_participants from public.campaign_participations cp join public.profiles p on p.id=cp.user_id
  where p.organization_id=org_id and cp.joined_at >= now() - make_interval(days=>p_days)
    and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector);

  select count(*)::integer, case when count(*) >= 5 then round(avg(w.mood)::numeric,1) else null end
  into wellbeing_responses, average_mood
  from public.wellbeing_checkins w join public.profiles p on p.id=w.user_id
  where p.organization_id=org_id and w.occurred_on >= current_date - p_days
    and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector);

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb) into by_category from (
    select case s.category when 'nutrition' then 'Nutrição' when 'physical_activity' then 'Movimento' when 'ergonomics' then 'Ergonomia' when 'mental_health' then 'Saúde mental' else 'Bem-estar' end label,
           count(*)::integer value
    from public.bookings b join public.service_slots sl on sl.id=b.slot_id join public.services s on s.id=sl.service_id join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id and b.status <> 'cancelled' and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector)
    group by s.category
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb) into by_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label, count(*)::integer value
    from public.bookings b join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id and b.status <> 'cancelled' and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) order by value desc),'[]'::jsonb) into workers_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label, count(*)::integer value
    from public.profiles p where p.organization_id=org_id and p.role='worker' and p.active=true
      and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value,'total',total,'attended',attended) order by value desc),'[]'::jsonb) into attendance_sector from (
    select coalesce(nullif(trim(p.sector),''),'Não informado') label,
      case when count(*) filter (where b.status <> 'cancelled')=0 then 0 else round((count(*) filter (where b.status='attended')::numeric / count(*) filter (where b.status <> 'cancelled')::numeric)*100)::integer end value,
      count(*) filter (where b.status <> 'cancelled')::integer total,
      count(*) filter (where b.status='attended')::integer attended
    from public.bookings b join public.profiles p on p.id=b.user_id
    where p.organization_id=org_id and b.created_at >= now() - make_interval(days=>p_days)
      and (p_unit_id is null or p.unit_id=p_unit_id) and (p_sector is null or p.sector=p_sector)
    group by coalesce(nullif(trim(p.sector),''),'Não informado')
  ) q;

  return jsonb_build_object(
    'total_bookings',coalesce(total_bookings,0),
    'attendance_rate',case when coalesce(total_bookings,0)=0 then 0 else round((coalesce(attended,0)::numeric/total_bookings::numeric)*100)::integer end,
    'absence_rate',case when coalesce(total_bookings,0)=0 then 0 else round((coalesce(no_show,0)::numeric/total_bookings::numeric)*100)::integer end,
    'content_views',coalesce(content_views,0), 'campaign_participants',coalesce(campaign_participants,0),
    'wellbeing_responses',coalesce(wellbeing_responses,0), 'wellbeing_average',average_mood,
    'active_workers',coalesce(active_workers,0), 'units_count',coalesce(units_count,0), 'sectors_count',coalesce(sectors_count,0),
    'bookings_by_category',by_category, 'bookings_by_sector',by_sector, 'workers_by_sector',workers_sector, 'attendance_by_sector',attendance_sector
  );
end; $$;

-- Admin: troca de perfil sem expor UPDATE de role aos demais usuarios.
create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.app_role, p_unit_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Acesso restrito ao administrador'; end if;
  update public.profiles set role=p_role, unit_id=coalesce(p_unit_id,unit_id), updated_at=now()
  where id=p_user_id and organization_id=public.current_user_organization();
end; $$;

-- Privilegios
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
grant usage on schema public to authenticated;

grant select on public.organizations, public.units, public.services, public.service_slots, public.contents, public.learning_trails, public.trail_items, public.campaigns to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant execute on function public.create_booking(uuid) to authenticated;
grant execute on function public.save_wellbeing_checkin(smallint, smallint, smallint) to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select, insert, update on public.booking_absence_justifications to authenticated;
grant select, insert, update on public.content_progress to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant select on public.certificates to authenticated;
grant select, insert, delete on public.campaign_participations to authenticated;
grant select, insert, update, delete on public.wellbeing_checkins to authenticated;
grant select, insert on public.privacy_acceptances to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, update, delete on public.hydration_preferences to authenticated;
grant insert, update, delete on public.services, public.service_slots, public.contents, public.learning_trails, public.trail_items, public.campaigns, public.certificates to authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_organization() to authenticated;
grant execute on function public.get_professional_slot_attendees(uuid) to authenticated;
grant execute on function public.set_booking_attendance(uuid, public.booking_status) to authenticated;
grant execute on function public.get_manager_filter_options() to authenticated;
grant execute on function public.get_manager_dashboard(integer, uuid, text) to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.app_role, uuid) to authenticated;

revoke execute on function public.get_professional_slot_attendees(uuid) from public, anon;
revoke execute on function public.set_booking_attendance(uuid, public.booking_status) from public, anon;
revoke execute on function public.get_manager_filter_options() from public, anon;
revoke execute on function public.get_manager_dashboard(integer, uuid, text) from public, anon;
revoke execute on function public.admin_set_user_role(uuid, public.app_role, uuid) from public, anon;


-- Bucket público para capas/mídias importadas por profissionais e administradores.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('viva-mais-media','viva-mais-media',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists viva_mais_media_insert on storage.objects;
drop policy if exists viva_mais_media_update on storage.objects;
drop policy if exists viva_mais_media_delete on storage.objects;
create policy viva_mais_media_insert on storage.objects for insert to authenticated with check (
  bucket_id='viva-mais-media' and public.current_user_role() in ('professional','admin') and (storage.foldername(name))[1]=auth.uid()::text
);
create policy viva_mais_media_update on storage.objects for update to authenticated using (
  bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text)
) with check (bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text));
create policy viva_mais_media_delete on storage.objects for delete to authenticated using (
  bucket_id='viva-mais-media' and (public.is_admin() or (storage.foldername(name))[1]=auth.uid()::text)
);

-- O seed cria a organizacao; a sincronizacao deve ser executada DEPOIS do seed.
