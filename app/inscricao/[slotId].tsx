import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createBooking, getBookings, getServices } from '@/lib/repository';
import { HealthService, ServiceSlot } from '@/types/domain';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export default function Enrollment() {
  const { width } = useWindowDimensions();
  const mobile = width < 700;
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  const { profile, session } = useAuth();
  const [service, setService] = useState<HealthService | null>(null);
  const [slot, setSlot] = useState<ServiceSlot | null>(null);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServices(), getBookings()])
      .then(([services, bookings]) => {
        for (const item of services) {
          const found = item.slots.find((candidate) => candidate.id === slotId);
          if (found) { setService(item); setSlot(found); break; }
        }
        setAlreadyBooked(bookings.some((booking) => booking.slot_id === slotId && booking.status !== 'cancelled'));
      })
      .catch((error) => Alert.alert('Não foi possível carregar a inscrição', error?.message ?? 'Tente novamente.'))
      .finally(() => setLoading(false));
  }, [slotId]);

  const vacancies = useMemo(() => slot ? Math.max(0, slot.capacity - slot.booked_count) : 0, [slot]);

  async function confirm() {
    if (!slot || !service) return;
    if (!accepted) {
      Alert.alert('Confirmação necessária', 'Marque a confirmação de participação antes de concluir a inscrição.');
      return;
    }
    try {
      setBusy(true);
      const result = await createBooking(slot.id);
      setAlreadyBooked(true);
      Alert.alert(
        result.created ? 'Inscrição confirmada' : 'Você já estava inscrito(a)',
        `${service.title}\n${formatDate(slot.starts_at)}\n\nO agendamento pode ser acompanhado em Perfil → Meus agendamentos.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/perfil') }],
      );
    } catch (error: any) {
      Alert.alert('Não foi possível concluir', error?.message ?? 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Page narrow><View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Carregando inscrição...</Text></View></Page>;
  if (!service || !slot) return <Page narrow><Text style={styles.muted}>Este horário não está mais disponível.</Text></Page>;

  return (
    <Page narrow>
      <AnimatedPressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={19} color={colors.text} />
        <Text style={styles.backText}>Voltar</Text>
      </AnimatedPressable>

      <View style={[styles.header, mobile && styles.headerMobile]}>
        <Image source={{ uri: service.image_url }} style={[styles.image, mobile && styles.imageMobile]} />
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>INSCRIÇÃO NA ATIVIDADE</Text>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={styles.icon}><Ionicons name="calendar-outline" size={22} color={colors.primary} /></View>
          <View style={{ flex: 1 }}><Text style={styles.cardTitle}>Confira os dados da inscrição</Text><Text style={styles.cardSubtitle}>Não solicitamos informações clínicas neste formulário.</Text></View>
        </View>

        <View style={[styles.infoGrid, mobile && styles.infoGridMobile]}>
          <Info label="Trabalhador(a)" value={profile?.full_name ?? 'Usuário'} />
          <Info label="Unidade" value={profile?.unit_name ?? 'Não informada'} />
          <Info label="E-mail" value={session?.user.email ?? 'Conta institucional'} />
          <Info label="Profissional responsável" value={service.professional_name ?? 'Equipe responsável'} />
          <Info label="Data e horário" value={formatDate(slot.starts_at)} />
          <Info label="Local" value={slot.location ?? service.location ?? 'A definir'} />
          <Info label="Duração" value={`${service.duration_minutes} min`} />
          <Info label="Vagas disponíveis" value={`${vacancies} de ${slot.capacity}`} />
        </View>

        <AnimatedPressable onPress={() => setAccepted((value) => !value)} style={[styles.confirmBox, accepted && styles.confirmBoxActive]}>
          <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
            {accepted ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
          </View>
          <Text style={styles.confirmText}>Confirmo que desejo reservar esta vaga e que, caso não possa comparecer, utilizarei o fluxo de cancelamento/reagendamento disponível na plataforma.</Text>
        </AnimatedPressable>

        {alreadyBooked ? (
          <View style={styles.alreadyBox}><Ionicons name="checkmark-circle" size={20} color={colors.primary} /><Text style={styles.alreadyText}>Você já possui uma inscrição ativa neste horário.</Text></View>
        ) : null}

        <AnimatedPressable disabled={busy || alreadyBooked || vacancies <= 0} onPress={confirm} style={[styles.primary, (alreadyBooked || vacancies <= 0) && styles.primaryDisabled]}>
          {busy ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={19} color="#fff" /><Text style={styles.primaryText}>{alreadyBooked ? 'Já inscrito(a)' : vacancies <= 0 ? 'Sem vagas' : 'Confirmar inscrição'}</Text></>}
        </AnimatedPressable>
      </View>

      <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} /><Text style={styles.privacyText}>Para esta inscrição, o Viva Mais utiliza apenas dados de identificação da conta e informações do agendamento. Não há campo para diagnóstico, sintomas, peso, dieta ou outras informações clínicas.</Text></View>
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoItem}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: colors.textMuted },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 5 },
  backText: { color: colors.text, fontWeight: '800' },
  header: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  headerMobile: { flexDirection: 'column' },
  image: { width: 250, minHeight: 190, borderRadius: radii.lg, backgroundColor: colors.primarySoft },
  imageMobile: { width: '100%', height: 220 },
  headerCopy: { flex: 1, justifyContent: 'center', gap: 8 },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: colors.text, fontSize: 30, lineHeight: 35, fontWeight: '900' },
  description: { color: colors.textMuted, lineHeight: 21 },
  card: { backgroundColor: '#fff', borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 18, ...shadow },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  cardSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoGridMobile: { flexDirection: 'column' },
  infoItem: { flexGrow: 1, flexBasis: 260, minWidth: 0, padding: 14, borderRadius: radii.md, backgroundColor: colors.background },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '800', marginTop: 5 },
  confirmBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FBFDFC' },
  confirmBoxActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  confirmText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  alreadyBox: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  alreadyText: { flex: 1, color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
  primary: { minHeight: 54, borderRadius: radii.md, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryDisabled: { backgroundColor: '#AEBAB6' },
  primaryText: { color: '#fff', fontWeight: '900' },
  privacy: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, backgroundColor: colors.primarySoft, borderRadius: radii.md },
  privacyText: { flex: 1, color: colors.primaryDark, fontSize: 11, lineHeight: 18 },
});
