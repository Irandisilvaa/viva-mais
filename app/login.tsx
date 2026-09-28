import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AppLogo } from '@/components/AppLogo';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/domain';

const roleCards: {role:UserRole; title:string; text:string; icon:any}[] = [
  { role:'worker', title:'Trabalhador', text:'Agendamentos, conteúdos e bem-estar.', icon:'person-outline' },
  { role:'professional', title:'Profissional responsável', text:'Atividades, vagas, agenda, presença e justificativas.', icon:'medkit-outline' },
  { role:'manager', title:'Gestão', text:'Indicadores consolidados e relatórios.', icon:'bar-chart-outline' },
  { role:'admin', title:'Administrador', text:'Usuários, perfis, serviços, conteúdos e campanhas.', icon:'settings-outline' },
];

export default function Login() {
  const { width, height } = useWindowDimensions();
  const { isDemo, signIn, signUp, enterDemo } = useAuth();
  const [mode,setMode]=useState<'signin'|'signup'>('signin');
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const split = width >= 980;

  async function submit(){
    try{ setBusy(true); setError(''); if(!email.trim()||!password) throw new Error('Informe e-mail e senha.'); if(mode==='signup'&&!name.trim()) throw new Error('Informe seu nome.');
      if(mode==='signup') await signUp(name,email,password); else await signIn(email,password); router.replace('/portal');
    }catch(e:any){ setError(e?.message ?? 'Não foi possível entrar.'); }finally{ setBusy(false); }
  }
  async function demo(role:UserRole){ await enterDemo(role); router.replace('/portal'); }

  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView contentContainerStyle={[styles.scroll,{minHeight:height}]} keyboardShouldPersistTaps="handled">
      <View style={[styles.shell,!split&&styles.shellSingle]}>
        {split && <ImageBackground source={{uri:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=84'}} style={styles.visual} imageStyle={styles.visualImage}>
          <View style={styles.overlay}/><View style={styles.visualContent}><Text style={styles.kicker}>VIVA MAIS</Text><Text style={styles.hero}>Saúde do trabalhador em uma experiência simples e integrada.</Text><Text style={styles.heroSub}>Quatro perfis, uma única plataforma: trabalhador, profissional, gestão e administração.</Text></View>
        </ImageBackground>}
        <View style={styles.formArea}><View style={styles.card}><AppLogo/><View><Text style={styles.title}>{isDemo?'Escolha um perfil':'Bem-vindo(a)'}</Text><Text style={styles.subtitle}>{isDemo?'Explore o MVP sem gravar dados reais.':'Acesse sua conta institucional.'}</Text></View>
          {isDemo ? <View style={styles.roles}>{roleCards.map(r=><AnimatedPressable key={r.role} onPress={()=>demo(r.role)} style={styles.roleCard}><View style={styles.roleIcon}><Ionicons name={r.icon} size={22} color={colors.primary}/></View><View style={{flex:1}}><Text style={styles.roleTitle}>{r.title}</Text><Text style={styles.roleText}>{r.text}</Text></View><Ionicons name="arrow-forward" size={18} color={colors.primary}/></AnimatedPressable>)}</View>
          : <View style={styles.fields}>{mode==='signup'&&<TextInput value={name} onChangeText={setName} placeholder="Nome completo" placeholderTextColor="#87958F" style={styles.input}/>}<TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="E-mail institucional" placeholderTextColor="#87958F" style={styles.input}/><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Senha" placeholderTextColor="#87958F" style={styles.input}/>{error?<View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={17} color={colors.danger}/><Text style={styles.error}>{error}</Text></View>:null}<AnimatedPressable onPress={submit} disabled={busy} style={styles.button}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>{mode==='signin'?'Entrar':'Criar conta'}</Text>}</AnimatedPressable><Pressable onPress={()=>setMode(mode==='signin'?'signup':'signin')}><Text style={styles.switch}>{mode==='signin'?'Primeiro acesso? Criar conta':'Já tenho conta'}</Text></Pressable><Pressable onPress={()=>router.replace('/')}><Text style={styles.back}>← Voltar para a apresentação do Viva Mais</Text></Pressable></View>}
        </View></View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles=StyleSheet.create({
  page:{flex:1,backgroundColor:colors.background},scroll:{flexGrow:1,justifyContent:'center',padding:18},shell:{width:'100%',maxWidth:1380,alignSelf:'center',flexDirection:'row',gap:22},shellSingle:{maxWidth:680},visual:{flex:1.15,minHeight:720,borderRadius:32,overflow:'hidden',justifyContent:'flex-end',...shadow},visualImage:{borderRadius:32},overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(5,61,51,.56)'},visualContent:{padding:44,gap:14},kicker:{color:'#DDF8EF',fontWeight:'900',letterSpacing:2},hero:{color:'#fff',fontWeight:'900',fontSize:44,lineHeight:49,maxWidth:610},heroSub:{color:'#EAF7F2',fontSize:16,lineHeight:24,maxWidth:560},formArea:{flex:0.85,justifyContent:'center'},card:{backgroundColor:colors.surface,borderRadius:30,borderWidth:1,borderColor:colors.border,padding:28,gap:22,...shadow},title:{fontSize:30,fontWeight:'900',color:colors.text},subtitle:{color:colors.textMuted,marginTop:5},roles:{gap:10},roleCard:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:14,backgroundColor:'#fff'},roleIcon:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.primarySoft},roleTitle:{fontWeight:'900',color:colors.text,fontSize:14},roleText:{color:colors.textMuted,fontSize:11,lineHeight:16,marginTop:2},fields:{gap:12},input:{minHeight:52,borderWidth:1,borderColor:colors.borderStrong,borderRadius:radii.md,paddingHorizontal:14,color:colors.text,backgroundColor:'#FCFEFD'},errorBox:{flexDirection:'row',gap:7,alignItems:'center'},error:{color:colors.danger,fontSize:12,flex:1},button:{minHeight:52,borderRadius:radii.md,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},buttonText:{color:'#fff',fontWeight:'900'},switch:{color:colors.primary,fontWeight:'900',textAlign:'center',padding:6},back:{color:colors.textMuted,fontWeight:'800',textAlign:'center',padding:6,fontSize:11}
});
