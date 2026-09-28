import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const hideOnDesktop = Platform.OS === 'web' && width >= 1120;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7B8A85',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
        tabBarStyle: hideOnDesktop
          ? { display: 'none' }
          : {
              height: 74,
              paddingTop: 8,
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="agendar" options={{ title: 'Agendar', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="conteudos" options={{ title: 'Conteúdos', tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="bem-estar" options={{ title: 'Bem-estar', tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
