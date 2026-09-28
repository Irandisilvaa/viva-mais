import { Image, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Pill } from '@/components/Pill';
import { colors, radii, shadow } from '@/constants/theme';
import { LearningContent } from '@/types/domain';

export function ContentCard({ item, onPress }: { item: LearningContent; onPress: () => void }) {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Pill label={`${item.duration_minutes} min`} tone="blue" />
          {item.official_guide ? <Pill label="Fonte oficial" /> : null}
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>{item.excerpt}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, ...shadow },
  image: { width: '100%', height: 150, backgroundColor: colors.primarySoft },
  body: { padding: 15, gap: 10 },
  row: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, lineHeight: 22 },
  excerpt: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
});
