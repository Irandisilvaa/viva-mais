import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii, shadow } from '@/constants/theme';

import {
  addTodayHydrationMl,
  getTodayHydrationMl,
  requestHydrationNotificationPermission,
  scheduleHydrationNotifications,
  testHydrationNotification,
} from '@/lib/hydrationNotifications';

import {
  getHydrationPreferences,
  getTodayWellbeingCheckin,
  saveHydrationPreferences,
  saveWellbeingCheckin,
} from '@/lib/repository';

import {
  HydrationChannel,
  HydrationPreferences,
} from '@/types/domain';

function Scale({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <View style={styles.scaleBlock}>
      <Text style={styles.scaleTitle}>{label}</Text>

      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <AnimatedPressable
            key={v}
            onPress={() => onChange(v)}
            style={[
              styles.scaleButton,
              value === v && styles.scaleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.scaleNumber,
                value === v && styles.scaleNumberActive,
              ]}
            >
              {v}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>{low}</Text>
        <Text style={styles.scaleLabel}>{high}</Text>
      </View>
    </View>
  );
}

const channelOptions: {
  value: HydrationChannel;
  label: string;
  icon: any;
  text: string;
}[] = [
  {
    value: 'app',
    label: 'No aplicativo',
    icon: 'notifications-outline',
    text: 'Lembretes locais no celular ou no navegador.',
  },
  {
    value: 'email',
    label: 'Por e-mail',
    icon: 'mail-outline',
    text: 'Lembretes enviados para seu e-mail.',
  },
  {
    value: 'both',
    label: 'Aplicativo + e-mail',
    icon: 'sparkles-outline',
    text: 'Usa os dois canais.',
  },
  {
    value: 'off',
    label: 'Sem lembretes',
    icon: 'notifications-off-outline',
    text: 'Mantém apenas a meta.',
  },
];

