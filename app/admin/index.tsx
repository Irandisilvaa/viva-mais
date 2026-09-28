import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { StatCard } from '@/components/StatCard';
import { colors, radii } from '@/constants/theme';
import { getAdminUsers, getCampaigns, getContents, getServices } from '@/lib/repository';

export default function AdminHome(){
 const [counts,setCounts]=useState({users:0,services:0,contents:0,campaigns:0});
 useEffect(()=>{Promise.all([getAdminUsers(),getServices(),getContents(),getCampaigns()]).then(([u,s,c,ca])=>setCounts({users:u.length,services:s.length,contents:c.length,campaigns:ca.length}));},[]);
 return <Page><SectionTitle title="Administração da plataforma" subtitle="Gestão operacional de usuários, perfis, serviços, conteúdos e campanhas."/><View style={styles.stats}><StatCard label="Usuários" value={String(counts.users)} icon="people-outline"/><StatCard label="Serviços" value={String(counts.services)} icon="medkit-outline"/><StatCard label="Conteúdos" value={String(counts.contents)} icon="library-outline"/><StatCard label="Campanhas ativas" value={String(counts.campaigns)} icon="megaphone-outline"/></View><View style={styles.actions}><AnimatedPressable onPress={()=>router.push('/admin/usuarios')} style={styles.action}><View style={styles.icon}><Ionicons name="people-outline" size={25} color={colors.primary}/></View><Text style={styles.title}>Usuários e perfis</Text><Text style={styles.text}>Defina trabalhador, profissional responsável, gestão ou administrador.</Text></AnimatedPressable><AnimatedPressable onPress={()=>router.push('/admin/conteudo')} style={styles.action}><View style={styles.icon}><Ionicons name="library-outline" size={25} color={colors.primary}/></View><Text style={styles.title}>Conteúdos e campanhas</Text><Text style={styles.text}>Publique materiais educativos e campanhas institucionais.</Text></AnimatedPressable></View><View style={styles.note}><Text style={styles.noteTitle}>Separação de responsabilidades</Text><Text style={styles.noteText}>O administrador opera a plataforma. O profissional gerencia apenas as atividades sob sua responsabilidade. A gestão recebe indicadores consolidados e o trabalhador acessa seus próprios dados.</Text></View></Page>;
}
const styles=StyleSheet.create({stats:{flexDirection:'row',flexWrap:'wrap',gap:12},actions:{flexDirection:'row',flexWrap:'wrap',gap:12},action:{flex:1,minWidth:280,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:8},icon:{width:48,height:48,borderRadius:16,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},title:{fontSize:16,fontWeight:'900',color:colors.text},text:{fontSize:12,lineHeight:18,color:colors.textMuted},note:{padding:16,borderRadius:radii.lg,backgroundColor:colors.primarySofter,borderWidth:1,borderColor:colors.border},noteTitle:{fontWeight:'900',color:colors.primaryDark},noteText:{fontSize:11,lineHeight:17,color:colors.textMuted,marginTop:4}});
