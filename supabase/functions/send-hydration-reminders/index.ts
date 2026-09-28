import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET')!;
const FROM_EMAIL = Deno.env.get('HYDRATION_FROM_EMAIL') || 'Viva Mais <onboarding@resend.dev>';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function partsInTimezone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(':').map(Number);
  return hour * 60 + minute;
}

function isDue(now: Date, row: any) {
  const local = partsInTimezone(now, row.timezone || 'America/Maceio');
  const minuteOfDay = local.hour * 60 + local.minute;
  const start = timeToMinutes(row.routine_start);
  const end = timeToMinutes(row.routine_end);
  if (minuteOfDay < start || minuteOfDay > end) return false;

  const elapsed = minuteOfDay - start;
  const remainder = elapsed % row.interval_minutes;
  const withinCronWindow = remainder >= 0 && remainder < 5;
  if (!withinCronWindow) return false;

  if (row.last_email_sent_at) {
    const last = new Date(row.last_email_sent_at);
    if (now.getTime() - last.getTime() < 20 * 60 * 1000) return false;
  }
  return true;
}

async function sendEmail(to: string, goal: number) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: 'Viva Mais — hora de se hidratar',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17332d">
        <h2 style="color:#14866f">Uma pausa rápida para água</h2>
        <p>Este é o lembrete de hidratação que você configurou no Viva Mais.</p>
        <p>Sua meta diária cadastrada é <strong>${goal} ml</strong>.</p>
        <p style="font-size:12px;color:#64746f">Você pode alterar ou desativar estes lembretes a qualquer momento na área Bem-estar.</p>
      </div>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!CRON_SECRET || request.headers.get('x-cron-secret') !== CRON_SECRET) return new Response('Unauthorized', { status: 401 });
  if (!RESEND_API_KEY) return new Response('RESEND_API_KEY not configured', { status: 500 });

  const now = new Date();
  const { data, error } = await supabase
    .from('hydration_preferences')
    .select('user_id,daily_goal_ml,routine_start,routine_end,interval_minutes,channel,email,timezone,last_email_sent_at,enabled')
    .eq('enabled', true)
    .in('channel', ['email', 'both'])
    .not('email', 'is', null);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const failures: { user_id: string; error: string }[] = [];
  for (const row of data || []) {
    if (!isDue(now, row)) continue;
    try {
      await sendEmail(row.email!, row.daily_goal_ml);
      await supabase.from('hydration_preferences').update({ last_email_sent_at: now.toISOString() }).eq('user_id', row.user_id);
      sent += 1;
    } catch (error) {
      failures.push({ user_id: row.user_id, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return Response.json({ checked: data?.length || 0, sent, failures });
});
