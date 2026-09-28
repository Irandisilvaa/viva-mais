import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Page } from '@/components/Page';
import { Pill } from '@/components/Pill';
import { colors, radii } from '@/constants/theme';
import { getContent } from '@/lib/repository';
import { LearningContent } from '@/types/domain';

export default function ContentDetail() {
  const { width } = useWindowDimensions();
  const mobile = width < 620;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<LearningContent | null>(null);
  useEffect(() => { getContent(id).then(setItem); }, [id]);
  if (!item) return <Page narrow><Text style={{ color: colors.textMuted }}>Carregando...</Text></Page>;
  return (
    <Page narrow>
      <AnimatedPressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={19} color={colors.text} /><Text style={styles.backText}>Voltar</Text></AnimatedPressable>
      <Image source={{ uri: item.image_url }} style={[styles.hero, mobile && styles.heroMobile]} />
      <View style={styles.meta}><Pill label={`${item.duration_minutes} min`} tone="blue" />{item.official_guide ? <Pill label="Fonte oficial" /> : null}</View>
      <Text style={[styles.title, mobile && styles.titleMobile]}>{item.title}</Text>
      <Text style={[styles.excerpt, mobile && styles.excerptMobile]}>{item.excerpt}</Text>
      <View style={[styles.article, mobile && styles.articleMobile]}><Text style={styles.body}>{item.body}</Text></View>
      {item.source_label && <View style={[styles.source, mobile && styles.sourceMobile]}><Ionicons name="link-outline" size={19} color={colors.primary} /><View style={styles.sourceTextWrap}><Text style={styles.sourceTitle}>Referência do conteúdo</Text><Text style={styles.sourceText}>{item.source_label}</Text></View>{item.source_url ? <AnimatedPressable onPress={() => Linking.openURL(item.source_url!)} style={[styles.sourceButton, mobile && styles.sourceButtonMobile]}><Text style={styles.sourceButtonText}>Abrir</Text></AnimatedPressable> : null}</View>}
      <View style={styles.disclaimer}><Ionicons name="medical-outline" size={19} color={colors.textMuted} /><Text style={styles.disclaimerText}>Conteúdo de promoção e educação em saúde. Não substitui avaliação ou orientação individual de profissional habilitado.</Text></View>
    </Page>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 5 },
  backText: { color: colors.text, fontWeight: '800' },
  hero: { width: '100%', height: 330, borderRadius: radii.lg, backgroundColor: colors.primarySoft },
  heroMobile: { height: 230 },
  meta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  title: { color: colors.text, fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: -0.9, maxWidth: 850 },
  titleMobile: { fontSize: 26, lineHeight: 31 },
  excerpt: { color: colors.textMuted, fontSize: 16, lineHeight: 24, maxWidth: 850 },
  excerptMobile: { fontSize: 14, lineHeight: 21 },
  article: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 23 },
  articleMobile: { padding: 17 },
  body: { color: colors.text, fontSize: 15, lineHeight: 25 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radii.md, padding: 14 },
  sourceMobile: { flexWrap: 'wrap' },
  sourceTextWrap: { flex: 1, minWidth: 180 },
  sourceTitle: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 },
  sourceText: { color: colors.primaryDark, fontSize: 11, marginTop: 2 },
  sourceButton: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 8 },
  sourceButtonMobile: { width: '100%', alignItems: 'center' },
  sourceButtonText: { color: colors.white, fontWeight: '900', fontSize: 11 },
  disclaimer: { flexDirection: 'row', gap: 9, padding: 14, backgroundColor: '#EEF2F1', borderRadius: radii.md },
  disclaimerText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
