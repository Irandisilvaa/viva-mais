import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { CoverImagePicker } from '@/components/CoverImagePicker';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii } from '@/constants/theme';
import { getContentImageOptions } from '@/lib/contentImages';
import { createProfessionalContent } from '@/lib/repository';
import { ContentCategory, ContentFormat } from '@/types/domain';

const categories:{value:ContentCategory;label:string}[]=[
  {value:'nutrition',label:'Nutrição'},{value:'movement',label:'Movimento'},{value:'wellbeing',label:'Bem-estar'},{value:'mental_health',label:'Saúde mental'},{value:'ergonomics',label:'Ergonomia'},
];
const formats:{value:ContentFormat;label:string}[]=[
  {value:'article',label:'Artigo'},{value:'guide',label:'Guia'},{value:'recipe',label:'Receita'},{value:'video',label:'Vídeo'},{value:'audio',label:'Áudio'},
];

function Field({label,value,onChange,placeholder,multiline=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;multiline?:boolean}){
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8A9994" style={[styles.input,multiline&&styles.textarea]} multiline={multiline} autoCapitalize={label.toLowerCase().includes('link')?'none':'sentences'}/></View>;
}

function optionalUrl(value:string,label:string){
  if(!value.trim()) return null;
  try{const u=new URL(value.trim()); if(!['http:','https:'].includes(u.protocol))throw new Error();return u.toString();}catch{throw new Error(`${label} deve começar com http:// ou https://`);}
}

export default function ProfessionalContents(){
  const {width}=useWindowDimensions(); const mobile=width<760;
  const [title,setTitle]=useState(''); const [excerpt,setExcerpt]=useState(''); const [body,setBody]=useState('');
  const [category,setCategory]=useState<ContentCategory>('wellbeing'); const [format,setFormat]=useState<ContentFormat>('article');
  const [duration,setDuration]=useState('4'); const [externalUrl,setExternalUrl]=useState(''); const [mediaUrl,setMediaUrl]=useState('');
  const [imageUrl,setImageUrl]=useState(getContentImageOptions('wellbeing')[0]); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false);

  async function publish(){
    try{
      if(!title.trim()||!excerpt.trim()||!body.trim()) throw new Error('Preencha título, resumo e conteúdo.');
      setSaving(true); setSaved(false);
      await createProfessionalContent({title:title.trim(),excerpt:excerpt.trim(),body:body.trim(),category,format,duration_minutes:Number(duration)||4,image_url:imageUrl,external_url:optionalUrl(externalUrl,'O link externo'),media_url:optionalUrl(mediaUrl,'O link de mídia')});
      setSaved(true); setTitle('');setExcerpt('');setBody('');setExternalUrl('');setMediaUrl('');
      Alert.alert('Conteúdo publicado','A atividade educativa já está disponível na biblioteca dos trabalhadores.');
    }catch(e:any){Alert.alert('Não foi possível publicar',e?.message??'Revise os campos.');}finally{setSaving(false);}
  }

  return <Page><SectionTitle title="Atividade educativa" subtitle="Profissionais responsáveis também podem publicar conteúdos educativos para os trabalhadores."/>
    <View style={[styles.layout,mobile&&styles.layoutMobile]}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Novo conteúdo</Text>
        <Field label="Título" value={title} onChange={setTitle} placeholder="Ex.: Pausas ativas no expediente"/>
        <Field label="Resumo" value={excerpt} onChange={setExcerpt} placeholder="Uma frase curta para o card da biblioteca" multiline/>
        <Field label="Descrição / conteúdo" value={body} onChange={setBody} placeholder="Escreva o conteúdo educativo. Você pode citar links e materiais complementares nos campos abaixo." multiline/>
        <View style={[styles.twoCols,mobile&&styles.layoutMobile]}><Field label="Tempo estimado (min)" value={duration} onChange={setDuration} placeholder="4"/><Field label="Link externo (opcional)" value={externalUrl} onChange={setExternalUrl} placeholder="https://..."/></View>
        <Field label="Link de mídia complementar (opcional)" value={mediaUrl} onChange={setMediaUrl} placeholder="https://... imagem, vídeo, áudio ou material"/>
        <Text style={styles.label}>Categoria</Text><View style={styles.chips}>{categories.map(c=><AnimatedPressable key={c.value} onPress={()=>{setCategory(c.value);setImageUrl(getContentImageOptions(c.value)[0]);}} style={[styles.chip,category===c.value&&styles.chipActive]}><Text style={[styles.chipText,category===c.value&&styles.chipTextActive]}>{c.label}</Text></AnimatedPressable>)}</View>
        <Text style={styles.label}>Formato</Text><View style={styles.chips}>{formats.map(f=><AnimatedPressable key={f.value} onPress={()=>setFormat(f.value)} style={[styles.chip,format===f.value&&styles.chipActive]}><Text style={[styles.chipText,format===f.value&&styles.chipTextActive]}>{f.label}</Text></AnimatedPressable>)}</View>
        <CoverImagePicker value={imageUrl} options={getContentImageOptions(category)} onChange={setImageUrl} folder="contents" label="Foto de capa"/>
        {saved?<View style={styles.saved}><Ionicons name="checkmark-circle" size={20} color={colors.primary}/><Text style={styles.savedText}>Conteúdo publicado com sucesso.</Text></View>:null}
        <AnimatedPressable onPress={publish} disabled={saving} style={styles.primary}><Ionicons name="cloud-upload-outline" size={18} color="#fff"/><Text style={styles.primaryText}>{saving?'Publicando...':'Publicar atividade educativa'}</Text></AnimatedPressable>
      </View>
      <View style={styles.helpPanel}><Ionicons name="information-circle-outline" size={25} color={colors.primary}/><Text style={styles.helpTitle}>O que pode ser incluído?</Text><Text style={styles.helpText}>Texto educativo, links oficiais, imagem de capa importada, vídeo, áudio ou outro material complementar por URL. A publicação aparece na mesma biblioteca acessada pelo trabalhador.</Text><Text style={styles.helpTitle}>Responsabilidade</Text><Text style={styles.helpText}>O conteúdo fica identificado internamente pelo usuário que o criou. O profissional só pode editar/publicar conteúdos dentro da sua organização e o administrador mantém a gestão global.</Text></View>
    </View>
  </Page>;
}

