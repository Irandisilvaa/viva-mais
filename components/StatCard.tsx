import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function StatCard({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 16, gap: 7 },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  label: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
});
