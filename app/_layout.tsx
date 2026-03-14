import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth-store';
import { COLORS } from '../lib/utils/constants';

const queryClient = new QueryClient();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="morning-checkin" options={{ title: 'Morning Check-In', presentation: 'modal' }} />
        <Stack.Screen name="post-workout" options={{ title: 'Post-Workout', presentation: 'modal' }} />
        <Stack.Screen name="device-setup" options={{ title: 'Connect Device' }} />
        <Stack.Screen name="protocol/[slug]" options={{ title: 'Protocol' }} />
      </Stack>
    </QueryClientProvider>
  );
}
