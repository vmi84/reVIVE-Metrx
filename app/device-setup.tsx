import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useAuth } from '../hooks/use-auth';
import { useSyncStore } from '../store/sync-store';
import { useDailyStore } from '../store/daily-store';
import { Card } from '../components/ui/Card';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { COLORS, WHOOP_AUTH_URL, WHOOP_TOKEN_URL } from '../lib/utils/constants';

WebBrowser.maybeCompleteAuthSession();

export default function DeviceSetup() {
  const { updateProfile, profile } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [whoopConnected, setWhoopConnected] = useState(false);

  const extra = Constants.expoConfig?.extra ?? {};
  const clientId = extra.whoopClientId ?? '';
  const clientSecret = extra.whoopClientSecret ?? '';
  // makeRedirectUri generates the correct URI for the current environment.
  // The path must match what's registered in the Whoop Developer Portal.
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'revive-metrx',
    path: 'auth/whoop/callback',
  });

  const discovery = {
    authorizationEndpoint: WHOOP_AUTH_URL,
    tokenEndpoint: WHOOP_TOKEN_URL,
  };

  // Check connection status on mount
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('whoop_access_token');
      setWhoopConnected(!!token);
    })();
  }, []);

  async function connectWhoop() {
    if (!clientId) {
      Alert.alert('Configuration Error', 'Whoop Client ID not configured. Add EXPO_PUBLIC_WHOOP_CLIENT_ID to .env');
      return;
    }
    if (!clientSecret) {
      Alert.alert('Configuration Error', 'Whoop Client Secret not configured. Add WHOOP_CLIENT_SECRET to .env');
      return;
    }

    // Log the redirect URI so the developer can register it in the Whoop portal
    console.log('[Whoop OAuth] Redirect URI:', redirectUri);

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
        // Exchange code for token — manual fetch because Whoop requires client_secret
        const tokenRes = await fetch(WHOOP_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: result.params.code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
          }).toString(),
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          // Provide actionable error messages for common OAuth failures
          if (tokenRes.status === 400 && errText.includes('redirect_uri')) {
            throw new Error(
              `Redirect URI mismatch. The URI registered with Whoop must exactly match: ${redirectUri}`,
            );
          }
          if (tokenRes.status === 401) {
            throw new Error('Invalid client credentials. Check your WHOOP_CLIENT_SECRET in .env');
          }
          throw new Error(`Token exchange failed (${tokenRes.status}): ${errText}`);
        }

        const tokenData = await tokenRes.json() as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };

        // Store tokens securely
        await SecureStore.setItemAsync('whoop_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          await SecureStore.setItemAsync('whoop_refresh_token', tokenData.refresh_token);
        }
        // Store expiry for auto-refresh
        const expiresAt = Date.now() + tokenData.expires_in * 1000;
        await SecureStore.setItemAsync('whoop_token_expires_at', String(expiresAt));

        // Update profile — works in online mode
        try {
          const devices = [...(profile?.connected_devices ?? [])];
          if (!devices.includes('whoop')) devices.push('whoop');
          await updateProfile({
            connected_devices: devices,
            primary_device: 'whoop',
          });
        } catch {
          // Offline mode — profile update is optional
        }

        // Mark device as connected in local stores
        useDailyStore.getState().setDeviceSynced(true, 'whoop');
        useSyncStore.getState().setLastDeviceSync(new Date().toISOString(), 'whoop');
        setWhoopConnected(true);

        Alert.alert('Success', 'Whoop connected! Your data will sync automatically.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect Whoop';
      Alert.alert('Connection Error', msg);
    } finally {
      setConnecting(false);
    }
  }

  async function refreshAndSync() {
    setConnecting(true);
    try {
      const refreshToken = await SecureStore.getItemAsync('whoop_refresh_token');
      if (!refreshToken) {
        Alert.alert('Session Expired', 'No refresh token available. Please reconnect.', [
          { text: 'Reconnect', onPress: () => { setWhoopConnected(false); } },
        ]);
        return;
      }

      // Attempt token refresh
      const res = await fetch(WHOOP_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401 || res.status === 400) {
          // Refresh token expired — need full re-auth
          await SecureStore.deleteItemAsync('whoop_access_token');
          await SecureStore.deleteItemAsync('whoop_refresh_token');
          await SecureStore.deleteItemAsync('whoop_token_expires_at');
          setWhoopConnected(false);
          Alert.alert('Session Expired', 'Your Whoop session has expired. Please reconnect.');
          return;
        }
        throw new Error(`Token refresh failed (${res.status}): ${errText}`);
      }

      const data = await res.json() as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };

      // Store refreshed tokens
      await SecureStore.setItemAsync('whoop_access_token', data.access_token);
      if (data.refresh_token) {
        await SecureStore.setItemAsync('whoop_refresh_token', data.refresh_token);
      }
      const expiresAt = Date.now() + data.expires_in * 1000;
      await SecureStore.setItemAsync('whoop_token_expires_at', String(expiresAt));

      // Clear sync error
      useSyncStore.getState().setSyncError(null);
      useDailyStore.getState().setDeviceSynced(true, 'whoop');

      Alert.alert('Connection Refreshed', 'Token refreshed. Returning to Dashboard to sync.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh connection';
      Alert.alert('Refresh Failed', msg);
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectWhoop() {
    Alert.alert(
      'Disconnect Whoop',
      'This will remove your Whoop connection. Imported data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setDisconnecting(true);
            try {
              await SecureStore.deleteItemAsync('whoop_access_token');
              await SecureStore.deleteItemAsync('whoop_refresh_token');
              await SecureStore.deleteItemAsync('whoop_token_expires_at');

              try {
                const devices = (profile?.connected_devices ?? []).filter(d => d !== 'whoop');
                await updateProfile({
                  connected_devices: devices,
                  primary_device: devices[0] ?? null,
                });
              } catch {
                // Offline — profile update optional
              }

              setWhoopConnected(false);
            } catch {
              Alert.alert('Error', 'Failed to disconnect Whoop.');
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ],
    );
  }

  const lastSync = useSyncStore.getState().lastDeviceSync;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Whoop</ThemedText>
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.description}>
          Connect your Whoop to automatically sync HRV, RHR, sleep, respiratory rate, SpO2, skin temperature, and workout data.
        </ThemedText>
        {whoopConnected ? (
          <View>
            <View style={styles.connectedRow}>
              <View style={styles.connectedDot} />
              <ThemedText variant="body" color={COLORS.success}>Connected</ThemedText>
            </View>
            {lastSync && (
              <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                Last synced: {new Date(lastSync).toLocaleString()}
              </ThemedText>
            )}
            <Button
              title="Refresh Connection & Sync"
              variant="secondary"
              onPress={refreshAndSync}
              loading={connecting}
              style={styles.connectButton}
            />
            <Button
              title="Disconnect"
              variant="ghost"
              onPress={disconnectWhoop}
              loading={disconnecting}
              style={{ ...styles.connectButton, opacity: 0.7 }}
            />
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
