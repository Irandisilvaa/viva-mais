import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_MODE, SUPABASE_CONFIG_ERROR, supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types/domain';

const DEMO_ROLE_KEY = 'viva-mais-demo-role-v6';

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemo: (role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(error?: AuthError | null) {
  const code = (error as any)?.code?.toLowerCase?.() ?? '';
  const message = error?.message?.toLowerCase() ?? '';
  if (message.includes('invalid api key') || message.includes('apikey')) return 'Chave pública do Supabase inválida. Confira o .env e reinicie com: npx expo start -c';
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'Seu e-mail ainda não foi confirmado no Supabase. Em Authentication → Users, confirme o usuário ou recrie-o com Auto Confirm User marcado.';
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'E-mail ou senha inválidos. Confira o usuário em Authentication → Users e redefina a senha se necessário.';
  if (code === 'user_banned') return 'Este usuário está bloqueado no Supabase.';
  return error?.message || 'Não foi possível autenticar.';
}

const demoNames: Record<UserRole, [string,string]> = {
  worker: ['Servidor(a) SES-SE', 'Administração Central'],
  professional: ['Profissional de Saúde', 'Núcleo de Atenção ao Servidor'],
  manager: ['Gestão SES-SE', 'Gestão'],
  admin: ['Administrador(a) Viva Mais', 'Tecnologia da Informação'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('id,full_name,role,sector,unit:units(name),organization:organizations(name)').eq('id', userId).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Perfil não encontrado. Execute schema.sql/seed.sql ou a migration correspondente e configure-demo-users.sql no Supabase.');
    setProfile({ id: data.id, full_name: data.full_name, role: data.role, sector: (data as any).sector ?? null, unit_name: (data as any).unit?.name ?? null, organization_name: (data as any).organization?.name ?? null });
  }

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (DEMO_MODE) {
        const role = (await AsyncStorage.getItem(DEMO_ROLE_KEY)) as UserRole | null;
        if (mounted && role) {
          const [full_name, unit_name] = demoNames[role];
          setProfile({ id: `demo-${role}`, full_name, role, unit_name, organization_name: 'Secretaria de Estado da Saúde de Sergipe' });
        }
        if (mounted) setLoading(false);
        return;
      }
      if (SUPABASE_CONFIG_ERROR) { if (mounted) setLoading(false); return; }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    }
    bootstrap().catch(() => mounted && setLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (DEMO_MODE || SUPABASE_CONFIG_ERROR || !mounted) return;
      setSession(next);
      if (next?.user) { try { await loadProfile(next.user.id); } catch { setProfile(null); } }
      else setProfile(null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    loading, session, profile, isDemo: DEMO_MODE,
    signIn: async (email, password) => {
      if (SUPABASE_CONFIG_ERROR) throw new Error(SUPABASE_CONFIG_ERROR);
      // Ao trocar de usuário, elimina uma sessão anterior antes de autenticar novamente.
      const current = await supabase.auth.getSession();
      if (current.data.session) await supabase.auth.signOut({ scope: 'local' });
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw new Error(friendlyAuthError(error));
      if (!data.user) throw new Error('Usuário não identificado.');
      await loadProfile(data.user.id);
    },
    signUp: async (name, email, password) => {
      if (SUPABASE_CONFIG_ERROR) throw new Error(SUPABASE_CONFIG_ERROR);
      const { error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { full_name: name.trim() } } });
      if (error) throw new Error(friendlyAuthError(error));
    },
    signOut: async () => {
      if (DEMO_MODE) await AsyncStorage.removeItem(DEMO_ROLE_KEY); else await supabase.auth.signOut({ scope: 'local' });
      setSession(null);
      setProfile(null);
    },
    enterDemo: async (role) => {
      await AsyncStorage.setItem(DEMO_ROLE_KEY, role);
      const [full_name, unit_name] = demoNames[role];
      setProfile({ id: `demo-${role}`, full_name, role, unit_name, organization_name: 'Secretaria de Estado da Saúde de Sergipe' });
    },
  }), [loading, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth fora do AuthProvider'); return ctx; }
