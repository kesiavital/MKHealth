import { Stack } from 'expo-router';
import { ExamesProvider } from './_context/ExamesContext';

export default function RootLayout() {
  return (
    <ExamesProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false // <--- Isso remove a barra branca do topo de TUDO
        }}
      >
        {/* Telas que NÃO tem abas embaixo */}
        <Stack.Screen name="index" />  {/* Login */}
        <Stack.Screen name="admin" />  {/* Área do Médico */}
        <Stack.Screen name="esqueci" />
        <Stack.Screen name="sobre" />

        {/* Aqui carregamos as Abas (Home, Perfil, etc) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ExamesProvider>
  );
}