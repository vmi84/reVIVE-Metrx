import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useAuth } from '../hooks/use-auth';
import { Card } from '../components/ui/Card';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { COLORS, WHOOP_AUTH_URL, WHOOP_TOKEN_URL } from '../lib/utils/constants';

WebBrowser.maybeCompleteAuthSession();

export default function DeviceSetup() {
  const { updateProfile, profile } = useAuth();
  const [connecting, setConnecting] = useState(false);

  const clientId = Constants.expoConfig?.extra?.whoopClientId ?? '';
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'athlete-recovery' });

  const discovery = {
    authorizationEndpoint: WHOOP_AUTH_URL,
    tokenEndpoint: WHOOP_TOKEN_URL,
  };

  async function connectWhoop() {
    if (!clientId) {
      Alert.alert('Configuration Error', 'Whoop Client ID not configured.');
      return;
    }

    setConnecting(true);
    try {
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['read:recovery', 'read:sleep', 'read:workout', 'read:profile', 'read:cycles'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success' && result.params.code) {
        // Exchange code for token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: result.params.code,
            redirectUri,
          },
          discovery,
        );

        // Store tokens securely
        await SecureStore.setItemAsync('whoop_access_token', tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
          await SecureStore.setItemAsync('whoop_refresh_token', tokenResponse.refreshToken);
        }

        // Update profile
        const devices = [...(profile?.connected_devices ?? [])];
        if (!devices.includes('whoop')) devices.push('whoop');
        await updateProfile({
          connected_devices: devices,
          primary_device: 'whoop',
        });

        Alert.alert('Success', 'Whoop connected successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect Whoop. Please try again.');
    } finally {
      setConnecting(false);
    }
  }

  const isWhoopConnected = (profile?.connected_devices ?? []).includes('whoop');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Whoop</ThemedText>
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.description}>
          Connect your Whoop to automatically sync HRV, RHR, sleep, respiratory rate, SpO2, skin temperature, and workout data.
        </ThemedText>
        {isWhoopConnected ? (
          <View style={styles.connectedRow}>
            <View style={styles.connectedDot} />
            <ThemedText variant="body" color={COLORS.success}>Connected</ThemedText>
          </View>
        ) : (
          <Button
            title="Connect Whoop"
            onPress={connectWhoop}
            loading={connecting}
            style={styles.connectButton}
          />
        )}
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>CSV Import</ThemedText>
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.description}>
          Import data from Whoop CSV export or other wearable devices.
        </ThemedText>
        <Button
          title="Import CSV"
          variant="secondary"
          onPress={() => router.push('/import-data')}
          style={styles.connectButton}
        />
      </Card>

      {/* Future devices */}
      <Card style={[styles.section, styles.futureCard]}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          COMING SOON
        </ThemedText>
        {['Garmin', 'Oura', 'Apple Watch', 'Polar', 'COROS'].map((device) => (
          <View key={device} style={styles.futureRow}>
            <ThemedText variant="body" color={COLORS.textMuted}>{device}</ThemedText>
            <ThemedText variant="caption" color={COLORS.textMuted}>Phase 2</ThemedText>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  connectButton: {
    marginTop: 4,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  connectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  futureCard: {
    opacity: 0.7,
  },
  futureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
