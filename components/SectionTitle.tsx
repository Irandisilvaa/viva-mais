import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
