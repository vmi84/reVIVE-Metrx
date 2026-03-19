import { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { useAuthStore } from '../../store/auth-store';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function SignIn() {
  const { signIn, loading } = useAuth();
  const offlineMode = useAuthStore((s) => s.offlineMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignIn() {
    setError('');

    // When Supabase is configured, require real credentials
    if (isSupabaseConfigured) {
      try {
        await signIn(email, password);
        router.replace('/(tabs)/dashboard');
      } catch (err: any) {
        setError(err.message ?? 'Sign in failed');
      }
      return;
    }

    // Offline / demo — go straight to dashboard
    router.replace('/(tabs)/dashboard');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <ThemedText variant="title" style={styles.title}>
            reVIVE Metrx
          </ThemedText>
          <ThemedText variant="body" style={styles.subtitle}>
            Integrated Athlete Condition Index (IACI)
          </ThemedText>

          {offlineMode && (
            <View style={styles.offlineBanner}>
              <ThemedText variant="caption" style={styles.offlineText}>
                Running in demo mode.{'\n'}
                Add Supabase credentials to .env for full auth.
              </ThemedText>
            </View>
          )}

          {error ? (
            <ThemedText variant="caption" color={COLORS.error} style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          {/* Email / password fields — always shown so hooks are in place */}
          <TextInput
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            title={isSupabaseConfigured ? 'Sign In' : 'Enter App'}
            onPress={handleSignIn}
            loading={loading}
            disabled={isSupabaseConfigured && (!email || !password)}
            style={styles.button}
          />

          <Link href="/(auth)/sign-up" style={styles.link}>
            <ThemedText variant="body" color={COLORS.primary}>
              Don't have an account? Sign up
            </ThemedText>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: -40,
    overflow: 'hidden',
    height: 260,
  },
  logoImage: {
    width: 320,
    height: 320,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 32,
    fontSize: 14,
  },
  offlineBanner: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  offlineText: {
    textAlign: 'center',
    color: COLORS.warning,
    lineHeight: 18,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  link: {
    textAlign: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
});
