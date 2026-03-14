import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth-store';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const offlineMode = useAuthStore((s) => s.offlineMode);

  if (session && !offlineMode) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
