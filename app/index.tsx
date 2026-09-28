import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AppLogo } from '@/components/AppLogo';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const modules = [
  ['calendar-outline', 'Agendamento', 'Serviços, horários, vagas e acompanhamento em um único fluxo.'],
  ['library-outline', 'Informação e formação', 'Conteúdos curtos, trilhas e materiais educativos para a rotina de trabalho.'],
  ['pulse-outline', 'Saúde e bem-estar', 'Check-ins opcionais, autocuidado e lembretes configuráveis.'],
  ['megaphone-outline', 'Campanhas', 'Ações institucionais, desafios e comunicação com os trabalhadores.'],
  ['bar-chart-outline', 'Indicadores', 'Dados consolidados para apoiar o planejamento da gestão.'],
  ['settings-outline', 'Administração', 'Perfis, serviços, conteúdos, campanhas e operação da plataforma.'],
] as const;

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const { profile, isDemo } = useAuth();
  const compact = width < 760;
  const twoColumns = width >= 980;
  const contentWidth = Math.min(width - (compact ? 28 : 56), 1320);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.container, { width: contentWidth }]}> 
          <View style={styles.topbar}>
            <AppLogo />
            <View style={styles.topActions}>
              {profile ? (
                <AnimatedPressable style={styles.ghostButton} onPress={() => router.push('/portal')}>
                  <Text style={styles.ghostButtonText}>Minha área</Text>
                </AnimatedPressable>
              ) : null}
              <AnimatedPressable style={styles.primarySmall} onPress={() => router.push('/login')}>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.primarySmallText}>{profile ? 'Trocar usuário' : 'Entrar'}</Text>
              </AnimatedPressable>
            </View>
          </View>

          <View style={[styles.heroShell, !twoColumns && styles.heroStack]}>
            <View style={styles.heroCopy}>
              <View style={styles.badge}><Ionicons name="heart-outline" size={16} color={colors.primary} /><Text style={styles.badgeText}>Saúde do trabalhador • SES-SE</Text></View>
              <Text style={[styles.heroTitle, compact && styles.heroTitleMobile]}>Cuidado, informação e gestão em uma experiência simples.</Text>
              <Text style={styles.heroText}>O Viva Mais integra agendamento de ações de saúde, conteúdos educativos, bem-estar, campanhas e indicadores em uma única plataforma pensada para a rotina dos trabalhadores.</Text>
              <View style={[styles.heroButtons, compact && styles.heroButtonsMobile]}>
                <AnimatedPressable style={[styles.heroPrimary, compact && styles.fullButton]} onPress={() => router.push('/login')}>
                  <Text style={styles.heroPrimaryText}>{isDemo ? 'Explorar demonstração' : 'Acessar a plataforma'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </AnimatedPressable>
                <AnimatedPressable style={[styles.heroSecondary, compact && styles.fullButton]} onPress={() => router.push('/login')}>
                  <Ionicons name="people-outline" size={18} color={colors.primary} />
                  <Text style={styles.heroSecondaryText}>4 perfis de acesso</Text>
                </AnimatedPressable>
              </View>
              <View style={styles.profileRow}>
                {['Trabalhador', 'Profissional', 'Gestão', 'Administrador'].map((item) => <View key={item} style={styles.profilePill}><Text style={styles.profilePillText}>{item}</Text></View>)}
              </View>
            </View>

            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=84' }} style={[styles.heroImage, !twoColumns && styles.heroImageStack]} imageStyle={styles.heroImageRadius}>
              <View style={styles.imageOverlay} />
              <View style={styles.imageCard}>
                <View style={styles.imageCardIcon}><Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} /></View>
                <View style={{ flex: 1 }}><Text style={styles.imageCardTitle}>Privacidade desde o MVP</Text><Text style={styles.imageCardText}>Perfis separados, dados individuais protegidos e gestão com visão consolidada.</Text></View>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionKicker}>UMA PLATAFORMA, SEIS FRENTES</Text><Text style={styles.sectionTitle}>Tudo que o trabalhador precisa, sem excesso de telas.</Text></View>
          <View style={[styles.moduleGrid, compact && styles.moduleGridMobile]}>
            {modules.map(([icon, title, text]) => (
              <View key={title} style={styles.moduleCard}>
                <View style={styles.moduleIcon}><Ionicons name={icon as any} size={22} color={colors.primary} /></View>
                <Text style={styles.moduleTitle}>{title}</Text>
                <Text style={styles.moduleText}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.cta, compact && styles.ctaMobile]}>
            <View style={{ flex: 1, minWidth: 0 }}><Text style={styles.ctaTitle}>Pronto para entrar no Viva Mais?</Text><Text style={styles.ctaText}>Use sua conta institucional. O sistema direciona automaticamente para o perfil correto.</Text></View>
            <AnimatedPressable style={[styles.heroPrimary, compact && styles.fullButton]} onPress={() => router.push('/login')}><Text style={styles.heroPrimaryText}>Entrar</Text><Ionicons name="log-in-outline" size={18} color="#fff" /></AnimatedPressable>
          </View>

          <Text style={styles.footer}>Viva Mais • MVP PET-Saúde Informação e Saúde Digital</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingVertical: 18 },
  container: { alignSelf: 'center', gap: 30 },
  topbar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghostButton: { minHeight: 42, borderRadius: radii.pill, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: '#fff' },
  ghostButtonText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  primarySmall: { minHeight: 42, borderRadius: radii.pill, paddingHorizontal: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  primarySmallText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  heroShell: { flexDirection: 'row', gap: 24, alignItems: 'stretch' },
  heroStack: { flexDirection: 'column' },
  heroCopy: { flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 24 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  badgeText: { color: colors.primaryDark, fontWeight: '900', fontSize: 11 },
  heroTitle: { color: colors.text, fontSize: 52, lineHeight: 57, letterSpacing: -1.4, fontWeight: '900', maxWidth: 680 },
  heroTitleMobile: { fontSize: 38, lineHeight: 43, letterSpacing: -0.8 },
  heroText: { color: colors.textMuted, fontSize: 17, lineHeight: 27, maxWidth: 680 },
  heroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  heroButtonsMobile: { flexDirection: 'column' },
  heroPrimary: { minHeight: 52, borderRadius: radii.md, paddingHorizontal: 20, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  heroPrimaryText: { color: '#fff', fontWeight: '900' },
  heroSecondary: { minHeight: 52, borderRadius: radii.md, paddingHorizontal: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderStrong, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  heroSecondaryText: { color: colors.primaryDark, fontWeight: '900' },
  fullButton: { width: '100%' },
  profileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profilePill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  profilePillText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  heroImage: { flex: 1, minHeight: 560, borderRadius: 30, overflow: 'hidden', justifyContent: 'flex-end', padding: 22, ...shadow },
  heroImageStack: { minHeight: 410 },
  heroImageRadius: { borderRadius: 30 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,50,42,.18)' },
  imageCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.94)', padding: 16, borderRadius: radii.lg },
  imageCardIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  imageCardTitle: { color: colors.text, fontWeight: '900', fontSize: 14 },
  imageCardText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 3 },
  sectionHeader: { gap: 8, alignItems: 'center', paddingTop: 18 },
  sectionKicker: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  sectionTitle: { color: colors.text, fontSize: 30, lineHeight: 37, fontWeight: '900', textAlign: 'center', maxWidth: 720 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  moduleGridMobile: { flexDirection: 'column' },
  moduleCard: { flexGrow: 1, flexBasis: 360, minWidth: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 20, gap: 10, ...shadow },
  moduleIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  moduleTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  moduleText: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  cta: { flexDirection: 'row', gap: 18, alignItems: 'center', borderRadius: 28, padding: 26, backgroundColor: colors.primarySoft },
  ctaMobile: { flexDirection: 'column', alignItems: 'stretch' },
  ctaTitle: { color: colors.primaryDark, fontWeight: '900', fontSize: 24 },
  ctaText: { color: colors.primaryDark, opacity: 0.82, marginTop: 6, lineHeight: 21 },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: 11, paddingBottom: 20 },
});
