import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth-store';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const offlineMode = useAuthStore((s) => s.offlineMode);
  const initialized = useAuthStore((s) => s.initialized);

  // Always show login first until auth is resolved
  if (!initialized) return null;

  // Only skip login if there's a real authenticated session
  if (session && !offlineMode) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Default: always show sign-in screen
  return <Redirect href="/(auth)/sign-in" />;
}
