import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppLogo } from '@/components/AppLogo';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const menus:any={
 worker:[{label:'Início',href:'/(tabs)',icon:'home-outline'},{label:'Agendar',href:'/(tabs)/agendar',icon:'calendar-outline'},{label:'Conteúdos',href:'/(tabs)/conteudos',icon:'library-outline'},{label:'Bem-estar',href:'/(tabs)/bem-estar',icon:'pulse-outline'},{label:'Perfil',href:'/(tabs)/perfil',icon:'person-outline'}],
 professional:[{label:'Visão geral',href:'/profissional',icon:'grid-outline'},{label:'Atividades e agenda',href:'/profissional/atividades',icon:'calendar-outline'},{label:'Presenças',href:'/profissional/presencas',icon:'people-outline'}],
 manager:[{label:'Painel gerencial',href:'/gestao',icon:'bar-chart-outline'}],
 admin:[{label:'Administração',href:'/admin',icon:'settings-outline'},{label:'Usuários e perfis',href:'/admin/usuarios',icon:'people-outline'},{label:'Conteúdo e campanhas',href:'/admin/conteudo',icon:'megaphone-outline'}],
};
export function WebSidebar(){
  const {width}=useWindowDimensions(); const path=usePathname(); const {profile}=useAuth();
  if(Platform.OS!=='web'||width<1120||!profile) return null;
  const items=menus[profile.role]??[];
  return <View style={styles.sidebar}><AppLogo/><View style={styles.role}><Text style={styles.roleEyebrow}>PERFIL ATUAL</Text><Text style={styles.roleText}>{profile.role==='worker'?'Trabalhador':profile.role==='professional'?'Profissional responsável':profile.role==='manager'?'Gestão':'Administrador'}</Text></View><View style={styles.menu}>{items.map((it:any)=>{const active=path===it.href || (it.href!=='/(tabs)'&&it.href!=='/profissional'&&it.href!=='/admin'&&path.startsWith(it.href));return <Pressable key={it.href} onPress={()=>router.push(it.href)} style={[styles.item,active&&styles.itemActive]}><View style={[styles.iconWrap,active&&styles.iconWrapActive]}><Ionicons name={it.icon} size={19} color={active?colors.primary:colors.textMuted}/></View><Text style={[styles.label,active&&styles.labelActive]}>{it.label}</Text></Pressable>})}</View><View style={styles.privacyBox}><Ionicons name="shield-checkmark-outline" size={20} color={colors.primary}/><Text style={styles.privacyTitle}>Privacidade por desenho</Text><Text style={styles.privacyText}>{profile.role==='manager'?'A gestão acessa somente indicadores consolidados.':'Acesso limitado ao necessário para cada perfil.'}</Text></View></View>;
}
const styles=StyleSheet.create({sidebar:{width:250,paddingHorizontal:20,paddingTop:24,paddingBottom:20,backgroundColor:colors.surface,borderRightWidth:1,borderRightColor:colors.border,height:'100vh' as any},role:{marginTop:22,padding:12,borderRadius:radii.md,backgroundColor:colors.primarySofter},roleEyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1,color:colors.textMuted},roleText:{fontSize:12,fontWeight:'900',color:colors.primaryDark,marginTop:4},menu:{marginTop:18,gap:7},item:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8,paddingHorizontal:9,borderRadius:radii.md},itemActive:{backgroundColor:colors.primarySofter},iconWrap:{width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center'},iconWrapActive:{backgroundColor:colors.primarySoft},label:{color:colors.textMuted,fontSize:14,fontWeight:'700',flex:1},labelActive:{color:colors.primaryDark,fontWeight:'900'},privacyBox:{marginTop:'auto',borderRadius:radii.lg,padding:14,backgroundColor:colors.primarySofter,borderWidth:1,borderColor:colors.border,gap:5},privacyTitle:{color:colors.primaryDark,fontSize:12,fontWeight:'900'},privacyText:{color:colors.textMuted,fontSize:11,lineHeight:16}});
