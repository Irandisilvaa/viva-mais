import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv(file) {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  for (const raw of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv('.env');
loadEnv('.env.admin');

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const password = process.env.DEMO_PASSWORD || 'VivaMais@2026!';

if (!url || !serviceRole) {
  console.error('\nFaltam SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY.');
  console.error('Crie .env.admin a partir de .env.admin.example. A service_role NUNCA deve ir para EXPO_PUBLIC_* nem para o Git.\n');
  process.exit(1);
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

const demo = [
  { email:'trabalhador.demo@vivamais.com', full_name:'Servidor(a) Demo', role:'worker', unit:'Administração Central', sector:'Administrativo' },
  { email:'profissional.demo@vivamais.com', full_name:'Profissional Responsável Demo', role:'professional', unit:'Núcleo de Atenção ao Servidor', sector:'NAS' },
  { email:'gestao.demo@vivamais.com', full_name:'Gestão Demo', role:'manager', unit:'Administração Central', sector:'Gestão' },
  { email:'admin.demo@vivamais.com', full_name:'Administrador Viva Mais', role:'admin', unit:'Tecnologia da Informação', sector:'TI' },
];

const { data: org, error: orgError } = await supabase.from('organizations').select('id').eq('slug','ses-se').single();
if (orgError || !org) throw new Error('Organização ses-se não encontrada. Execute schema.sql + seed.sql (ou as migrations) antes deste script.');
const { data: units, error: unitsError } = await supabase.from('units').select('id,name').eq('organization_id', org.id);
if (unitsError) throw unitsError;
const unitByName = new Map((units || []).map(u => [u.name, u.id]));

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
const existing = new Map(list.users.map(u => [u.email?.toLowerCase(), u]));

for (const item of demo) {
  let user = existing.get(item.email);
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata || {}), full_name: item.full_name },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Atualizado: ${item.email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: item.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: item.full_name },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Criado: ${item.email}`);
  }

  const unitId = unitByName.get(item.unit) || null;
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    organization_id: org.id,
    unit_id: unitId,
    full_name: item.full_name,
    role: item.role,
    sector: item.sector,
    active: true,
  }, { onConflict: 'id' });
  if (profileError) throw profileError;
}

const professional = (await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })).data.users.find(u => u.email === 'profissional.demo@vivamais.com');
if (professional) {
  const { error } = await supabase.from('services').update({ professional_id: professional.id, professional_name: 'Profissional Responsável Demo' }).in('id', [
    '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003'
  ]);
  if (error) throw error;
}

console.log('\nAcessos do MVP prontos:');
for (const item of demo) console.log(`- ${item.role.padEnd(12)} ${item.email}`);
console.log(`Senha: ${password}`);
console.log('\nIMPORTANTE: apague a service_role do terminal/.env.admin quando terminar e nunca a exponha no cliente.');
