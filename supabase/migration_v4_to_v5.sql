-- Viva Mais MVP v5
-- Migration segura para quem ja esta usando a v4.
-- Nao apaga tabelas, usuarios, agendamentos ou check-ins existentes.

begin;

-- Inscricao idempotente: evita HTTP 409 quando o trabalhador clica novamente
-- no mesmo horario ou quando o cliente tenta repetir a requisicao.
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
  if v_user is null then
    raise exception 'Sessao expirada';
  end if;

  if public.current_user_role() <> 'worker' then
    raise exception 'Apenas trabalhadores podem realizar inscricoes em atividades';
  end if;

  select status, starts_at into v_slot_status, v_slot_start from public.service_slots where id = p_slot_id;
  if not found or v_slot_status <> 'open' or v_slot_start <= now() then
    raise exception 'Horario indisponivel';
  end if;

  select b.*
    into v_booking
  from public.bookings b
  where b.user_id = v_user
    and b.slot_id = p_slot_id
    and b.status <> 'cancelled'
  order by b.created_at desc
  limit 1;

  if found then
    return jsonb_build_object(
      'booking_id', v_booking.id,
      'status', v_booking.status,
      'created', false
    );
  end if;

  insert into public.bookings (slot_id, user_id, status)
  values (p_slot_id, v_user, 'confirmed')
  returning * into v_booking;

  return jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'created', true
  );
end;
$$;

grant execute on function public.create_booking(uuid) to authenticated;

-- Check-in idempotente: salva ou atualiza o registro do dia e retorna o dado
-- persistido para a interface confirmar que o banco recebeu a informacao.
create or replace function public.save_wellbeing_checkin(
  p_mood smallint,
  p_energy smallint,
  p_stress smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row public.wellbeing_checkins%rowtype;
begin
  if v_user is null then
    raise exception 'Sessao expirada';
  end if;

  if public.current_user_role() <> 'worker' then
    raise exception 'Apenas trabalhadores podem registrar check-in de bem-estar';
  end if;

  if p_mood not between 1 and 5 or p_energy not between 1 and 5 or p_stress not between 1 and 5 then
    raise exception 'Valores do check-in devem estar entre 1 e 5';
  end if;

  insert into public.wellbeing_checkins (
    user_id,
    occurred_on,
    mood,
    energy,
    stress,
    privacy_notice_version,
    privacy_notice_acknowledged_at
  ) values (
    v_user,
    current_date,
    p_mood,
    p_energy,
    p_stress,
    'mvp-5.0',
    now()
  )
  on conflict (user_id, occurred_on)
  do update set
    mood = excluded.mood,
    energy = excluded.energy,
    stress = excluded.stress,
    privacy_notice_version = excluded.privacy_notice_version,
    privacy_notice_acknowledged_at = excluded.privacy_notice_acknowledged_at
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

grant execute on function public.save_wellbeing_checkin(smallint, smallint, smallint) to authenticated;

commit;
