import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  ''
).trim();

export const SUPABASE_CONFIGURED =
  /^https:\/\/.+\.supabase\.co$/i.test(supabaseUrl) &&
  (supabaseKey.startsWith('sb_publishable_') || supabaseKey.startsWith('eyJ'));

export const SUPABASE_CONFIG_ERROR = DEMO_MODE || SUPABASE_CONFIGURED
  ? null
  : 'Supabase não configurado. Confira EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env e reinicie o Expo com cache limpo.';

type GlobalWithSupabase = typeof globalThis & {
  __vivaMaisSupabase?: SupabaseClient;
};

const globalForSupabase = globalThis as GlobalWithSupabase;

function buildClient() {
  return createClient(
    SUPABASE_CONFIGURED ? supabaseUrl : 'https://example.supabase.co',
    SUPABASE_CONFIGURED ? supabaseKey : 'sb_publishable_demo',
    {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        storageKey: 'viva-mais-auth-v6',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
}

// Em desenvolvimento o Metro/HMR pode reavaliar módulos. Reutilizamos a mesma
// instância para impedir múltiplos GoTrueClient usando a mesma storage key.
export const supabase = globalForSupabase.__vivaMaisSupabase ?? buildClient();

if (__DEV__) {
  globalForSupabase.__vivaMaisSupabase = supabase;
}
