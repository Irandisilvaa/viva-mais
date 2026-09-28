import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { colors } from '@/constants/theme';
export default function RootLayout() {
  return <AuthProvider><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}>
    <Stack.Screen name="index"/><Stack.Screen name="login"/><Stack.Screen name="portal"/><Stack.Screen name="(tabs)"/><Stack.Screen name="servico/[id]"/><Stack.Screen name="inscricao/[slotId]"/><Stack.Screen name="conteudo/[id]"/>
    <Stack.Screen name="profissional/index"/><Stack.Screen name="profissional/atividades"/><Stack.Screen name="profissional/presencas"/>
    <Stack.Screen name="gestao/index"/><Stack.Screen name="admin/index"/><Stack.Screen name="admin/usuarios"/><Stack.Screen name="admin/conteudo"/>
  </Stack></AuthProvider>;
}
