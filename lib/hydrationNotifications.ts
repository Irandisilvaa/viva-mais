import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { HydrationPreferences } from '@/types/domain';

const IDS_KEY =
  'viva-mais-hydration-notification-ids-v5';

const INTAKE_PREFIX =
  'viva-mais-hydration-intake-v5:';

const WEB_TIMERS_KEY =
  '__vivaMaisHydrationWebTimers';

type NotificationResult = {
  supported: boolean;
  granted: boolean;
  count: number;
  platform: 'web' | 'native';
  persistent: boolean;
};

function todayKey() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    now.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function getTodayHydrationMl() {
  const raw =
    await AsyncStorage.getItem(
      `${INTAKE_PREFIX}${todayKey()}`,
    );

  const parsed =
    Number(raw || 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export async function addTodayHydrationMl(
  amount: number,
) {
  const current =
    await getTodayHydrationMl();

  const next = Math.max(
    0,
    current + amount,
  );

  await AsyncStorage.setItem(
    `${INTAKE_PREFIX}${todayKey()}`,
    String(next),
  );

  return next;
}

function parseTime(
  value: string,
) {
  const [hour, minute] =
    value
      .split(':')
      .map(Number);

  return {
    hour,
    minute,
  };
}

function reminderTimes(
  preferences: HydrationPreferences,
) {
  const start =
    parseTime(
      preferences.routine_start,
    );

  const end =
    parseTime(
      preferences.routine_end,
    );

  const startMinutes =
    start.hour * 60 +
    start.minute;

  const endMinutes =
    end.hour * 60 +
    end.minute;

  const times: {
    hour: number;
    minute: number;
  }[] = [];

  if (
    endMinutes <=
    startMinutes
  ) {
    return times;
  }

  for (
    let minuteOfDay =
      startMinutes;
    minuteOfDay <=
    endMinutes;
    minuteOfDay +=
      preferences.interval_minutes
  ) {
    times.push({
      hour:
        Math.floor(
          minuteOfDay / 60,
        ),

      minute:
        minuteOfDay % 60,
    });

    if (
      times.length >= 48
    ) {
      break;
    }
  }

  return times;
}

/* ==========================================================
   WEB
   ========================================================== */

function getWebRuntime(): any {
  return globalThis as any;
}

function clearWebTimers() {
  const runtime =
    getWebRuntime();

  const timers: any[] =
    runtime[
      WEB_TIMERS_KEY
    ] || [];

  for (
    const timer of timers
  ) {
    try {
      runtime.clearTimeout(
        timer,
      );
    } catch {
      // Ignora timer já encerrado.
    }
  }

  runtime[
    WEB_TIMERS_KEY
  ] = [];
}

function millisecondsUntilNext(
  hour: number,
  minute: number,
) {
  const now = new Date();

  const next =
    new Date();

  next.setHours(
    hour,
    minute,
    0,
    0,
  );

  if (
    next.getTime() <=
    now.getTime()
  ) {
    next.setDate(
      next.getDate() + 1,
    );
  }

  return Math.max(
    1000,
    next.getTime() -
      now.getTime(),
  );
}

function showWebHydrationNotification(
  dailyGoal: number,
) {
  const runtime =
    getWebRuntime();

  const NotificationApi =
    runtime.Notification;

  if (
    !NotificationApi ||
    NotificationApi.permission !==
      'granted'
  ) {
    return;
  }

  try {
    new NotificationApi(
      'Hora de se hidratar 💧',
      {
        body:
          `Uma pausa rápida para água. ` +
          `Sua meta de hoje é ${dailyGoal} ml.`,

        tag:
          'viva-mais-hydration',

        renotify: true,
      },
    );
  } catch (error) {
    console.warn(
      'Não foi possível exibir a notificação web.',
      error,
    );
  }
}

function scheduleWebReminder(
  hour: number,
  minute: number,
  preferences: HydrationPreferences,
) {
  const runtime =
    getWebRuntime();

  const delay =
    millisecondsUntilNext(
      hour,
      minute,
    );

  const timer =
    runtime.setTimeout(
      () => {
        showWebHydrationNotification(
          preferences.daily_goal_ml,
        );

        // Agenda novamente
        // para o dia seguinte.
        scheduleWebReminder(
          hour,
          minute,
          preferences,
        );
      },
      delay,
    );

  const current: any[] =
    runtime[
      WEB_TIMERS_KEY
    ] || [];

  current.push(timer);

  runtime[
    WEB_TIMERS_KEY
  ] = current;
}

async function requestWebPermission() {
  const runtime =
    getWebRuntime();

  const NotificationApi =
    runtime.Notification;

  if (
    !NotificationApi
  ) {
    return {
      supported: false,
      granted: false,
    };
  }

  let permission =
    NotificationApi.permission;

  if (
    permission ===
    'default'
  ) {
    permission =
      await NotificationApi.requestPermission();
  }

  return {
    supported: true,
    granted:
      permission ===
      'granted',
  };
}

/* ==========================================================
   MOBILE
   ========================================================== */

async function prepareNativeNotifications() {
  const Notifications =
    await import(
      'expo-notifications'
    );

  Notifications.setNotificationHandler(
    {
      handleNotification:
        async () => ({
          shouldShowBanner:
            true,

          shouldShowList:
            true,

          shouldPlaySound:
            false,

          shouldSetBadge:
            false,
        }),
    },
  );

  if (
    Platform.OS ===
    'android'
  ) {
    await Notifications.setNotificationChannelAsync(
      'hydration',
      {
        name:
          'Lembretes de hidratação',

        importance:
          Notifications.AndroidImportance
            .HIGH,

        vibrationPattern: [
          0,
          250,
          150,
          250,
        ],
      },
    );
  }

  return Notifications;
}

/* ==========================================================
   PERMISSÃO
   ========================================================== */

export async function requestHydrationNotificationPermission(
  preferences?: HydrationPreferences,
) {
  if (
    preferences &&
    (
      !preferences.enabled ||
      ![
        'app',
        'both',
      ].includes(
        preferences.channel,
      )
    )
  ) {
    return {
      supported: true,
      granted: true,
      count: 0,
      platform:
        Platform.OS ===
        'web'
          ? 'web'
          : 'native',
      persistent:
        Platform.OS !==
        'web',
    } satisfies NotificationResult;
  }

  if (
    Platform.OS ===
    'web'
  ) {
    const permission =
      await requestWebPermission();

    return {
      ...permission,
      count: 0,
      platform: 'web',
      persistent: false,
    } satisfies NotificationResult;
  }

  const Notifications =
    await prepareNativeNotifications();

  const current =
    await Notifications.getPermissionsAsync();

  let permission =
    current;

  if (
    !current.granted
  ) {
    permission =
      await Notifications.requestPermissionsAsync();
  }

  return {
    supported: true,
    granted:
      permission.granted,
    count: 0,
    platform: 'native',
    persistent: true,
  } satisfies NotificationResult;
}

/* ==========================================================
   CANCELAR
   ========================================================== */

export async function cancelHydrationNotifications() {
  if (
    Platform.OS ===
    'web'
  ) {
    clearWebTimers();
    return;
  }

  const Notifications =
    await prepareNativeNotifications();

  const raw =
    await AsyncStorage.getItem(
      IDS_KEY,
    );

  const ids: string[] =
    raw
      ? JSON.parse(raw)
      : [];

  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(
        id,
      ).catch(
        () => undefined,
      ),
    ),
  );

  await AsyncStorage.removeItem(
    IDS_KEY,
  );
}

