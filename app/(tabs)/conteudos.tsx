import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ContentCard } from '@/components/ContentCard';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii } from '@/constants/theme';
import { getContents } from '@/lib/repository';
import { LearningContent } from '@/types/domain';

const filters = [
  { key: 'all', label: 'Tudo' },
  { key: 'nutrition', label: 'Nutrição' },
  { key: 'movement', label: 'Movimento' },
  { key: 'wellbeing', label: 'Bem-estar' },
  { key: 'mental_health', label: 'Saúde mental' },
  { key: 'ergonomics', label: 'Ergonomia' },
];

export default function Contents() {
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<LearningContent[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => { getContents().then(setItems); }, []);
  const filtered = useMemo(() => items.filter((item) => filter === 'all' || item.category === filter), [items, filter]);
  const basis = width < 650 ? '100%' : width < 1080 ? '47%' : '31%';

  return (
    <Page>
      <SectionTitle title="Informação e Formação" subtitle="Conteúdos objetivos para a rotina de trabalho." />
      <View style={styles.info}><Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} /><Text style={styles.infoText}>O Viva Mais prioriza promoção e educação em saúde. Não há contador de calorias, prontuário, diário alimentar ou registro de peso.</Text></View>
      <View style={styles.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, filter === item.key && styles.active]}><Text style={[styles.filterText, filter === item.key && styles.activeText]}>{item.label}</Text></Pressable>)}</View>
      <View style={styles.grid}>{filtered.map((item) => <View key={item.id} style={[styles.gridItem, { flexBasis: basis as any }]}><ContentCard item={item} onPress={() => router.push(`/conteudo/${item.id}`)} /></View>)}</View>
    </Page>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', gap: 10, backgroundColor: colors.primarySoft, padding: 14, borderRadius: radii.md, alignItems: 'flex-start' },
  infoText: { flex: 1, color: colors.primaryDark, fontSize: 12, lineHeight: 18 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  activeText: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'stretch' },
  gridItem: { flexGrow: 1, minWidth: 0 },
});
