import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { colors } from '@/constants/theme';

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <BrandMark size={40} />

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -1,
  },
});
