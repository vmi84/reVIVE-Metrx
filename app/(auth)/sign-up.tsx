import { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';

export default function SignUp() {
  const { signUp, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignUp() {
    setError('');
    try {
      await signUp(email, password, fullName);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <ThemedText variant="title" style={styles.title}>
          Create Account
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Start tracking your recovery
        </ThemedText>

        {error ? (
          <ThemedText variant="caption" color={COLORS.error} style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <TextInput
          placeholder="Full Name"
          placeholderTextColor={COLORS.textMuted}
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />

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
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          disabled={!email || !password || !fullName}
          style={styles.button}
        />

        <Link href="/(auth)/sign-in" style={styles.link}>
          <ThemedText variant="body" color={COLORS.primary}>
            Already have an account? Sign in
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