function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export default function Wellbeing() {
  const { width } = useWindowDimensions();
  const mobile = width < 620;

  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);

  const [saving, setSaving] = useState(false);
  const [noticeAcknowledged, setNoticeAcknowledged] = useState(false);
  const [savedToday, setSavedToday] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [hydrationSaving, setHydrationSaving] = useState(false);
  const [hydrationSavedMessage, setHydrationSavedMessage] =
    useState<string | null>(null);
  const [hydrationStatus, setHydrationStatus] =
    useState<'idle' | 'dirty' | 'saved'>('idle');
  const [hydrationSavedAt, setHydrationSavedAt] = useState<Date | null>(null);

  const [testingNotification, setTestingNotification] = useState(false);
  const [waterFeedback, setWaterFeedback] = useState<string | null>(null);
  const [todayMl, setTodayMl] = useState(0);

  const [preferences, setPreferences] = useState<HydrationPreferences>({
    daily_goal_ml: 2000,
    serving_ml: 250,
    routine_start: '08:00',
    routine_end: '18:00',
    interval_minutes: 120,
    channel: 'app',
    email: null,
    timezone: 'America/Maceio',
    enabled: true,
  });

  useEffect(() => {
    Promise.all([
      getHydrationPreferences(),
      getTodayHydrationMl(),
      getTodayWellbeingCheckin(),
    ])
      .then(([pref, current, checkin]) => {
        setPreferences(pref);
        setTodayMl(current);

        if (checkin) {
          setMood(checkin.mood);
          setEnergy(checkin.energy);
          setStress(checkin.stress);
          setNoticeAcknowledged(true);
          setSavedToday(true);
          setSavedAt(checkin.privacy_notice_acknowledged_at);
        }
      })
      .catch((error) =>
        console.warn('Falha ao carregar bem-estar/hidratação', error),
      );
  }, []);

  const hydrationPercent = useMemo(
    () =>
      Math.min(
        100,
        Math.round(
          (todayMl / Math.max(1, preferences.daily_goal_ml)) * 100,
        ),
      ),
    [todayMl, preferences.daily_goal_ml],
  );

  function updateHydrationPreferences(
    patch: Partial<HydrationPreferences>,
  ) {
    setPreferences((current) => ({
      ...current,
      ...patch,
    }));

    setHydrationStatus('dirty');
    setHydrationSavedMessage(null);
  }

  async function save() {
    try {
      if (!noticeAcknowledged) {
        Alert.alert(
          'Aviso de privacidade',
          'Confirme que você leu o aviso antes de registrar o check-in.',
        );
        return;
      }

      setSaving(true);

      const saved = await saveWellbeingCheckin({
        mood,
        energy,
        stress,
      });

      setSavedToday(true);
      setSavedAt(saved.privacy_notice_acknowledged_at);

      Alert.alert(
        'Check-in salvo',
        'O registro de hoje foi salvo com sucesso. Se você alterar as notas e salvar novamente, o check-in do dia será atualizado.',
      );
    } catch (e: any) {
      Alert.alert(
        'Não foi possível salvar',
        e?.message ?? 'Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveHydration() {
    try {
      if (
        !validTime(preferences.routine_start) ||
        !validTime(preferences.routine_end)
      ) {
        throw new Error(
          'Use horários no formato HH:MM, por exemplo 08:00 e 18:00.',
        );
      }

      if (
        preferences.daily_goal_ml < 500 ||
        preferences.daily_goal_ml > 6000
      ) {
        throw new Error('Defina uma meta entre 500 ml e 6000 ml.');
      }

      if (
        preferences.serving_ml < 50 ||
        preferences.serving_ml > 1000
      ) {
        throw new Error(
          'Defina uma quantidade por registro entre 50 ml e 1000 ml.',
        );
      }

      if (
        preferences.interval_minutes < 30 ||
        preferences.interval_minutes > 360
      ) {
        throw new Error(
          'O intervalo deve ficar entre 30 e 360 minutos.',
        );
      }

      if (
        (preferences.channel === 'email' ||
          preferences.channel === 'both') &&
        !preferences.email?.includes('@')
      ) {
        throw new Error(
          'Informe um e-mail válido para receber os lembretes.',
        );
      }

      setHydrationSaving(true);
      setHydrationSavedMessage(null);

      const updated: HydrationPreferences = {
        ...preferences,
        enabled: preferences.channel !== 'off',
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          preferences.timezone,
      };

      if (
        updated.channel === 'app' ||
        updated.channel === 'both'
      ) {
        const permission =
          await requestHydrationNotificationPermission(updated);

        if (!permission.supported) {
          throw new Error(
            Platform.OS === 'web'
              ? 'Este navegador não oferece suporte a notificações.'
              : 'Este dispositivo não oferece suporte a notificações.',
          );
        }

        if (!permission.granted) {
          throw new Error(
            Platform.OS === 'web'
              ? 'Permita notificações para o Viva Mais no navegador e tente novamente.'
              : 'Permita notificações para o Viva Mais no celular e tente novamente.',
          );
        }
      }

      await saveHydrationPreferences(updated);

      const scheduled =
        await scheduleHydrationNotifications(updated);

      setPreferences(updated);

      const channelLabel =
        updated.channel === 'both'
          ? 'aplicativo e e-mail'
          : updated.channel === 'email'
            ? 'e-mail'
            : updated.channel === 'app'
              ? Platform.OS === 'web'
                ? 'navegador'
                : 'aplicativo'
              : 'sem lembretes';

      let message =
        `Meta de ${updated.daily_goal_ml} ml por dia. ` +
        `Rotina das ${updated.routine_start} às ${updated.routine_end}. ` +
        `Canal selecionado: ${channelLabel}.`;

      if (
        updated.channel === 'app' ||
        updated.channel === 'both'
      ) {
        if (!scheduled.supported) {
          message +=
            ' A configuração foi salva, mas as notificações não são suportadas neste ambiente.';
        } else if (!scheduled.granted) {
          message +=
            ' A configuração foi salva, mas a permissão para notificações não foi concedida.';
        } else if (scheduled.platform === 'web') {
          message +=
            ` ${scheduled.count} horário(s) de lembrete foram preparados no navegador.`;
        } else {
          message +=
            ` ${scheduled.count} lembrete(s) diário(s) foram configurado(s) no celular.`;
        }
      }

      if (
        updated.channel === 'email' ||
        updated.channel === 'both'
      ) {
        message +=
          ' O envio por e-mail depende da automação de e-mail do Supabase estar ativa.';
      }

      setHydrationSavedMessage(message);
      setHydrationSavedAt(new Date());
      setHydrationStatus('saved');

      Alert.alert(
        'Configuração salva',
        scheduled.platform === 'web'
          ? 'Sua configuração foi salva e os lembretes do navegador foram atualizados.'
          : 'Sua configuração foi salva e os lembretes do celular foram atualizados.',
      );
    } catch (e: any) {
      Alert.alert(
        'Não foi possível salvar',
        e?.message ?? 'Revise os dados e tente novamente.',
      );
    } finally {
      setHydrationSaving(false);
    }
  }

  async function drinkWater() {
    try {
      const amount = preferences.serving_ml;
      const next = await addTodayHydrationMl(amount);

      setTodayMl(next);
      setWaterFeedback(
        `${amount} ml registrados agora. Você está com ${next} ml hoje.`,
      );

      setTimeout(() => {
        setWaterFeedback(null);
      }, 3500);
    } catch (e: any) {
      Alert.alert(
        'Não foi possível registrar',
        e?.message ?? 'Tente novamente.',
      );
    }
  }

  async function testNotificationNow() {
    try {
      setTestingNotification(true);

      const result = await testHydrationNotification();

      Alert.alert(
        'Teste agendado',
        `Você deve receber uma notificação em aproximadamente ${result.seconds} segundos.`,
      );
    } catch (e: any) {
      Alert.alert(
        'Notificação não disponível',
        e?.message ?? 'Não foi possível testar a notificação.',
      );
    } finally {
      setTestingNotification(false);
    }
  }

  return (
    <Page narrow>
      <SectionTitle
        title="Bem-estar"
        subtitle="Um check-in rápido e opcional para registrar como você está hoje."
      />

      <View style={styles.privacy}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.primary}
        />

        <View style={styles.flex}>
          <Text style={styles.privacyTitle}>
            Seu registro é privado
          </Text>

          <Text style={styles.privacyText}>
            Gestores não acessam respostas individuais. O painel
            gerencial usa apenas dados agregados e com limiar mínimo
            de participantes.
          </Text>
        </View>
      </View>

      <View style={[styles.card, mobile && styles.cardMobile]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons
              name="pulse-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              Como foi seu dia até agora?
            </Text>

            <Text style={styles.cardText}>
              Sem texto livre, diagnóstico ou coleta de sintomas.
            </Text>
          </View>
        </View>

        {savedToday ? (
          <View style={styles.savedBox}>
            <Ionicons
              name="cloud-done-outline"
              size={19}
              color={colors.primary}
            />

            <View style={styles.flex}>
              <Text style={styles.savedTitle}>
                Check-in de hoje salvo
              </Text>

              <Text style={styles.savedText}>
                {savedAt
                  ? `Última atualização: ${new Date(
                      savedAt,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Registro persistido no Supabase.'}
              </Text>
            </View>
          </View>
        ) : null}

        <Scale
          label="Humor"
          value={mood}
          onChange={setMood}
          low="Baixo"
          high="Muito bom"
        />

        <Scale
          label="Energia"
          value={energy}
          onChange={setEnergy}
          low="Baixa"
          high="Alta"
        />

        <Scale
          label="Estresse"
          value={stress}
          onChange={setStress}
          low="Baixo"
          high="Alto"
        />

        <AnimatedPressable
          onPress={() =>
            setNoticeAcknowledged(!noticeAcknowledged)
          }
          style={styles.noticeAck}
        >
          <Ionicons
            name={
              noticeAcknowledged
                ? 'checkbox'
                : 'square-outline'
            }
            size={21}
            color={
              noticeAcknowledged
                ? colors.primary
                : colors.textMuted
            }
          />

          <Text style={styles.noticeAckText}>
            Li o aviso e estou ciente de que este check-in é um dado
            pessoal sensível, acessível individualmente apenas por mim.
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={save}
          disabled={saving}
          style={styles.saveButton}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.white}
          />

          <Text style={styles.saveText}>
            {saving ? 'Salvando...' : 'Salvar check-in'}
          </Text>
        </AnimatedPressable>
      </View>

      <View
        style={[
          styles.hydrationCard,
          mobile && styles.cardMobile,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.waterIcon}>
            <Ionicons
              name="water-outline"
              size={25}
              color={colors.info}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              Minha hidratação
            </Text>

            <Text style={styles.cardText}>
              Defina sua meta e sua rotina. O progresso diário fica
              somente neste dispositivo e reinicia a cada dia.
            </Text>
          </View>
        </View>

        <View style={styles.progressTop}>
          <View>
            <Text style={styles.progressValue}>
              {todayMl} ml
            </Text>

            <Text style={styles.progressCaption}>
              de {preferences.daily_goal_ml} ml hoje
            </Text>
          </View>

          <Text style={styles.progressPercent}>
            {hydrationPercent}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${hydrationPercent}%` as any,
              },
            ]}
          />
        </View>

        <AnimatedPressable
          onPress={drinkWater}
          style={styles.drinkButton}
        >
          <Ionicons
            name="water"
            size={18}
            color={colors.info}
          />

          <Text style={styles.drinkButtonText}>
            Bebi {preferences.serving_ml} ml
          </Text>
        </AnimatedPressable>

        {waterFeedback ? (
          <View style={styles.waterFeedback}>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.waterFeedbackText}>
              {waterFeedback}
            </Text>
          </View>
        ) : null}

        <View style={styles.separator} />

        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>
            Meta e rotina
          </Text>

          {hydrationStatus === 'dirty' ? (
            <View style={styles.unsavedBadge}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color="#A56400"
              />

              <Text style={styles.unsavedText}>
                Alterações não salvas
              </Text>
            </View>
          ) : hydrationStatus === 'saved' ? (
            <View style={styles.savedBadge}>
              <Ionicons
                name="cloud-done-outline"
                size={15}
                color={colors.primary}
              />

              <Text style={styles.savedBadgeText}>
                Tudo salvo
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.formGrid,
            mobile && styles.formGridMobile,
          ]}
        >
          <View style={styles.field}>
            <Text style={styles.label}>
              Meta diária (ml)
            </Text>

            <TextInput
              keyboardType="numeric"
              value={String(preferences.daily_goal_ml)}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  daily_goal_ml:
                    Number(v.replace(/\D/g, '')) || 0,
                })
              }
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Quantidade por registro (ml)
            </Text>

            <TextInput
              keyboardType="numeric"
              value={String(preferences.serving_ml)}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  serving_ml:
                    Number(v.replace(/\D/g, '')) || 0,
                })
              }
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Início da rotina
            </Text>

            <TextInput
              value={preferences.routine_start}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  routine_start: v,
                })
              }
              placeholder="08:00"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Fim da rotina
            </Text>

            <TextInput
              value={preferences.routine_end}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  routine_end: v,
                })
              }
              placeholder="18:00"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Lembrar a cada (minutos)
            </Text>

            <TextInput
              keyboardType="numeric"
              value={String(preferences.interval_minutes)}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  interval_minutes:
                    Number(v.replace(/\D/g, '')) || 0,
                })
              }
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              E-mail para lembretes
            </Text>

            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={preferences.email || ''}
              onChangeText={(v) =>
                updateHydrationPreferences({
                  email: v || null,
                })
              }
              placeholder="voce@instituicao.gov.br"
              style={styles.input}
            />
          </View>
        </View>

        <Text style={styles.groupTitle}>
          Como deseja ser lembrado?
        </Text>

        <View
          style={[
            styles.channelGrid,
            mobile && styles.channelGridMobile,
          ]}
        >
          {channelOptions.map((option) => {
            const selected =
              preferences.channel === option.value;

            return (
              <AnimatedPressable
                key={option.value}
                onPress={() =>
                  updateHydrationPreferences({
                    channel: option.value,
                  })
                }
                style={[
                  styles.channelCard,
                  selected &&
                    styles.channelCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.channelIcon,
                    selected &&
                      styles.channelIconSelected,
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={
                      selected
                        ? colors.white
                        : colors.primary
                    }
                  />
                </View>

                <View style={styles.flex}>
                  <Text
                    style={[
                      styles.channelTitle,
                      selected &&
                        styles.channelTitleSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  <Text
                    style={[
                      styles.channelText,
                      selected &&
                        styles.channelTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                </View>

                <Ionicons
                  name={
                    selected
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={20}
                  color={
                    selected
                      ? colors.primary
                      : colors.textMuted
                  }
                />
              </AnimatedPressable>
            );
          })}
        </View>

        {Platform.OS === 'web' &&
        ['app', 'both'].includes(preferences.channel) ? (
          <View style={styles.infoBox}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={colors.primary}
            />

            <Text style={styles.infoText}>
              O navegador solicitará permissão para exibir notificações.
              Os lembretes web funcionam enquanto o Viva Mais permanecer
              aberto no navegador.
            </Text>
          </View>
        ) : null}

        {['email', 'both'].includes(preferences.channel) ? (
          <View style={styles.infoBox}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.primary}
            />

            <Text style={styles.infoText}>
              O e-mail é usado somente para lembretes de hidratação.
              O envio automático depende da função do Supabase
              incluída no repositório estar ativa.
            </Text>
          </View>
        ) : null}

        {['app', 'both'].includes(preferences.channel) ? (
          <AnimatedPressable
            onPress={testNotificationNow}
            disabled={testingNotification}
            style={[
              styles.testNotificationButton,
              testingNotification &&
                styles.buttonDisabled,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.testNotificationText}>
              {testingNotification
                ? 'Preparando teste...'
                : 'Testar notificação'}
            </Text>
          </AnimatedPressable>
        ) : null}

        {hydrationSavedMessage &&
        hydrationStatus === 'saved' ? (
          <View style={styles.hydrationSavedBox}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.primary}
            />

            <View style={styles.flex}>
              <Text style={styles.hydrationSavedTitle}>
                Configuração salva
              </Text>

              <Text style={styles.hydrationSavedText}>
                {hydrationSavedMessage}
              </Text>

              {hydrationSavedAt ? (
                <Text style={styles.savedTime}>
                  Salvo às{' '}
                  {hydrationSavedAt.toLocaleTimeString(
                    'pt-BR',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <AnimatedPressable
          onPress={saveHydration}
          disabled={
            hydrationSaving ||
            hydrationStatus === 'saved'
          }
          style={[
            styles.saveButton,
            hydrationStatus === 'saved' &&
              styles.saveButtonSaved,
          ]}
        >
          <Ionicons
            name={
              hydrationSaving
                ? 'sync-outline'
                : hydrationStatus === 'saved'
                  ? 'checkmark-circle'
                  : 'save-outline'
            }
            size={20}
            color={colors.white}
          />

          <Text style={styles.saveText}>
            {hydrationSaving
              ? 'Salvando...'
              : hydrationStatus === 'dirty'
                ? 'Salvar alterações'
                : hydrationStatus === 'saved'
                  ? 'Tudo salvo'
                  : 'Salvar meta e lembretes'}
          </Text>
        </AnimatedPressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },

  privacy: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: radii.lg,
  },

  privacyTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 14,
  },

  privacyText: {
    color: colors.primaryDark,
    opacity: 0.85,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 22,
    gap: 20,
    ...shadow,
  },

  hydrationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 22,
    gap: 18,
    ...shadow,
  },

  cardMobile: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },

  cardText: {
    color: colors.textMuted,
    lineHeight: 18,
    fontSize: 12,
    marginTop: 3,
  },

  scaleBlock: {
    gap: 10,
    paddingTop: 2,
    width: '100%',
  },

  scaleTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 14,
  },

  scaleRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },

  scaleButton: {
    flex: 1,
    minWidth: 44,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFDFC',
  },

  scaleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  scaleNumber: {
    color: colors.textMuted,
    fontWeight: '900',
  },

  scaleNumberActive: {
    color: colors.white,
  },

  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  scaleLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  noticeAck: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: '#F3F6F5',
    width: '100%',
  },

  noticeAckText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },

  saveButton: {
    minHeight: 52,
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  saveButtonSaved: {
    opacity: 0.78,
  },

  saveText: {
    color: colors.white,
    fontWeight: '900',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  savedBox: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },

  savedTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 12,
  },

  savedText: {
    color: colors.primaryDark,
    opacity: 0.78,
    fontSize: 10,
    marginTop: 2,
  },

  waterIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },

  progressValue: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 24,
  },

  progressCaption: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  progressPercent: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 18,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E9EFEC',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.info,
  },

  drinkButton: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: '#C9DDFF',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  drinkButtonText: {
    color: colors.info,
    fontWeight: '900',
  },

  waterFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },

  waterFeedbackText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },

  groupTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 15,
  },

  unsavedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#FFF4DF',
  },

  unsavedText: {
    color: '#A56400',
    fontSize: 10,
    fontWeight: '900',
  },

  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },

  savedBadgeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
  },

  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  formGridMobile: {
    flexDirection: 'column',
  },

  field: {
    flexGrow: 1,
    flexBasis: 250,
    minWidth: 0,
    gap: 6,
  },

  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: 13,
    color: colors.text,
    backgroundColor: '#FCFEFD',
  },

  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  channelGridMobile: {
    flexDirection: 'column',
  },

  channelCard: {
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 0,
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },

  channelCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  channelIconSelected: {
    backgroundColor: colors.primary,
  },

  channelTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 12,
  },

  channelTitleSelected: {
    color: colors.primaryDark,
  },

  channelText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  channelTextSelected: {
    color: colors.primaryDark,
    opacity: 0.8,
  },

  infoBox: {
    flexDirection: 'row',
    gap: 9,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: '#F4F8F6',
    alignItems: 'flex-start',
  },

  infoText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },

  testNotificationButton: {
    minHeight: 48,
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  testNotificationText: {
    color: colors.primaryDark,
    fontWeight: '900',
  },

  hydrationSavedBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 13,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#B9DDD3',
  },

  hydrationSavedTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 12,
  },

  hydrationSavedText: {
    color: colors.primaryDark,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },

  savedTime: {
    color: colors.primaryDark,
    opacity: 0.65,
    fontSize: 9,
    marginTop: 4,
  },
});