/* ==========================================================
   AGENDAR
   ========================================================== */

export async function scheduleHydrationNotifications(
  preferences: HydrationPreferences,
): Promise<NotificationResult> {
  await cancelHydrationNotifications();

  if (
    !preferences.enabled ||
    ![
      'app',
      'both',
    ].includes(
      preferences.channel,
    )
  ) {
    return {
      supported: true,
      granted: true,
      count: 0,
      platform:
        Platform.OS ===
        'web'
          ? 'web'
          : 'native',
      persistent:
        Platform.OS !==
        'web',
    };
  }

  const permission =
    await requestHydrationNotificationPermission(
      preferences,
    );

  if (
    !permission.supported ||
    !permission.granted
  ) {
    return permission;
  }

  const times =
    reminderTimes(
      preferences,
    );

  /* WEB */

  if (
    Platform.OS ===
    'web'
  ) {
    for (
      const time of times
    ) {
      scheduleWebReminder(
        time.hour,
        time.minute,
        preferences,
      );
    }

    return {
      supported: true,
      granted: true,
      count:
        times.length,
      platform: 'web',
      persistent: false,
    };
  }

  /* MOBILE */

  const Notifications =
    await prepareNativeNotifications();

  const identifiers: string[] =
    [];

  for (
    const time of times
  ) {
    const id =
      await Notifications.scheduleNotificationAsync(
        {
          content: {
            title:
              'Hora de se hidratar 💧',

            body:
              `Uma pausa rápida para água ajuda a cuidar da sua rotina. ` +
              `Meta do dia: ${preferences.daily_goal_ml} ml.`,

            data: {
              route:
                '/(tabs)/bem-estar',

              kind:
                'hydration',
            },
          },

          trigger: {
            type:
              Notifications
                .SchedulableTriggerInputTypes
                .DAILY,

            hour:
              time.hour,

            minute:
              time.minute,

            channelId:
              Platform.OS ===
              'android'
                ? 'hydration'
                : undefined,
          },
        },
      );

    identifiers.push(
      id,
    );
  }

  await AsyncStorage.setItem(
    IDS_KEY,
    JSON.stringify(
      identifiers,
    ),
  );

  return {
    supported: true,
    granted: true,
    count:
      identifiers.length,
    platform: 'native',
    persistent: true,
  };
}

/* ==========================================================
   TESTE
   ========================================================== */

export async function testHydrationNotification() {
  /* WEB */

  if (
    Platform.OS ===
    'web'
  ) {
    const permission =
      await requestWebPermission();

    if (
      !permission.supported
    ) {
      throw new Error(
        'Este navegador não oferece suporte a notificações.',
      );
    }

    if (
      !permission.granted
    ) {
      throw new Error(
        'Você precisa permitir notificações para o Viva Mais no navegador.',
      );
    }

    const runtime =
      getWebRuntime();

    runtime.setTimeout(
      () => {
        showWebHydrationNotification(
          2000,
        );
      },
      3000,
    );

    return {
      supported: true,
      granted: true,
      seconds: 3,
    };
  }

  /* MOBILE */

  const Notifications =
    await prepareNativeNotifications();

  const permission =
    await Notifications.requestPermissionsAsync();

  if (
    !permission.granted
  ) {
    throw new Error(
      'Permissão de notificações não concedida no celular.',
    );
  }

  await Notifications.scheduleNotificationAsync(
    {
      content: {
        title:
          'Teste do Viva Mais 💧',

        body:
          'As notificações de hidratação estão funcionando corretamente.',

        data: {
          route:
            '/(tabs)/bem-estar',

          kind:
            'hydration-test',
        },
      },

      trigger: {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .TIME_INTERVAL,

        seconds: 3,

        channelId:
          Platform.OS ===
          'android'
            ? 'hydration'
            : undefined,
      },
    },
  );

  return {
    supported: true,
    granted: true,
    seconds: 3,
  };
}
