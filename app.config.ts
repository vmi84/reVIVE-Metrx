import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'reVIVE MetRx',
  slug: 'revive-metrx',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A1628',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.revivemetrx.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A1628',
    },
    package: 'com.revivemetrx.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  scheme: 'revive-metrx',
  plugins: ['expo-router', 'expo-secure-store'],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    whoopClientId: process.env.EXPO_PUBLIC_WHOOP_CLIENT_ID,
    whoopRedirectUri: process.env.EXPO_PUBLIC_WHOOP_REDIRECT_URI,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