const styles=StyleSheet.create({layout:{flexDirection:'row',gap:14,alignItems:'flex-start'},layoutMobile:{flexDirection:'column'},panel:{flex:1.5,width:'100%',backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:11},helpPanel:{flex:0.7,width:'100%',backgroundColor:colors.primarySofter,borderWidth:1,borderColor:colors.border,borderRadius:radii.lg,padding:18,gap:9},panelTitle:{fontSize:18,fontWeight:'900',color:colors.text},field:{flex:1,gap:5},label:{fontSize:11,fontWeight:'900',color:colors.textMuted},input:{minHeight:46,borderWidth:1,borderColor:colors.borderStrong,borderRadius:radii.md,paddingHorizontal:12,paddingVertical:10,color:colors.text,backgroundColor:'#FCFEFD'},textarea:{minHeight:92,textAlignVertical:'top'},twoCols:{flexDirection:'row',gap:10},chips:{flexDirection:'row',flexWrap:'wrap',gap:7},chip:{borderWidth:1,borderColor:colors.border,borderRadius:radii.pill,paddingHorizontal:10,paddingVertical:8},chipActive:{backgroundColor:colors.primary,borderColor:colors.primary},chipText:{fontSize:11,fontWeight:'800',color:colors.textMuted},chipTextActive:{color:'#fff'},primary:{minHeight:50,borderRadius:radii.md,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},primaryText:{color:'#fff',fontWeight:'900'},saved:{flexDirection:'row',gap:8,alignItems:'center',padding:11,borderRadius:radii.md,backgroundColor:colors.primarySoft},savedText:{fontSize:11,fontWeight:'900',color:colors.primaryDark},helpTitle:{fontWeight:'900',color:colors.primaryDark,fontSize:13},helpText:{fontSize:11,lineHeight:18,color:colors.textMuted}});
