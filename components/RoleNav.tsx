import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const byRole = {
  professional: [
    {label:'Visão geral',href:'/profissional',icon:'grid-outline'},
    {label:'Atividades e agenda',href:'/profissional/atividades',icon:'calendar-outline'},
    {label:'Presenças',href:'/profissional/presencas',icon:'people-outline'},
  ],
  manager: [{label:'Painel gerencial',href:'/gestao',icon:'bar-chart-outline'}],
  admin: [
    {label:'Administração',href:'/admin',icon:'settings-outline'},
    {label:'Usuários',href:'/admin/usuarios',icon:'people-outline'},
    {label:'Conteúdo e campanhas',href:'/admin/conteudo',icon:'megaphone-outline'},
  ],
} as const;

export function RoleNav(){
  const {profile,signOut}=useAuth(); const path=usePathname();
  if(!profile || profile.role==='worker') return null;
  const items=(byRole as any)[profile.role] ?? [];
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{items.map((it:any)=>{const active=path===it.href || (it.href!=='/admin'&&it.href!=='/profissional'&&path.startsWith(it.href));return <Pressable key={it.href} onPress={()=>router.push(it.href)} style={[styles.item,active&&styles.active]}><Ionicons name={it.icon} size={17} color={active?colors.primary:colors.textMuted}/><Text style={[styles.text,active&&styles.textActive]}>{it.label}</Text></Pressable>})}<Pressable onPress={async()=>{await signOut();router.replace('/')}} style={styles.item}><Ionicons name="log-out-outline" size={17} color={colors.danger}/><Text style={[styles.text,{color:colors.danger}]}>Sair</Text></Pressable><View style={{width:4}}/></ScrollView>;
}
const styles=StyleSheet.create({row:{gap:8,paddingBottom:2},item:{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:12,paddingVertical:9,borderRadius:radii.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},active:{backgroundColor:colors.primarySoft,borderColor:'#B9DDD3'},text:{fontSize:12,fontWeight:'800',color:colors.textMuted},textActive:{color:colors.primaryDark}});
