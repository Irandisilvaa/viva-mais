import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { StatCard } from '@/components/StatCard';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getProfessionalOverview, getProfessionalServices } from '@/lib/repository';
import { HealthService, ProfessionalOverview } from '@/types/domain';

export default function ProfessionalHome(){
 const {profile}=useAuth(); const {width}=useWindowDimensions();
 const [overview,setOverview]=useState<ProfessionalOverview>({services:0,upcoming_slots:0,total_capacity:0,booked:0});
 const [services,setServices]=useState<HealthService[]>([]);
 useEffect(()=>{getProfessionalOverview().then(setOverview);getProfessionalServices().then(setServices);},[]);
 const next=services.flatMap(s=>s.slots.map(sl=>({...sl,service:s.title}))).filter(s=>new Date(s.starts_at)>new Date()).sort((a,b)=>a.starts_at.localeCompare(b.starts_at)).slice(0,4);
 return <Page><SectionTitle title={`Olá, ${profile?.full_name?.split(' ')[0] ?? 'profissional'}`} subtitle="Gerencie suas atividades, vagas, agenda e presença dos participantes."/>
 <View style={styles.stats}><StatCard label="Serviços sob sua responsabilidade" value={String(overview.services)} icon="medkit-outline"/><StatCard label="Próximos horários" value={String(overview.upcoming_slots)} icon="calendar-outline"/><StatCard label="Vagas ofertadas" value={String(overview.total_capacity)} icon="people-outline"/><StatCard label="Agendamentos" value={String(overview.booked)} icon="checkmark-circle-outline"/></View>
 <View style={[styles.actions,width<700&&styles.actionsMobile]}><AnimatedPressable onPress={()=>router.push('/profissional/atividades')} style={styles.action}><View style={styles.actionIcon}><Ionicons name="add-circle-outline" size={26} color={colors.primary}/></View><Text style={styles.actionTitle}>Criar atividade e horário</Text><Text style={styles.actionText}>Cadastre serviço, local, data, horário e número de vagas.</Text></AnimatedPressable><AnimatedPressable onPress={()=>router.push('/profissional/presencas')} style={styles.action}><View style={styles.actionIcon}><Ionicons name="people-outline" size={26} color={colors.primary}/></View><Text style={styles.actionTitle}>Presenças e justificativas</Text><Text style={styles.actionText}>Marque presença, falta e consulte justificativas do seu atendimento.</Text></AnimatedPressable></View>
 <Text style={styles.heading}>Próximas atividades</Text><View style={styles.list}>{next.map(x=><View key={x.id} style={styles.row}><View style={styles.dateBox}><Text style={styles.day}>{new Date(x.starts_at).toLocaleDateString('pt-BR',{day:'2-digit'})}</Text><Text style={styles.month}>{new Date(x.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</Text></View><View style={{flex:1}}><Text style={styles.rowTitle}>{x.service}</Text><Text style={styles.rowMeta}>{new Date(x.starts_at).toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · {x.location}</Text></View><Text style={styles.capacity}>{x.booked_count}/{x.capacity}</Text></View>)}{next.length===0&&<Text style={styles.empty}>Nenhum horário futuro cadastrado.</Text>}</View>
 </Page>;
}
const styles=StyleSheet.create({stats:{flexDirection:'row',flexWrap:'wrap',gap:12},actions:{flexDirection:'row',gap:12},actionsMobile:{flexDirection:'column'},action:{flex:1,minWidth:260,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:7,...shadow},actionIcon:{width:48,height:48,borderRadius:16,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},actionTitle:{fontSize:16,fontWeight:'900',color:colors.text},actionText:{fontSize:12,lineHeight:18,color:colors.textMuted},heading:{fontSize:19,fontWeight:'900',color:colors.text},list:{gap:9},row:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:13},dateBox:{width:52,height:52,borderRadius:15,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},day:{fontSize:18,fontWeight:'900',color:colors.primaryDark},month:{fontSize:10,fontWeight:'800',color:colors.textMuted,textTransform:'uppercase'},rowTitle:{fontWeight:'900',color:colors.text},rowMeta:{fontSize:11,color:colors.textMuted,marginTop:3},capacity:{fontWeight:'900',color:colors.primary},empty:{color:colors.textMuted,padding:20,textAlign:'center'}});
