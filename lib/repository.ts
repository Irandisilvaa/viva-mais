import { DEMO_MODE, supabase } from '@/lib/supabase';
import { demoBookings, demoCampaigns, demoContents, demoDashboard, demoServices } from '@/lib/mock-data';
import { getDefaultServiceImage } from '@/lib/serviceImages';
import {
  AbsenceReason, AdminUser, Booking, BookingCreationResult, Campaign, ContentCategory, ContentFormat,
  DashboardData, HealthService, HydrationPreferences, LearningContent, ManagerFilterOptions,
  ProfessionalAttendee, ProfessionalOverview, ServiceCategory, ServiceSlot, UserRole,
  WellbeingCheckin, WellbeingCheckinInput,
} from '@/types/domain';

const wait=(ms=160)=>new Promise(r=>setTimeout(r,ms));

export async function getServices():Promise<HealthService[]>{
  if(DEMO_MODE){await wait();return demoServices;}
  const {data,error}=await supabase.from('services').select('id,title,category,description,duration_minutes,professional_id,professional_name,location,image_url,active,slots:service_slots(id,service_id,starts_at,ends_at,capacity,booked_count,location,status)').eq('active',true).eq('slots.status','open').gte('slots.starts_at',new Date().toISOString()).order('title');
  if(error)throw error; return (data??[]).map((s:any)=>({...s,slots:s.slots??[]})) as HealthService[];
}

export async function getBookings():Promise<Booking[]>{
  if(DEMO_MODE){await wait();return demoBookings;}
  const {data,error}=await supabase.from('bookings').select('id,slot_id,status,slot:service_slots(starts_at,location,service:services(title)),absence:booking_absence_justifications(reason)').order('created_at',{ascending:false});
  if(error)throw error;return (data??[]).map((r:any)=>({id:r.id,slot_id:r.slot_id,status:r.status,starts_at:r.slot.starts_at,service_title:r.slot.service.title,location:r.slot.location,absence_reason:r.absence?.reason??null})) as Booking[];
}

export async function createBooking(slotId:string):Promise<BookingCreationResult>{
  if(DEMO_MODE){await wait();return{booking_id:`demo-${slotId}`,status:'confirmed',created:true};}
  const {data,error}=await supabase.rpc('create_booking',{p_slot_id:slotId});
  if(error){
    if(error.code==='23505') throw new Error('Você já está inscrito(a) neste horário.');
    if((error.message||'').toLowerCase().includes('vagas')) throw new Error('Não há mais vagas disponíveis neste horário.');
    if((error.message||'').toLowerCase().includes('indisponivel')) throw new Error('Este horário não está mais disponível.');
    throw error;
  }
  return (data??{}) as BookingCreationResult;
}

export async function cancelBooking(
  bookingId: string,
): Promise<void> {
  if (DEMO_MODE) {
    await wait();
    return;
  }

  const { error } =
    await supabase.rpc(
      'cancel_booking',
      {
        p_booking_id:
          bookingId,
      },
    );

  if (error) {
    throw new Error(
      error.message ||
        'Não foi possível cancelar o agendamento.',
    );
  }
}

export async function justifyAbsence(bookingId:string,reason:AbsenceReason){if(DEMO_MODE){await wait();return;}const {data:u}=await supabase.auth.getUser();if(!u.user)throw new Error('Sessão expirada.');const {error}=await supabase.from('booking_absence_justifications').upsert({booking_id:bookingId,user_id:u.user.id,reason},{onConflict:'booking_id'});if(error)throw error;}

export async function getContents():Promise<LearningContent[]>{if(DEMO_MODE){await wait();return demoContents;}const {data,error}=await supabase.from('contents').select('*').eq('published',true).order('published_at',{ascending:false});if(error)throw error;return (data??[]) as LearningContent[];}
export async function getContent(id:string):Promise<LearningContent|null>{if(DEMO_MODE)return demoContents.find(x=>x.id===id)??null;const {data,error}=await supabase.from('contents').select('*').eq('id',id).eq('published',true).maybeSingle();if(error)throw error;return data as LearningContent|null;}
export async function getCampaigns():Promise<Campaign[]>{if(DEMO_MODE){await wait();return demoCampaigns;}const now=new Date().toISOString();const {data,error}=await supabase.from('campaigns').select('*').eq('active',true).lte('starts_at',now).gte('ends_at',now).order('starts_at');if(error)throw error;return (data??[]) as Campaign[];}

export async function getTodayWellbeingCheckin():Promise<WellbeingCheckin|null>{
  if(DEMO_MODE)return null;
  const today=new Date().toISOString().slice(0,10);
  const {data,error}=await supabase.from('wellbeing_checkins').select('id,occurred_on,mood,energy,stress,privacy_notice_acknowledged_at,created_at').eq('occurred_on',today).maybeSingle();
  if(error)throw error; return (data??null) as WellbeingCheckin|null;
}

