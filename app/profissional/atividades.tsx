import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { CoverImagePicker } from '@/components/CoverImagePicker';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii } from '@/constants/theme';
import { createProfessionalService, createProfessionalSlot, getProfessionalServices, updateProfessionalSlot } from '@/lib/repository';
import { getServiceImageOptions } from '@/lib/serviceImages';
import { HealthService, ServiceCategory } from '@/types/domain';

function Field({label,value,onChange,placeholder,multiline=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;multiline?:boolean}){
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8A9994" style={[styles.input,multiline&&styles.textarea]} multiline={multiline}/></View>;
}

const categories: {value:ServiceCategory;label:string}[] = [
  {value:'nutrition',label:'Nutrição'}, {value:'physical_activity',label:'Atividade física'}, {value:'wellbeing',label:'Bem-estar'}, {value:'ergonomics',label:'Ergonomia'}, {value:'mental_health',label:'Saúde mental'},
];

export default function ProfessionalActivities(){
  const {width}=useWindowDimensions(); const mobile=width<760; const [services,setServices]=useState<HealthService[]>([]);
  const [title,setTitle]=useState('');const [desc,setDesc]=useState('');const [location,setLocation]=useState('');const [duration,setDuration]=useState('30');const [category,setCategory]=useState<ServiceCategory>('wellbeing');const [imageUrl,setImageUrl]=useState(getServiceImageOptions('wellbeing')[0]);
  const [selected,setSelected]=useState('');const [date,setDate]=useState('');const [time,setTime]=useState('');const [capacity,setCapacity]=useState('10');const [slotLocation,setSlotLocation]=useState('');
  async function load(){setServices(await getProfessionalServices());}
  useEffect(()=>{load();},[]);
  async function addService(){try{if(!title||!desc||!location)throw new Error('Preencha título, descrição e local.');await createProfessionalService({title,description:desc,location,duration_minutes:Number(duration)||30,category,image_url:imageUrl});setTitle('');setDesc('');setImageUrl(getServiceImageOptions(category)[0]);Alert.alert('Atividade criada','A atividade foi salva. Agora você pode abrir horários e vagas.');await load();}catch(e:any){Alert.alert('Erro',e.message)}}
  async function addSlot(){try{if(!selected||!date||!time)throw new Error('Selecione a atividade e informe data e horário.');const start=new Date(`${date}T${time}:00`);if(Number.isNaN(start.getTime()))throw new Error('Use data no formato AAAA-MM-DD e horário HH:MM.');const service=services.find(s=>s.id===selected)!;const end=new Date(start.getTime()+service.duration_minutes*60000);await createProfessionalSlot({service_id:selected,starts_at:start.toISOString(),ends_at:end.toISOString(),capacity:Number(capacity)||1,location:slotLocation||service.location||''});Alert.alert('Horário criado','A agenda já está disponível para os trabalhadores.');setDate('');setTime('');await load();}catch(e:any){Alert.alert('Erro',e.message)}}

  return <Page><SectionTitle title="Atividades e agenda" subtitle="Cadastre atividades sob sua responsabilidade, escolha ou importe a foto e abra horários com vagas."/>
    <View style={[styles.columns,mobile&&styles.columnsMobile]}>
      <View style={styles.panel}><Text style={styles.panelTitle}>Nova atividade assistencial ou coletiva</Text>
        <Field label="Título" value={title} onChange={setTitle} placeholder="Ex.: Oficina de pausa ativa"/>
        <Field label="Descrição" value={desc} onChange={setDesc} placeholder="Objetivo, orientações e informações importantes" multiline/>
        <Field label="Local padrão" value={location} onChange={setLocation} placeholder="Ex.: Sala do NAS"/>
        <Field label="Duração (min)" value={duration} onChange={setDuration} placeholder="30"/>
        <Text style={styles.label}>Categoria</Text><View style={styles.chips}>{categories.map(c=><AnimatedPressable key={c.value} onPress={()=>{setCategory(c.value);setImageUrl(getServiceImageOptions(c.value)[0]);}} style={[styles.chip,category===c.value&&styles.chipActive]}><Text style={[styles.chipText,category===c.value&&styles.chipTextActive]}>{c.label}</Text></AnimatedPressable>)}</View>
        <CoverImagePicker value={imageUrl} options={getServiceImageOptions(category)} onChange={setImageUrl} folder="services" label="Imagem da atividade"/>
        <AnimatedPressable onPress={addService} style={styles.primary}><Ionicons name="add" size={18} color="#fff"/><Text style={styles.primaryText}>Criar atividade</Text></AnimatedPressable>
      </View>

      <View style={styles.panel}><Text style={styles.panelTitle}>Abrir horário e vagas</Text><Text style={styles.label}>Atividade</Text><View style={styles.chips}>{services.map(s=><AnimatedPressable key={s.id} onPress={()=>{setSelected(s.id);setSlotLocation(s.location||'')}} style={[styles.chip,selected===s.id&&styles.chipActive]}><Text style={[styles.chipText,selected===s.id&&styles.chipTextActive]}>{s.title}</Text></AnimatedPressable>)}</View><Field label="Data" value={date} onChange={setDate} placeholder="2026-09-30"/><Field label="Horário" value={time} onChange={setTime} placeholder="14:00"/><Field label="Vagas" value={capacity} onChange={setCapacity} placeholder="10"/><Field label="Local" value={slotLocation} onChange={setSlotLocation} placeholder="Sala / setor"/><AnimatedPressable onPress={addSlot} style={styles.primary}><Ionicons name="calendar-outline" size={18} color="#fff"/><Text style={styles.primaryText}>Adicionar à agenda</Text></AnimatedPressable></View>
    </View>
    <Text style={styles.section}>Agenda cadastrada</Text>{services.map(s=><View key={s.id} style={styles.service}><Text style={styles.serviceTitle}>{s.title}</Text><Text style={styles.serviceMeta}>{s.location} · {s.duration_minutes} min</Text><View style={styles.slotList}>{s.slots.map(sl=><View key={sl.id} style={styles.slot}><View style={{flex:1}}><Text style={styles.slotTitle}>{new Date(sl.starts_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</Text><Text style={styles.slotMeta}>{sl.booked_count}/{sl.capacity} vagas ocupadas · {sl.status}</Text></View><AnimatedPressable onPress={()=>updateProfessionalSlot(sl.id,{status:sl.status==='closed'?'open':'closed'}).then(load)} style={styles.secondary}><Text style={styles.secondaryText}>{sl.status==='closed'?'Reabrir':'Fechar'}</Text></AnimatedPressable></View>)}</View></View>)}
  </Page>;
}

const styles=StyleSheet.create({columns:{flexDirection:'row',gap:14,alignItems:'flex-start'},columnsMobile:{flexDirection:'column'},panel:{flex:1,width:'100%',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:10},panelTitle:{fontSize:17,fontWeight:'900',color:colors.text},field:{gap:5},label:{fontSize:11,fontWeight:'900',color:colors.textMuted},input:{minHeight:46,borderWidth:1,borderColor:colors.borderStrong,borderRadius:radii.md,paddingHorizontal:12,paddingVertical:10,color:colors.text,backgroundColor:'#FCFEFD'},textarea:{minHeight:92,textAlignVertical:'top'},chips:{flexDirection:'row',flexWrap:'wrap',gap:7},chip:{borderWidth:1,borderColor:colors.border,borderRadius:radii.pill,paddingHorizontal:10,paddingVertical:8},chipActive:{backgroundColor:colors.primary,borderColor:colors.primary},chipText:{fontSize:11,fontWeight:'800',color:colors.textMuted},chipTextActive:{color:'#fff'},primary:{minHeight:48,borderRadius:radii.md,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:7,marginTop:4},primaryText:{color:'#fff',fontWeight:'900'},section:{fontSize:19,fontWeight:'900',color:colors.text},service:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:16,gap:9},serviceTitle:{fontWeight:'900',fontSize:15,color:colors.text},serviceMeta:{fontSize:11,color:colors.textMuted},slotList:{gap:7},slot:{flexDirection:'row',alignItems:'center',gap:10,padding:11,borderRadius:radii.md,backgroundColor:colors.background},slotTitle:{fontWeight:'800',color:colors.text,fontSize:12},slotMeta:{fontSize:10,color:colors.textMuted,marginTop:2},secondary:{paddingHorizontal:11,paddingVertical:8,borderRadius:radii.pill,backgroundColor:colors.primarySoft},secondaryText:{fontSize:10,fontWeight:'900',color:colors.primaryDark}});
