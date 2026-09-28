import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  cancelBooking,
  getBookings,
  justifyAbsence,
} from '@/lib/repository';
import { AbsenceReason, Booking } from '@/types/domain';

const reasons: { key: AbsenceReason; label: string }[] = [
  { key: 'work_demand', label: 'Demanda de trabalho' },
  { key: 'schedule_conflict', label: 'Conflito de horário' },
  { key: 'personal', label: 'Motivo pessoal' },
  { key: 'other', label: 'Outro' },
];

export default function ProfileScreen() {
  const { profile, signOut, isDemo } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openJustification, setOpenJustification] = useState<string | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function loadBookings() {
    try {
      setBookings(await getBookings());
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar seus agendamentos.',
      );
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function leave() {
    await signOut();
    router.replace('/');
  }

  async function justify(id: string, reason: AbsenceReason) {
    try {
      await justifyAbsence(id, reason);

      Alert.alert(
        'Justificativa registrada',
        'A justificativa foi salva com sucesso.',
      );

      setOpenJustification(null);
      await loadBookings();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível registrar a justificativa.',
      );
    }
  }

  async function confirmCancellation(id: string) {
    try {
      setCancelling(id);

      await cancelBooking(id);

      setCancelConfirmation(null);

      await loadBookings();

      Alert.alert(
        'Agendamento cancelado',
        'Seu agendamento foi cancelado e a vaga foi liberada.',
      );
    } catch (error: any) {
      Alert.alert(
        'Não foi possível cancelar',
        error?.message || 'Tente novamente.',
      );
    } finally {
      setCancelling(null);
    }
  }

  return (
    <Page narrow>
      <SectionTitle
        title="Perfil"
        subtitle="Seus dados de acesso, histórico e privacidade."
      />

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.slice(0, 1).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name}</Text>

          <Text style={styles.meta}>
            {profile?.unit_name}
          </Text>

          {profile?.sector ? (
            <Text style={styles.meta}>
              Setor: {profile.sector}
            </Text>
          ) : null}

          <Text style={styles.meta}>
            {profile?.organization_name}
          </Text>
        </View>

        <View style={styles.role}>
          <Text style={styles.roleText}>Trabalhador</Text>
        </View>
      </View>

      <Text style={styles.heading}>Meus agendamentos</Text>

      <View style={styles.list}>
        {bookings.map((booking) => {
          const isFuture =
            new Date(booking.starts_at).getTime() > Date.now();

          const canCancel =
            booking.status === 'confirmed' && isFuture;

          const isCancelling =
            cancelling === booking.id;

          const isConfirmingCancellation =
            cancelConfirmation === booking.id;

          return (
            <View
              key={booking.id}
              style={styles.booking}
            >
              <View style={styles.bookingMain}>
                <Text style={styles.bookingTitle}>
                  {booking.service_title}
                </Text>

                <Text style={styles.bookingMeta}>
                  {new Date(booking.starts_at).toLocaleString(
                    'pt-BR',
                    {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    },
                  )}
                  {' · '}
                  {booking.location}
                </Text>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      booking.status === 'cancelled' &&
                        styles.statusCancelled,
                      booking.status === 'attended' &&
                        styles.statusAttended,
                      booking.status === 'no_show' &&
                        styles.statusAbsent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'cancelled' &&
                          styles.statusCancelledText,
                        booking.status === 'attended' &&
                          styles.statusAttendedText,
                        booking.status === 'no_show' &&
                          styles.statusAbsentText,
                      ]}
                    >
                      {booking.status === 'attended'
                        ? 'Presente'
                        : booking.status === 'no_show'
                          ? 'Ausente'
                          : booking.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Confirmado'}
                    </Text>
                  </View>
                </View>

                {booking.absence_reason ? (
                  <Text style={styles.justified}>
                    Justificativa registrada
                  </Text>
                ) : null}
              </View>

              {canCancel && !isConfirmingCancellation ? (
                <AnimatedPressable
                  onPress={() => {
                    setOpenJustification(null);
                    setCancelConfirmation(booking.id);
                  }}
                  style={styles.cancelBtn}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color={colors.danger}
                  />

                  <Text style={styles.cancelBtnText}>
                    Cancelar
                  </Text>
                </AnimatedPressable>
              ) : null}

              {isConfirmingCancellation ? (
                <View style={styles.cancelBox}>
                  <View style={styles.cancelWarning}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color={colors.danger}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cancelTitle}>
                        Cancelar agendamento?
                      </Text>

                      <Text style={styles.cancelDescription}>
                        Sua vaga será liberada para outro trabalhador.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cancelActions}>
                    <AnimatedPressable
                      disabled={isCancelling}
                      onPress={() =>
                        setCancelConfirmation(null)
                      }
                      style={styles.keepBtn}
                    >
                      <Text style={styles.keepBtnText}>
                        Manter agendamento
                      </Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                      disabled={isCancelling}
                      onPress={() =>
                        confirmCancellation(booking.id)
                      }
                      style={[
                        styles.confirmCancelBtn,
                        isCancelling && styles.disabled,
                      ]}
                    >
                      <Text style={styles.confirmCancelText}>
                        {isCancelling
                          ? 'Cancelando...'
                          : 'Confirmar cancelamento'}
                      </Text>
                    </AnimatedPressable>
                  </View>
                </View>
              ) : null}

              {booking.status === 'no_show' &&
              !booking.absence_reason ? (
                <AnimatedPressable
                  onPress={() => {
                    setCancelConfirmation(null);

                    setOpenJustification(
                      openJustification === booking.id
                        ? null
                        : booking.id,
                    );
                  }}
                  style={styles.justifyBtn}
                >
                  <Text style={styles.justifyText}>
                    Justificar ausência
                  </Text>
                </AnimatedPressable>
              ) : null}

              {openJustification === booking.id ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonTitle}>
                    Selecione o motivo
                  </Text>

                  <View style={styles.reasonOptions}>
                    {reasons.map((reason) => (
                      <AnimatedPressable
                        key={reason.key}
                        onPress={() =>
                          justify(
                            booking.id,
                            reason.key,
                          )
                        }
                        style={styles.reason}
                      >
                        <Text style={styles.reasonText}>
                          {reason.label}
                        </Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}

        {bookings.length === 0 ? (
          <Text style={styles.empty}>
            Nenhum agendamento ainda.
          </Text>
        ) : null}
      </View>

      <View style={styles.item}>
        <View style={styles.itemIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            Privacidade e dados
          </Text>

          <Text style={styles.itemText}>
            O MVP evita peso, IMC, dieta, diagnóstico e
            texto livre em justificativas. A gestão recebe
            somente indicadores agregados.
          </Text>
        </View>
      </View>

      {isDemo ? (
        <View style={styles.demo}>
          <Ionicons
            name="flask-outline"
            size={18}
            color="#9B6500"
          />

          <Text style={styles.demoText}>
            Modo de demonstração: nenhum dado real é
            persistido.
          </Text>
        </View>
      ) : null}

      <AnimatedPressable
        onPress={leave}
        style={styles.logout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.danger}
        />

        <Text style={styles.logoutText}>
          Sair
        </Text>
      </AnimatedPressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  profile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },

  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  role: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  roleText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },

  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },

  list: {
    gap: 10,
  },

  booking: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },

  bookingMain: {
    flex: 1,
    minWidth: 210,
  },

  bookingTitle: {
    fontWeight: '900',
    color: colors.text,
    fontSize: 15,
  },

  bookingMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },

  statusRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },

  statusText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
  },

  statusCancelled: {
    backgroundColor: '#F6F6F6',
  },

  statusCancelledText: {
    color: colors.textMuted,
  },

  statusAttended: {
    backgroundColor: '#E7F7EE',
  },

  statusAttendedText: {
    color: '#187047',
  },

  statusAbsent: {
    backgroundColor: '#FFF1E8',
  },

  statusAbsentText: {
    color: '#A24F14',
  },

  justified: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 6,
    fontWeight: '900',
  },

  cancelBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F2BEBE',
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelBtnText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },

  cancelBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginTop: 4,
    gap: 12,
  },

  cancelWarning: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },

  cancelTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 13,
  },

  cancelDescription: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  cancelActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  keepBtn: {
    flex: 1,
    minWidth: 150,
    minHeight: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  keepBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 11,
  },

  confirmCancelBtn: {
    flex: 1,
    minWidth: 170,
    minHeight: 42,
    borderRadius: radii.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  confirmCancelText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
  },

  disabled: {
    opacity: 0.55,
  },

  justifyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },

  justifyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#855800',
  },

  reasonBox: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },

  reasonTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },

  reasonOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  reason: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  reasonText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },

  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: 18,
  },

  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  itemIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  itemText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  demo: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accentSoft,
    padding: 13,
    borderRadius: radii.md,
  },

  demoText: {
    flex: 1,
    color: '#7A5600',
    fontSize: 11,
    lineHeight: 16,
  },

  logout: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F3C9C9',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.dangerSoft,
  },

  logoutText: {
    color: colors.danger,
    fontWeight: '900',
  },
});