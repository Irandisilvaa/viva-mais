import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { ServiceCard } from '@/components/ServiceCard';
import { colors, radii } from '@/constants/theme';
import { getServices } from '@/lib/repository';
import { HealthService } from '@/types/domain';

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'nutrition', label: 'Nutrição' },
  { key: 'physical_activity', label: 'Movimento' },
  { key: 'ergonomics', label: 'Ergonomia' },
];

export default function Scheduling() {
  const { width } = useWindowDimensions();
  const [services, setServices] = useState<HealthService[]>([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  useEffect(() => { getServices().then(setServices); }, []);

  const filtered = useMemo(() => services.filter((s) => (filter === 'all' || s.category === filter) && `${s.title} ${s.description}`.toLowerCase().includes(query.toLowerCase())), [services, filter, query]);
  const basis = width < 650 ? '100%' : width < 1080 ? '47%' : '31%';

  return (
    <Page>
      <View style={styles.headerRow}>
        <View style={styles.headerText}><SectionTitle title="Agendar" subtitle="Escolha um serviço e encontre um horário disponível." /></View>
        <View style={styles.helper}><Ionicons name="time-outline" size={16} color={colors.primary} /><Text style={styles.helperText}>Fluxo rápido, sem dados clínicos.</Text></View>
      </View>
      <View style={styles.search}><Ionicons name="search-outline" size={19} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar serviço" placeholderTextColor="#87958F" style={styles.input} /></View>
      <View style={styles.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, filter === item.key && styles.filterActive]}><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</View>
      <View style={styles.grid}>{filtered.map((service) => <View key={service.id} style={[styles.gridItem, { flexBasis: basis as any }]}><ServiceCard service={service} onPress={() => router.push(`/servico/${service.id}`)} /></View>)}</View>
      {filtered.length === 0 && <View style={styles.empty}><Ionicons name="calendar-outline" size={34} color={colors.textMuted} /><Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text><Text style={styles.emptyText}>Tente outro termo ou filtro.</Text></View>}
    </Page>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' },
  headerText: { flex: 1, minWidth: 250 },
  helper: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8 },
  helperText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: 14, minHeight: 50 },
  input: { flex: 1, color: colors.text, fontSize: 14, minWidth: 0 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  filterTextActive: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'stretch' },
  gridItem: { flexGrow: 1, minWidth: 0 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  emptyText: { color: colors.textMuted, fontSize: 13 },
});
