import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'reVIVE Metrx',
  slug: 'revive-metrx',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/logo.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/logo.png',
    resizeMode: 'contain',
    backgroundColor: '#0A1628',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.revivemetrx.app',
    entitlements: {
      'com.apple.developer.healthkit': true,
    },
    infoPlist: {
      NSHealthShareUsageDescription:
        'reVIVE Metrx reads your health data (HRV, heart rate, sleep, workouts, blood oxygen, respiratory rate) to calculate your recovery score and personalized training recommendations.',
    },
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
    whoopClientSecret: process.env.WHOOP_CLIENT_SECRET,
    whoopRedirectUri: process.env.EXPO_PUBLIC_WHOOP_REDIRECT_URI ?? 'revive-metrx://auth/whoop/callback',
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
