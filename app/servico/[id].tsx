import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { Pill } from '@/components/Pill';
import {
  colors,
  radii,
  shadow,
} from '@/constants/theme';

import {
  cancelBooking,
  getBookings,
  getServices,
} from '@/lib/repository';

import {
  Booking,
  HealthService,
} from '@/types/domain';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const categoryLabel: Record<string, string> = {
  nutrition: 'Nutrição',
  physical_activity: 'Atividade física',
  wellbeing: 'Bem-estar',
  ergonomics: 'Ergonomia',
  mental_health: 'Saúde mental',
};

export default function ServiceDetail() {
  const { width } = useWindowDimensions();
  const mobile = width < 620;

  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [service, setService] =
    useState<HealthService | null>(null);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [
    cancellationSlotId,
    setCancellationSlotId,
  ] = useState<string | null>(null);

  const [
    cancellingBookingId,
    setCancellingBookingId,
  ] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [
        services,
        userBookings,
      ] = await Promise.all([
        getServices(),
        getBookings(),
      ]);

      setService(
        services.find(
          (item) => item.id === id,
        ) ?? null,
      );

      setBookings(userBookings);
    } catch (error: any) {
      Alert.alert(
        'Não foi possível carregar',
        error?.message ??
          'Tente novamente.',
      );
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const bookingBySlot = useMemo(() => {
    const map =
      new Map<string, Booking>();

    bookings
      .filter(
        (booking) =>
          booking.status !== 'cancelled',
      )
      .forEach((booking) => {
        map.set(
          booking.slot_id,
          booking,
        );
      });

    return map;
  }, [bookings]);

  async function handleCancel(
    booking: Booking,
  ) {
    try {
      setCancellingBookingId(
        booking.id,
      );

      await cancelBooking(
        booking.id,
      );

      setCancellationSlotId(null);

      await load();

      Alert.alert(
        'Inscrição cancelada',
        'Seu agendamento foi cancelado e a vaga foi liberada.',
      );
    } catch (error: any) {
      Alert.alert(
        'Não foi possível cancelar',
        error?.message ??
          'Tente novamente.',
      );
    } finally {
      setCancellingBookingId(
        null,
      );
    }
  }

  if (!service) {
    return (
      <Page narrow>
        <Text
          style={{
            color: colors.textMuted,
          }}
        >
          Carregando...
        </Text>
      </Page>
    );
  }

  return (
    <Page narrow>
      <AnimatedPressable
        onPress={() =>
          router.back()
        }
        style={styles.back}
      >
        <Ionicons
          name="arrow-back"
          size={19}
          color={colors.text}
        />

        <Text
          style={styles.backText}
        >
          Voltar
        </Text>
      </AnimatedPressable>

      <Image
        source={{
          uri: service.image_url,
        }}
        style={[
          styles.hero,
          mobile &&
            styles.heroMobile,
        ]}
      />

      <View
        style={[
          styles.info,
          mobile &&
            styles.infoMobile,
        ]}
      >
        <Pill
          label={
            categoryLabel[
              service.category
            ] ??
            service.category
          }
        />

        <Text
          style={[
            styles.title,
            mobile &&
              styles.titleMobile,
          ]}
        >
          {service.title}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {service.description}
        </Text>

        <View
          style={styles.meta}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={
              colors.textMuted
            }
          />

          <Text
            style={
              styles.metaText
            }
          >
            {
              service.duration_minutes
            }{' '}
            min
          </Text>

          <Ionicons
            name="person-outline"
            size={18}
            color={
              colors.textMuted
            }
          />

          <Text
            style={
              styles.metaText
            }
          >
            {
              service.professional_name
            }
          </Text>
        </View>
      </View>

      <Text
        style={styles.section}
      >
        Próximos horários
      </Text>

      <View
        style={styles.slots}
      >
        {service.slots.map(
          (slot) => {
            const booking =
              bookingBySlot.get(
                slot.id,
              );

            const booked =
              Boolean(booking);

            const full =
              slot.booked_count >=
              slot.capacity;

            const confirming =
              cancellationSlotId ===
              slot.id;

            const cancelling =
              booking &&
              cancellingBookingId ===
                booking.id;

            return (
              <View
                key={slot.id}
                style={[
                  styles.slot,
                  mobile &&
                    styles.slotMobile,
                ]}
              >
                <View
                  style={
                    styles.slotText
                  }
                >
                  <Text
                    style={
                      styles.slotDate
                    }
                  >
                    {formatDate(
                      slot.starts_at,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.slotMeta
                    }
                  >
                    {slot.location}
                    {' · '}
                    {Math.max(
                      0,
                      slot.capacity -
                        slot.booked_count,
                    )}{' '}
                    vaga(s)
                  </Text>

                  {booked ? (
                    <View
                      style={
                        styles.bookedBadge
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={
                          colors.success
                        }
                      />

                      <Text
                        style={
                          styles.bookedBadgeText
                        }
                      >
                        Você está
                        inscrito(a)
                      </Text>
                    </View>
                  ) : null}
                </View>

                {!booked ? (
                  <AnimatedPressable
                    disabled={full}
                    onPress={() =>
                      router.push({
                        pathname:
                          '/inscricao/[slotId]',
                        params: {
                          slotId:
                            slot.id,
                        },
                      })
                    }
                    style={[
                      styles.bookButton,
                      mobile &&
                        styles.bookButtonMobile,
                      full &&
                        styles.bookDisabled,
                    ]}
                  >
                    <Text
                      style={
                        styles.bookText
                      }
                    >
                      {full
                        ? 'Lotado'
                        : 'Inscrever-se'}
                    </Text>
                  </AnimatedPressable>
                ) : !confirming ? (
                  <AnimatedPressable
                    onPress={() =>
                      setCancellationSlotId(
                        slot.id,
                      )
                    }
                    style={[
                      styles.cancelButton,
                      mobile &&
                        styles.bookButtonMobile,
                    ]}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={17}
                      color={
                        colors.danger
                      }
                    />

                    <Text
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Cancelar inscrição
                    </Text>
                  </AnimatedPressable>
                ) : null}

                {confirming &&
                booking ? (
                  <View
                    style={
                      styles.confirmBox
                    }
                  >
                    <View
                      style={
                        styles.confirmHeader
                      }
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={21}
                        color={
                          colors.danger
                        }
                      />

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.confirmTitle
                          }
                        >
                          Cancelar
                          inscrição?
                        </Text>

                        <Text
                          style={
                            styles.confirmText
                          }
                        >
                          Sua vaga será
                          liberada para
                          outro
                          trabalhador.
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.confirmActions
                      }
                    >
                      <AnimatedPressable
                        disabled={
                          Boolean(
                            cancelling,
                          )
                        }
                        onPress={() =>
                          setCancellationSlotId(
                            null,
                          )
                        }
                        style={
                          styles.keepButton
                        }
                      >
                        <Text
                          style={
                            styles.keepButtonText
                          }
                        >
                          Manter
                          agendamento
                        </Text>
                      </AnimatedPressable>

                      <AnimatedPressable
                        disabled={
                          Boolean(
                            cancelling,
                          )
                        }
                        onPress={() =>
                          handleCancel(
                            booking,
                          )
                        }
                        style={[
                          styles.confirmCancelButton,
                          cancelling &&
                            styles.disabled,
                        ]}
                      >
                        <Text
                          style={
                            styles.confirmCancelText
                          }
                        >
                          {cancelling
                            ? 'Cancelando...'
                            : 'Confirmar cancelamento'}
                        </Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          },
        )}
      </View>

      <View
        style={styles.note}
      >
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={colors.info}
        />

        <Text
          style={
            styles.noteText
          }
        >
          Ao escolher um horário,
          você verá um formulário
          de confirmação antes de
          reservar a vaga. Você
          também pode cancelar uma
          inscrição antes da
          atividade.
        </Text>
      </View>
    </Page>
  );
}

const styles =
  StyleSheet.create({
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      alignSelf: 'flex-start',
      paddingVertical: 5,
    },

    backText: {
      color: colors.text,
      fontWeight: '800',
    },

    hero: {
      width: '100%',
      height: 320,
      borderRadius:
        radii.lg,
      backgroundColor:
        colors.primarySoft,
    },

    heroMobile: {
      height: 235,
    },

    info: {
      backgroundColor:
        colors.surface,
      borderRadius:
        radii.lg,
      padding: 22,
      gap: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      ...shadow,
    },

    infoMobile: {
      padding: 17,
    },

    title: {
      fontSize: 28,
      lineHeight: 33,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -0.8,
    },

    titleMobile: {
      fontSize: 24,
      lineHeight: 29,
    },

    description: {
      color:
        colors.textMuted,
      lineHeight: 21,
    },

    meta: {
      flexDirection: 'row',
      gap: 7,
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    metaText: {
      color:
        colors.textMuted,
      fontSize: 12,
      marginRight: 10,
    },

    section: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
    },

    slots: {
      gap: 10,
    },

    slot: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radii.lg,
      padding: 15,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
    },

    slotMobile: {
      flexWrap: 'wrap',
    },

    slotText: {
      flex: 1,
      minWidth: 200,
      gap: 4,
    },

    slotDate: {
      color: colors.text,
      fontWeight: '900',
      textTransform:
        'capitalize',
    },

    slotMeta: {
      color:
        colors.textMuted,
      fontSize: 12,
    },

    bookedBadge: {
      alignSelf:
        'flex-start',
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor:
        '#E7F7EE',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius:
        radii.pill,
    },

    bookedBadgeText: {
      color: '#187047',
      fontSize: 10,
      fontWeight: '900',
    },

    bookButton: {
      backgroundColor:
        colors.primary,
      borderRadius:
        radii.pill,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    bookButtonMobile: {
      width: '100%',
      alignItems: 'center',
    },

    bookDisabled: {
      backgroundColor:
        '#AEBAB6',
    },

    bookText: {
      color: colors.white,
      fontWeight: '900',
      fontSize: 12,
    },

    cancelButton: {
      minHeight: 40,
      borderRadius:
        radii.pill,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor:
        '#F2BEBE',
      backgroundColor:
        colors.dangerSoft,
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    cancelButtonText: {
      color: colors.danger,
      fontWeight: '900',
      fontSize: 12,
    },

    confirmBox: {
      width: '100%',
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      paddingTop: 14,
      gap: 12,
    },

    confirmHeader: {
      flexDirection: 'row',
      gap: 10,
      alignItems:
        'flex-start',
    },

    confirmTitle: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '900',
    },

    confirmText: {
      color:
        colors.textMuted,
      fontSize: 11,
      marginTop: 3,
    },

    confirmActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    keepButton: {
      flex: 1,
      minWidth: 160,
      minHeight: 42,
      borderRadius:
        radii.md,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 12,
    },

    keepButtonText: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 11,
    },

    confirmCancelButton: {
      flex: 1,
      minWidth: 180,
      minHeight: 42,
      borderRadius:
        radii.md,
      backgroundColor:
        colors.danger,
      alignItems: 'center',
      justifyContent:
        'center',
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

    note: {
      flexDirection: 'row',
      gap: 9,
      backgroundColor:
        colors.infoSoft,
      padding: 14,
      borderRadius:
        radii.md,
    },

    noteText: {
      flex: 1,
      color: '#204C9A',
      fontSize: 12,
      lineHeight: 18,
    },
  });