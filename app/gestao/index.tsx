import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { StatCard } from '@/components/StatCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { colors, radii } from '@/constants/theme';
import { getManagerDashboard } from '@/lib/repository';
import { DashboardData } from '@/types/domain';

export default function ManagerDashboard(){
 const [days,setDays]=useState(30);const [data,setData]=useState<DashboardData|null>(null);
 useEffect(()=>{getManagerDashboard(days).then(setData);},[days]);
 return <Page><SectionTitle title="Painel gerencial" subtitle="Indicadores consolidados para planejamento das ações de saúde do trabalhador."/>
 <View style={styles.filters}>{[7,30,90,365].map(d=><AnimatedPressable key={d} onPress={()=>setDays(d)} style={[styles.filter,days===d&&styles.filterActive]}><Text style={[styles.filterText,days===d&&styles.filterTextActive]}>{d===365?'12 meses':`${d} dias`}</Text></AnimatedPressable>)}</View>
 <View style={styles.stats}><StatCard label="Agendamentos" value={String(data?.total_bookings??0)} icon="calendar-outline"/><StatCard label="Taxa de presença" value={`${data?.attendance_rate??0}%`} icon="checkmark-circle-outline"/><StatCard label="Acessos a conteúdos" value={String(data?.content_views??0)} icon="library-outline"/><StatCard label="Participações em campanhas" value={String(data?.campaign_participants??0)} icon="megaphone-outline"/></View>
 <View style={styles.grid}><View style={styles.card}><Text style={styles.cardTitle}>Procura por categoria</Text>{(data?.bookings_by_category??[]).map(x=><View key={x.label} style={styles.barRow}><Text style={styles.barLabel}>{x.label}</Text><View style={styles.barTrack}><View style={[styles.barFill,{width:`${Math.min(100,x.value/2)}%`} as any]}/></View><Text style={styles.barValue}>{x.value}</Text></View>)}</View><View style={styles.card}><Text style={styles.cardTitle}>Bem-estar</Text><Text style={styles.big}>{data?.wellbeing_average??'—'}</Text><Text style={styles.muted}>Média de humor somente quando há pelo menos 5 respostas no período.</Text><Text style={styles.response}>{data?.wellbeing_responses??0} respostas agregadas</Text></View></View>
 <View style={styles.privacy}><Text style={styles.privacyTitle}>Privacidade da gestão</Text><Text style={styles.privacyText}>Este painel não expõe respostas individuais de bem-estar, justificativas de ausência nem outros dados sensíveis dos trabalhadores.</Text></View>
 </Page>;
}
const styles=StyleSheet.create({filters:{flexDirection:'row',gap:8,flexWrap:'wrap'},filter:{paddingHorizontal:12,paddingVertical:8,borderWidth:1,borderColor:colors.border,borderRadius:radii.pill,backgroundColor:colors.surface},filterActive:{backgroundColor:colors.primary,borderColor:colors.primary},filterText:{fontSize:11,fontWeight:'800',color:colors.textMuted},filterTextActive:{color:'#fff'},stats:{flexDirection:'row',flexWrap:'wrap',gap:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{flex:1,minWidth:300,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:12},cardTitle:{fontWeight:'900',color:colors.text,fontSize:16},barRow:{flexDirection:'row',alignItems:'center',gap:8},barLabel:{width:90,fontSize:11,color:colors.textMuted},barTrack:{flex:1,height:9,borderRadius:99,backgroundColor:colors.primarySoft,overflow:'hidden'},barFill:{height:'100%',backgroundColor:colors.primary,borderRadius:99},barValue:{width:32,textAlign:'right',fontSize:11,fontWeight:'900',color:colors.text},big:{fontSize:42,fontWeight:'900',color:colors.primary},muted:{fontSize:11,lineHeight:17,color:colors.textMuted},response:{fontSize:12,fontWeight:'900',color:colors.text},privacy:{padding:15,borderRadius:radii.lg,backgroundColor:colors.primarySofter,borderWidth:1,borderColor:colors.border},privacyTitle:{fontWeight:'900',color:colors.primaryDark},privacyText:{fontSize:11,lineHeight:17,color:colors.textMuted,marginTop:4}});
