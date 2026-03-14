import { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';

export default function SignIn() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignIn() {
    setError('');
    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <ThemedText variant="title" style={styles.title}>
          Athlete Recovery
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Sign in to your account
        </ThemedText>

        {error ? (
          <ThemedText variant="caption" color={COLORS.error} style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

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
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          disabled={!email || !password}
          style={styles.button}
        />

        <Link href="/(auth)/sign-up" style={styles.link}>
          <ThemedText variant="body" color={COLORS.primary}>
            Don't have an account? Sign up
          </ThemedText>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 32,
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
    height: 48,
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
    marginTop: 20,
    alignSelf: 'center',
  },
});
