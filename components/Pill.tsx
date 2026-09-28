import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function Pill({ label, tone = 'green' }: { label: string; tone?: 'green' | 'blue' | 'amber' }) {
  const bg = tone === 'blue' ? colors.infoSoft : tone === 'amber' ? colors.accentSoft : colors.primarySoft;
  const fg = tone === 'blue' ? colors.info : tone === 'amber' ? '#9B6500' : colors.primaryDark;
  return <View style={[styles.pill, { backgroundColor: bg }]}><Text style={[styles.text, { color: fg }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  text: { fontSize: 11, fontWeight: '800' },
});
