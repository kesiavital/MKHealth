// app/_layout.tsx (arquivo raiz, não dentro de (tabs))
import { Stack } from 'expo-router';
import { ExamesProvider } from '../service/ExamesContext';

export default function RootLayout() {
  return (
    <ExamesProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ExamesProvider>
  );
}