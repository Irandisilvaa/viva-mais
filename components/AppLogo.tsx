import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/constants/theme';

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}><Ionicons name="heart" size={20} color={colors.white} /></View>
      {!compact && (
        <View>
          <Text style={styles.title}>Viva Mais</Text>
          <Text style={styles.subtitle}>Saúde do trabalhador</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: -1 },
});