export async function saveWellbeingCheckin(input:WellbeingCheckinInput):Promise<WellbeingCheckin>{
  if(DEMO_MODE){await wait();return{id:'demo-checkin',occurred_on:new Date().toISOString().slice(0,10),privacy_notice_acknowledged_at:new Date().toISOString(),created_at:new Date().toISOString(),...input};}
  const {data,error}=await supabase.rpc('save_wellbeing_checkin',{p_mood:input.mood,p_energy:input.energy,p_stress:input.stress});
  if(error)throw error; return data as WellbeingCheckin;
}

export async function getProfessionalServices():Promise<HealthService[]>{
  if(DEMO_MODE){await wait();return demoServices;}
  const {data:u}=await supabase.auth.getUser();if(!u.user)throw new Error('Sessão expirada.');
  const {data,error}=await supabase.from('services').select('id,title,category,description,duration_minutes,professional_id,professional_name,location,image_url,active,slots:service_slots(id,service_id,starts_at,ends_at,capacity,booked_count,location,status)').eq('professional_id',u.user.id).order('title');
  if(error)throw error;return (data??[]).map((s:any)=>({...s,slots:s.slots??[]})) as HealthService[];
}

export async function getProfessionalOverview():Promise<ProfessionalOverview>{
  const services=await getProfessionalServices();
  const slots=services.flatMap(s=>s.slots).filter(s=>new Date(s.starts_at)>=new Date()&&s.status!=='cancelled');
  return{services:services.length,upcoming_slots:slots.length,total_capacity:slots.reduce((a,s)=>a+s.capacity,0),booked:slots.reduce((a,s)=>a+s.booked_count,0)};
}

export async function createProfessionalService(input:{title:string;category:ServiceCategory;description:string;duration_minutes:number;location:string;image_url?:string}){
  if(DEMO_MODE){await wait();return;}
  const {data:u,error:ue}=await supabase.auth.getUser();if(ue)throw ue;if(!u.user)throw new Error('Sessão expirada.');
  const {data:p,error:profileError}=await supabase.from('profiles').select('organization_id,full_name').eq('id',u.user.id).single();
  if(profileError)throw profileError;if(!p?.organization_id)throw new Error('Organização do profissional não encontrada.');
  const imageUrl=input.image_url||getDefaultServiceImage(input.category,input.title);
  const {error}=await supabase.from('services').insert({...input,organization_id:p.organization_id,professional_id:u.user.id,professional_name:p.full_name,image_url:imageUrl});
  if(error)throw error;
}

export async function createProfessionalSlot(input:{service_id:string;starts_at:string;ends_at:string;capacity:number;location:string}){if(DEMO_MODE){await wait();return;}const {error}=await supabase.from('service_slots').insert({...input,status:'open'});if(error)throw error;}
export async function updateProfessionalSlot(slotId:string,input:Partial<Pick<ServiceSlot,'capacity'|'location'|'status'>>){if(DEMO_MODE)return;const {error}=await supabase.from('service_slots').update(input).eq('id',slotId);if(error)throw error;}

export async function getProfessionalAttendees(slotId:string):Promise<ProfessionalAttendee[]>{
  if(DEMO_MODE){await wait();return[{booking_id:'demo-a',user_id:'demo-w1',full_name:'Ana Souza',booking_status:'confirmed',absence_reason:null},{booking_id:'demo-b',user_id:'demo-w2',full_name:'Carlos Santos',booking_status:'no_show',absence_reason:'work_demand'}];}
  const {data,error}=await supabase.rpc('get_professional_slot_attendees',{p_slot_id:slotId});if(error)throw error;return (data??[]) as ProfessionalAttendee[];
}
export async function setAttendance(bookingId:string,status:'attended'|'no_show'|'confirmed'){if(DEMO_MODE){await wait();return;}const {error}=await supabase.rpc('set_booking_attendance',{p_booking_id:bookingId,p_status:status});if(error)throw error;}

export async function createProfessionalContent(input:{title:string;excerpt:string;body:string;category:ContentCategory;format:ContentFormat;duration_minutes:number;image_url:string;external_url?:string|null;media_url?:string|null}){
  if(DEMO_MODE){await wait();return;}
  const {data:u,error:ue}=await supabase.auth.getUser();if(ue)throw ue;if(!u.user)throw new Error('Sessão expirada.');
  const {data:p,error:pe}=await supabase.from('profiles').select('organization_id,role').eq('id',u.user.id).single();
  if(pe)throw pe;if(p?.role!=='professional')throw new Error('Apenas profissionais responsáveis podem publicar por esta área.');
  if(!p.organization_id)throw new Error('Organização do profissional não encontrada.');
  const {error}=await supabase.from('contents').insert({...input,organization_id:p.organization_id,created_by:u.user.id,published:true,published_at:new Date().toISOString(),official_guide:false,audience:'all'});
  if(error)throw error;
}

