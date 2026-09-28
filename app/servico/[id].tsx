import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { Pill } from '@/components/Pill';
import { colors, radii, shadow } from '@/constants/theme';
import { getBookings, getServices } from '@/lib/repository';
import { Booking, HealthService } from '@/types/domain';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

const categoryLabel: Record<string, string> = {
  nutrition: 'Nutrição', physical_activity: 'Movimento', wellbeing: 'Bem-estar', ergonomics: 'Ergonomia', mental_health: 'Saúde mental',
};

export default function ServiceDetail() {
  const { width } = useWindowDimensions();
  const mobile = width < 620;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<HealthService | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    Promise.all([getServices(), getBookings()])
      .then(([items, userBookings]) => { setService(items.find((item) => item.id === id) ?? null); setBookings(userBookings); })
      .catch((error) => Alert.alert('Não foi possível carregar', error?.message ?? 'Tente novamente.'));
  }, [id]);

  const activeSlots = useMemo(() => new Set(bookings.filter((booking) => booking.status !== 'cancelled').map((booking) => booking.slot_id)), [bookings]);

  if (!service) return <Page narrow><Text style={{ color: colors.textMuted }}>Carregando...</Text></Page>;
  return (
    <Page narrow>
      <AnimatedPressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={19} color={colors.text} /><Text style={styles.backText}>Voltar</Text></AnimatedPressable>
      <Image source={{ uri: service.image_url }} style={[styles.hero, mobile && styles.heroMobile]} />
      <View style={[styles.info, mobile && styles.infoMobile]}>
        <Pill label={categoryLabel[service.category] ?? service.category} />
        <Text style={[styles.title, mobile && styles.titleMobile]}>{service.title}</Text>
        <Text style={styles.description}>{service.description}</Text>
        <View style={styles.meta}><Ionicons name="time-outline" size={18} color={colors.textMuted} /><Text style={styles.metaText}>{service.duration_minutes} min</Text><Ionicons name="person-outline" size={18} color={colors.textMuted} /><Text style={styles.metaText}>{service.professional_name}</Text></View>
      </View>
      <Text style={styles.section}>Próximos horários</Text>
      <View style={styles.slots}>
        {service.slots.map((slot) => {
          const full = slot.booked_count >= slot.capacity;
          const booked = activeSlots.has(slot.id);
          return <View key={slot.id} style={[styles.slot, mobile && styles.slotMobile]}>
            <View style={styles.slotText}><Text style={styles.slotDate}>{formatDate(slot.starts_at)}</Text><Text style={styles.slotMeta}>{slot.location} · {Math.max(0, slot.capacity - slot.booked_count)} vaga(s)</Text></View>
            <AnimatedPressable
              disabled={full || booked}
              onPress={() => router.push({ pathname: '/inscricao/[slotId]', params: { slotId: slot.id } })}
              style={[styles.bookButton, mobile && styles.bookButtonMobile, (full || booked) && styles.bookDisabled]}
            >
              <Text style={styles.bookText}>{booked ? 'Já inscrito(a)' : full ? 'Lotado' : 'Inscrever-se'}</Text>
            </AnimatedPressable>
          </View>;
        })}
      </View>
      <View style={styles.note}><Ionicons name="information-circle-outline" size={19} color={colors.info} /><Text style={styles.noteText}>Ao escolher um horário, você verá um formulário de confirmação antes de reservar a vaga. Nenhum dado clínico é solicitado nessa etapa.</Text></View>
    </Page>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 5 },
  backText: { color: colors.text, fontWeight: '800' },
  hero: { width: '100%', height: 320, borderRadius: radii.lg, backgroundColor: colors.primarySoft },
  heroMobile: { height: 235 },
  info: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: 22, gap: 10, borderWidth: 1, borderColor: colors.border, ...shadow },
  infoMobile: { padding: 17 },
  title: { fontSize: 28, lineHeight: 33, fontWeight: '900', color: colors.text, letterSpacing: -0.8 },
  titleMobile: { fontSize: 24, lineHeight: 29 },
  description: { color: colors.textMuted, lineHeight: 21 },
  meta: { flexDirection: 'row', gap: 7, alignItems: 'center', flexWrap: 'wrap' },
  metaText: { color: colors.textMuted, fontSize: 12, marginRight: 10 },
  section: { color: colors.text, fontSize: 20, fontWeight: '900' },
  slots: { gap: 10 },
  slot: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotMobile: { flexWrap: 'wrap' },
  slotText: { flex: 1, minWidth: 200, gap: 4 },
  slotDate: { color: colors.text, fontWeight: '900', textTransform: 'capitalize' },
  slotMeta: { color: colors.textMuted, fontSize: 12 },
  bookButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10 },
  bookButtonMobile: { width: '100%', alignItems: 'center' },
  bookDisabled: { backgroundColor: '#AEBAB6' },
  bookText: { color: colors.white, fontWeight: '900', fontSize: 12 },
  note: { flexDirection: 'row', gap: 9, backgroundColor: colors.infoSoft, padding: 14, borderRadius: radii.md },
  noteText: { flex: 1, color: '#204C9A', fontSize: 12, lineHeight: 18 },
});
