import { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth-store';
import { ThemedText } from '../components/ui/ThemedText';
import { AssistantFAB } from '../components/assistant/AssistantFAB';
import { COLORS } from '../lib/utils/constants';

function HeaderBackButton() {
  return (
    <TouchableOpacity
      onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/dashboard')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ThemedText variant="body" color={COLORS.primary} style={{ fontSize: 16 }}>
        {'< Back'}
      </ThemedText>
    </TouchableOpacity>
  );
}

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
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: COLORS.background },
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="morning-checkin"
            options={{
              title: 'Morning Check-In',
              presentation: 'modal',
              headerLeft: () => (
                <HeaderBackButton />
              ),
            }}
          />
          <Stack.Screen
            name="post-workout"
            options={{
              title: 'Log Activity',
              presentation: 'modal',
              headerLeft: () => (
                <HeaderBackButton />
              ),
            }}
          />
          <Stack.Screen
            name="assistant"
            options={{
              title: 'Recovery Assistant',
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen name="onboarding" options={{ title: 'Athlete Profile', headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="device-setup" options={{ title: 'Connect Device' }} />
          <Stack.Screen name="protocol/[slug]" options={{ title: 'Protocol' }} />
          <Stack.Screen name="import-data" options={{ title: 'Import Data' }} />
          <Stack.Screen name="lab-results" options={{ title: 'Lab Results' }} />
        </Stack>
        <AssistantFAB />
      </View>
    </QueryClientProvider>
  );
}
