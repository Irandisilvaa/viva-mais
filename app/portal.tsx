import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function Portal() {
  const { loading, profile } = useAuth();
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!profile) return <Redirect href="/login" />;
  if (profile.role === 'professional') return <Redirect href="/profissional" />;
  if (profile.role === 'manager') return <Redirect href="/gestao" />;
  if (profile.role === 'admin') return <Redirect href="/admin" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