export async function getManagerFilterOptions():Promise<ManagerFilterOptions>{
  if(DEMO_MODE){return{units:[{id:'10000000-0000-0000-0000-000000000001',name:'Administração Central'},{id:'10000000-0000-0000-0000-000000000002',name:'Núcleo de Atenção ao Servidor'},{id:'10000000-0000-0000-0000-000000000003',name:'Tecnologia da Informação'}],sectors:['Administrativo','Assistência','Tecnologia']};}
  const {data,error}=await supabase.rpc('get_manager_filter_options');if(error)throw error;return (data??{units:[],sectors:[]}) as ManagerFilterOptions;
}

export async function getManagerDashboard(days=30,unitId:string|null=null,sector:string|null=null):Promise<DashboardData>{
  if(DEMO_MODE){await wait();return demoDashboard;}
  const {data,error}=await supabase.rpc('get_manager_dashboard',{p_days:days,p_unit_id:unitId,p_sector:sector});
  if(error)throw error;return data as DashboardData;
}

export async function getAdminUsers():Promise<AdminUser[]>{
  if(DEMO_MODE){await wait();return[
    {id:'u1',full_name:'Servidor(a) SES-SE',role:'worker',unit_name:'Administração Central',sector:'Administrativo',active:true},
    {id:'u2',full_name:'Profissional de Saúde',role:'professional',unit_name:'Núcleo de Atenção ao Servidor',sector:'NAS',active:true},
    {id:'u3',full_name:'Gestão SES-SE',role:'manager',unit_name:'Administração Central',sector:'Gestão',active:true},
    {id:'u4',full_name:'Administrador Viva Mais',role:'admin',unit_name:'Tecnologia da Informação',sector:'TI',active:true},
  ];}
  const {data,error}=await supabase.from('profiles').select('id,full_name,role,unit_id,sector,active,unit:units(name)').order('full_name');
  if(error)throw error;return (data??[]).map((r:any)=>({id:r.id,full_name:r.full_name,role:r.role,unit_id:r.unit_id,unit_name:r.unit?.name??null,sector:r.sector??null,active:r.active})) as AdminUser[];
}

export async function adminSetRole(userId:string,role:UserRole){if(DEMO_MODE){await wait();return;}const {error}=await supabase.rpc('admin_set_user_role',{p_user_id:userId,p_role:role,p_unit_id:null});if(error)throw error;}

export async function adminCreateContent(input:{title:string;excerpt:string;body:string;category:ContentCategory;format:ContentFormat;duration_minutes:number;image_url:string;external_url?:string|null;media_url?:string|null}){
  if(DEMO_MODE){await wait();return;}
  const {data:u,error:ue}=await supabase.auth.getUser();if(ue)throw ue;if(!u.user)throw new Error('Sessão expirada.');
  const {data:p,error:pe}=await supabase.from('profiles').select('organization_id').eq('id',u.user.id).single();if(pe)throw pe;if(!p?.organization_id)throw new Error('Organização do usuário não encontrada.');
  const {error}=await supabase.from('contents').insert({...input,organization_id:p.organization_id,created_by:u.user.id,published:true,published_at:new Date().toISOString(),official_guide:false,audience:'all'});if(error)throw error;
}

export async function adminCreateCampaign(input:{title:string;description:string;starts_at:string;ends_at:string;image_url:string}){
  if(DEMO_MODE){await wait();return;}
  const {data:u,error:ue}=await supabase.auth.getUser();if(ue)throw ue;if(!u.user)throw new Error('Sessão expirada.');
  const {data:p,error:pe}=await supabase.from('profiles').select('organization_id').eq('id',u.user.id).single();if(pe)throw pe;if(!p?.organization_id)throw new Error('Organização do usuário não encontrada.');
  const {error}=await supabase.from('campaigns').insert({...input,organization_id:p.organization_id,cta_label:'Participar',active:true});if(error)throw error;
}

const defaultHydrationPreferences: HydrationPreferences = {daily_goal_ml:2000,serving_ml:250,routine_start:'08:00',routine_end:'18:00',interval_minutes:120,channel:'app',email:null,timezone:'America/Maceio',enabled:true};

export async function getHydrationPreferences(): Promise<HydrationPreferences> {
  if (DEMO_MODE) { await wait(); return defaultHydrationPreferences; }
  const { data: u } = await supabase.auth.getUser(); if (!u.user) throw new Error('Sessão expirada.');
  const { data, error } = await supabase.from('hydration_preferences').select('daily_goal_ml,serving_ml,routine_start,routine_end,interval_minutes,channel,email,timezone,enabled').eq('user_id', u.user.id).maybeSingle();
  if (error) throw error; if (data) return data as HydrationPreferences;
  return { ...defaultHydrationPreferences, email: u.user.email ?? null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Maceio' };
}

export async function saveHydrationPreferences(input: HydrationPreferences) {
  if (DEMO_MODE) { await wait(); return; }
  const { data: u } = await supabase.auth.getUser(); if (!u.user) throw new Error('Sessão expirada.');
  const emailChannel = input.channel === 'email' || input.channel === 'both';
  const { error } = await supabase.from('hydration_preferences').upsert({user_id:u.user.id,...input,email:emailChannel?input.email:null,email_opt_in_at:emailChannel?new Date().toISOString():null},{onConflict:'user_id'});
  if (error) throw error;
}
