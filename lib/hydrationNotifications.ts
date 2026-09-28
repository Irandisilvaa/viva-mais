import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HydrationPreferences } from '@/types/domain';

const IDS_KEY = 'viva-mais-hydration-notification-ids-v4';
const INTAKE_PREFIX = 'viva-mais-hydration-intake-v4:';

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getTodayHydrationMl() {
  const raw = await AsyncStorage.getItem(`${INTAKE_PREFIX}${todayKey()}`);
  const parsed = Number(raw || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function addTodayHydrationMl(amount: number) {
  const current = await getTodayHydrationMl();
  const next = Math.max(0, current + amount);
  await AsyncStorage.setItem(`${INTAKE_PREFIX}${todayKey()}`, String(next));
  return next;
}

export async function cancelHydrationNotifications() {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  const raw = await AsyncStorage.getItem(IDS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await AsyncStorage.removeItem(IDS_KEY);
}

function parseTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
}

function reminderTimes(preferences: HydrationPreferences) {
  const start = parseTime(preferences.routine_start);
  const end = parseTime(preferences.routine_end);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  const times: { hour: number; minute: number }[] = [];
  if (endMinutes <= startMinutes) return times;
  for (let minuteOfDay = startMinutes; minuteOfDay <= endMinutes; minuteOfDay += preferences.interval_minutes) {
    times.push({ hour: Math.floor(minuteOfDay / 60), minute: minuteOfDay % 60 });
    if (times.length >= 48) break;
  }
  return times;
}

export async function scheduleHydrationNotifications(preferences: HydrationPreferences) {
  if (Platform.OS === 'web') return { supported: false, count: 0 };
  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('hydration', {
      name: 'Lembretes de hidratação',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await cancelHydrationNotifications();

  if (!preferences.enabled || !['app', 'both'].includes(preferences.channel)) return { supported: true, count: 0 };

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Permissão de notificações não concedida no dispositivo.');

  const times = reminderTimes(preferences);
  const identifiers: string[] = [];
  for (const time of times) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de se hidratar',
        body: `Uma pausa rápida para água ajuda a cuidar da sua rotina. Meta do dia: ${preferences.daily_goal_ml} ml.`,
        data: { route: '/(tabs)/bem-estar', kind: 'hydration' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: Platform.OS === 'android' ? 'hydration' : undefined,
      },
    });
    identifiers.push(id);
  }
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(identifiers));
  return { supported: true, count: identifiers.length };
}
