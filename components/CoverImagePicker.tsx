import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { colors, radii } from '@/constants/theme';
import { pickAndUploadPublicImage } from '@/lib/mediaUpload';

export function CoverImagePicker({
  value,
  options,
  onChange,
  folder,
  label = 'Imagem de capa',
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  folder: 'services' | 'contents';
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function importImage() {
    try {
      setUploading(true);
      const uri = await pickAndUploadPublicImage(folder);
      if (uri) onChange(uri);
    } catch (error: any) {
      Alert.alert('Não foi possível importar', error?.message ?? 'Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  const imported = value && !options.includes(value);

  return <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.help}>Selecione uma imagem sugerida ou importe uma foto do dispositivo. A escolha é sempre manual.</Text>
    <View style={styles.grid}>
      {options.map((uri) => <AnimatedPressable key={uri} onPress={() => onChange(uri)} style={[styles.option, value === uri && styles.active]}>
        <Image source={{ uri }} style={styles.image} />
        {value === uri ? <View style={styles.check}><Ionicons name="checkmark" size={16} color="#fff" /></View> : null}
      </AnimatedPressable>)}
      {imported ? <View style={[styles.option, styles.active]}><Image source={{ uri: value }} style={styles.image}/><View style={styles.check}><Ionicons name="checkmark" size={16} color="#fff" /></View></View> : null}
    </View>
    <AnimatedPressable onPress={importImage} disabled={uploading} style={styles.importButton}>
      {uploading ? <ActivityIndicator color={colors.primary}/> : <Ionicons name="cloud-upload-outline" size={18} color={colors.primary}/>} 
      <Text style={styles.importText}>{uploading ? 'Enviando imagem...' : 'Importar foto do dispositivo'}</Text>
    </AnimatedPressable>
  </View>;
}

const styles = StyleSheet.create({
  wrap:{gap:8},label:{fontSize:11,fontWeight:'900',color:colors.textMuted},help:{fontSize:10,lineHeight:15,color:colors.textMuted},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:8},option:{width:104,height:78,borderRadius:13,overflow:'hidden',borderWidth:2,borderColor:'transparent',position:'relative',backgroundColor:colors.primarySoft},active:{borderColor:colors.primary},image:{width:'100%',height:'100%'},check:{position:'absolute',right:5,top:5,width:24,height:24,borderRadius:12,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},
  importButton:{minHeight:44,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:13,borderWidth:1,borderColor:colors.borderStrong,borderRadius:radii.md,backgroundColor:colors.surface},importText:{fontSize:11,fontWeight:'900',color:colors.primary},
});
