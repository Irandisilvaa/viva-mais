import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Pill } from '@/components/Pill';
import { colors, radii, shadow } from '@/constants/theme';
import { HealthService } from '@/types/domain';

const category: Record<string, string> = {
  nutrition: 'Nutrição',
  physical_activity: 'Movimento',
  wellbeing: 'Bem-estar',
  ergonomics: 'Ergonomia',
};

export function ServiceCard({ service, onPress }: { service: HealthService; onPress: () => void }) {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: service.image_url }} style={styles.image} />
      <View style={styles.body}>
        <Pill label={category[service.category] ?? service.category} />
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{service.duration_minutes} min</Text>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{service.location}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow },
  image: { width: '100%', height: 154, backgroundColor: colors.primarySoft },
  body: { padding: 16, gap: 9 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  description: { color: colors.textMuted, lineHeight: 20, fontSize: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: colors.textMuted, marginRight: 8, maxWidth: 160 },
});
