import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ContentCard } from '@/components/ContentCard';
import { Page } from '@/components/Page';
import { SectionTitle } from '@/components/SectionTitle';
import { colors, radii, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getBookings, getCampaigns, getContents, getServices } from '@/lib/repository';
import { Booking, Campaign, HealthService, LearningContent } from '@/types/domain';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function Home() {
  const { width } = useWindowDimensions();
  const { profile } = useAuth();
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<HealthService[]>([]);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([getContents(), getCampaigns(), getBookings(), getServices()]).then(([c, cp, b, s]) => {
      setContents(c); setCampaigns(cp); setBookings(b); setServices(s);
    });
    Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [fade]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Olá';
  const mobile = width < 620;
  const tablet = width >= 620 && width < 1050;
  const contentBasis = mobile ? '100%' : tablet ? '47%' : '31%';
  const quickBasis = mobile ? '100%' : '47%';
  const serviceBasis = mobile ? '100%' : tablet ? '47%' : '31%';

  const quickItems = [
    { label: 'Agendar', sub: 'Atendimentos e atividades', icon: 'calendar-outline', href: '/(tabs)/agendar', tone: colors.primarySoft, color: colors.primary },
    { label: 'Aprender', sub: 'Conteúdo curto e confiável', icon: 'book-outline', href: '/(tabs)/conteudos', tone: colors.infoSoft, color: colors.info },
    { label: 'Check-in', sub: 'Registro privado de bem-estar', icon: 'pulse-outline', href: '/(tabs)/bem-estar', tone: '#F5EDFF', color: '#7A45C4' },
    ...(profile?.role === 'manager' || profile?.role === 'admin' ? [{ label: 'Gestão', sub: 'Indicadores consolidados', icon: 'bar-chart-outline', href: '/gestao', tone: colors.accentSoft, color: '#9B6500' }] : []),
  ];

  return (
    <Page>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=84' }}
          style={[styles.hero, mobile && styles.heroMobile]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={[styles.heroBody, mobile && styles.heroBodyMobile]}>
            <View style={styles.heroBadge}><Ionicons name="heart" size={14} color="#DDF8EF" /><Text style={styles.heroBadgeText}>VIVA MAIS · SES-SE</Text></View>
            <Text style={[styles.heroTitle, mobile && styles.heroTitleMobile]}>{firstName}, cuidar de você também faz parte do trabalho.</Text>
            <Text style={[styles.heroSubtitle, mobile && styles.heroSubtitleMobile]}>Serviços, conteúdos e ações de saúde em um fluxo simples e direto.</Text>
            <View style={styles.heroActions}>
              <AnimatedPressable style={[styles.primaryAction, mobile && styles.actionMobile]} onPress={() => router.push('/(tabs)/agendar')}>
                <Ionicons name="calendar" size={18} color={colors.white} />
                <Text style={styles.primaryActionText}>Agendar serviço</Text>
              </AnimatedPressable>
              <AnimatedPressable style={[styles.secondaryAction, mobile && styles.actionMobile]} onPress={() => router.push('/(tabs)/conteudos')}>
                <Text style={styles.secondaryActionText}>Ver conteúdos</Text>
              </AnimatedPressable>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <SectionTitle title="Acesso rápido" subtitle="O essencial em poucos toques." />
      <View style={styles.grid}>
        {quickItems.map((item) => (
          <View key={item.label} style={[styles.gridItem, { flexBasis: quickBasis as any }]}>
            <AnimatedPressable style={styles.quickCard} onPress={() => router.push(item.href as any)}>
              <View style={[styles.quickIcon, { backgroundColor: item.tone }]}><Ionicons name={item.icon as any} size={22} color={item.color} /></View>
              <View style={styles.quickText}><Text style={styles.quickTitle}>{item.label}</Text><Text style={styles.quickSub}>{item.sub}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          </View>
        ))}
      </View>

      {bookings[0] && (
        <>
          <SectionTitle title="Próximo compromisso" />
          <View style={[styles.bookingCard, mobile && styles.bookingCardMobile]}>
            <View style={styles.bookingIcon}><Ionicons name="calendar" size={24} color={colors.primary} /></View>
            <View style={styles.bookingText}><Text style={styles.bookingTitle}>{bookings[0].service_title}</Text><Text style={styles.bookingMeta}>{formatDate(bookings[0].starts_at)} · {bookings[0].location}</Text></View>
            <View style={styles.status}><Text style={styles.statusText}>Confirmado</Text></View>
          </View>
        </>
      )}

      {campaigns[0] && (
        <>
          <SectionTitle title="Em destaque" subtitle="Campanhas e ações para participar no seu tempo." />
          <ImageBackground source={{ uri: campaigns[0].image_url }} style={[styles.campaign, mobile && styles.campaignMobile]} imageStyle={styles.campaignImage}>
            <View style={styles.campaignOverlay} />
            <View style={[styles.campaignBody, mobile && styles.campaignBodyMobile]}>
              <Text style={[styles.campaignTitle, mobile && styles.campaignTitleMobile]}>{campaigns[0].title}</Text>
              <Text style={styles.campaignText}>{campaigns[0].description}</Text>
              <AnimatedPressable onPress={() => router.push('/(tabs)/agendar')} style={styles.campaignButton}><Text style={styles.campaignButtonText}>{campaigns[0].cta_label}</Text></AnimatedPressable>
            </View>
          </ImageBackground>
        </>
      )}

      <SectionTitle title="Para você explorar" subtitle="Conteúdos rápidos de promoção da saúde." />
      <View style={styles.grid}>
        {contents.slice(0, 3).map((item) => (
          <View key={item.id} style={[styles.gridItem, { flexBasis: contentBasis as any }]}><ContentCard item={item} onPress={() => router.push(`/conteudo/${item.id}`)} /></View>
        ))}
      </View>

      <SectionTitle title="Serviços disponíveis" />
      <View style={styles.grid}>
        {services.slice(0, 3).map((service) => (
          <View key={service.id} style={[styles.gridItem, { flexBasis: serviceBasis as any }]}>
            <AnimatedPressable onPress={() => router.push(`/servico/${service.id}`)} style={styles.serviceMini}>
              <View style={styles.serviceMiniIcon}><Ionicons name={service.category === 'nutrition' ? 'nutrition-outline' : service.category === 'physical_activity' ? 'walk-outline' : 'body-outline'} size={22} color={colors.primary} /></View>
              <Text style={styles.serviceMiniTitle}>{service.title}</Text>
              <Text style={styles.serviceMiniText}>{service.duration_minutes} min · {service.location}</Text>
            </AnimatedPressable>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 330, borderRadius: 30, overflow: 'hidden', justifyContent: 'flex-end', ...shadow },
  heroMobile: { minHeight: 380, borderRadius: 24 },
  heroImage: { borderRadius: 30 },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,55,46,0.60)' },
  heroBody: { padding: 30, maxWidth: 690, gap: 11 },
  heroBodyMobile: { padding: 20, gap: 10 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 7 },
  heroBadgeText: { color: '#DDF8EF', fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { fontSize: 35, lineHeight: 40, fontWeight: '900', color: colors.white, letterSpacing: -1.1 },
  heroTitleMobile: { fontSize: 28, lineHeight: 33, letterSpacing: -0.8 },
  heroSubtitle: { color: '#E7F6F1', fontSize: 15, lineHeight: 22, maxWidth: 540 },
  heroSubtitleMobile: { fontSize: 14, lineHeight: 20 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  actionMobile: { flexGrow: 1, justifyContent: 'center' },
  primaryAction: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 12 },
  primaryActionText: { color: colors.white, fontWeight: '900' },
  secondaryAction: { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center' },
  secondaryActionText: { color: colors.primaryDark, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'stretch' },
  gridItem: { flexGrow: 1, minWidth: 0 },
  quickCard: { minHeight: 80, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 16 },
  quickIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quickText: { flex: 1, minWidth: 0 },
  quickTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  quickSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  bookingCard: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookingCardMobile: { flexWrap: 'wrap' },
  bookingIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  bookingText: { flex: 1, minWidth: 180, gap: 3 },
  bookingTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  bookingMeta: { color: colors.textMuted, fontSize: 12 },
  status: { backgroundColor: colors.primarySoft, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  campaign: { minHeight: 255, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  campaignMobile: { minHeight: 320 },
  campaignImage: { borderRadius: radii.lg },
  campaignOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(24,32,29,0.54)' },
  campaignBody: { padding: 24, maxWidth: 580, gap: 8 },
  campaignBodyMobile: { padding: 19 },
  campaignTitle: { color: colors.white, fontSize: 25, fontWeight: '900' },
  campaignTitleMobile: { fontSize: 22 },
  campaignText: { color: '#EFF7F4', lineHeight: 20, fontSize: 14 },
  campaignButton: { alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 },
  campaignButtonText: { color: colors.primaryDark, fontWeight: '900' },
  serviceMini: { flex: 1, minHeight: 138, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 16, gap: 8 },
  serviceMiniIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  serviceMiniTitle: { fontSize: 15, fontWeight: '900', color: colors.text },
  serviceMiniText: { fontSize: 12, color: colors.textMuted },
});
