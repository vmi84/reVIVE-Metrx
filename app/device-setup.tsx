import { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
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

type DeviceStatus = 'available' | 'beta' | 'planned';
const WEARABLE_CATALOG: Array<{ name: string; description: string; status: DeviceStatus }> = [
  { name: 'Whoop', description: 'HRV, recovery, sleep, strain, SpO2', status: 'available' },
  { name: 'Garmin', description: 'HRV, sleep, training load, body battery', status: 'planned' },
  { name: 'Apple Watch', description: 'HRV, sleep, activity, blood oxygen', status: 'planned' },
  { name: 'Oura Ring', description: 'HRV, sleep staging, readiness, temperature', status: 'planned' },
  { name: 'Polar', description: 'HRV, sleep, training load, orthostatic test', status: 'planned' },
  { name: 'COROS', description: 'HRV, sleep, training load, EvoLab', status: 'planned' },
  { name: 'Samsung Galaxy Watch', description: 'HRV, sleep, body composition, blood oxygen', status: 'planned' },
  { name: 'Terra API', description: 'Unified API — connect 50+ wearables', status: 'planned' },
  { name: 'Fitbit', description: 'HRV, sleep, stress management, SpO2', status: 'planned' },
  { name: 'Suunto', description: 'HRV, sleep, training load, recovery', status: 'planned' },
  { name: 'Amazfit', description: 'HRV, sleep, PAI, stress', status: 'planned' },
];

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

  // Track whether we're waiting for an OAuth callback
  const pendingAuth = useRef(false);

  // Exchange an auth code for tokens — extracted so both promptAsync result
  // AND deep link fallback can use it
  const exchangeCodeForTokens = useCallback(async (code: string) => {
    console.log('[Whoop OAuth] Exchanging code for tokens…');
    const tokenRes = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      if (tokenRes.status === 400 && errText.includes('redirect_uri')) {
        throw new Error(`Redirect URI mismatch. Must exactly match: ${redirectUri}`);
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

    await SecureStore.setItemAsync('whoop_access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      await SecureStore.setItemAsync('whoop_refresh_token', tokenData.refresh_token);
    }
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    await SecureStore.setItemAsync('whoop_token_expires_at', String(expiresAt));

    try {
      const devices = [...(profile?.connected_devices ?? [])];
      if (!devices.includes('whoop')) devices.push('whoop');
      await updateProfile({
        connected_devices: devices,
        primary_device: 'whoop',
      });
    } catch {
      // Offline mode
    }

    useDailyStore.getState().setDeviceSynced(true, 'whoop');
    useSyncStore.getState().setLastDeviceSync(new Date().toISOString(), 'whoop');
    setWhoopConnected(true);
    setConnecting(false);
    pendingAuth.current = false;

    Alert.alert('Success', 'Whoop connected! Your data will sync automatically.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [clientId, clientSecret, redirectUri, profile]);

  // Check connection status on mount
  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('whoop_access_token');
      setWhoopConnected(!!token);
    })();
  }, []);

  // Deep link fallback — catches OAuth callback if promptAsync doesn't
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      console.log('[Whoop OAuth] Deep link received:', url);
      if (!pendingAuth.current) return;
      if (!url.includes('auth/whoop/callback')) return;

      const params = new URL(url).searchParams ?? new URLSearchParams(url.split('?')[1] ?? '');
      const code = params.get('code');
      if (code) {
        exchangeCodeForTokens(code).catch((err) => {
          Alert.alert('Connection Error', err.message);
          setConnecting(false);
          pendingAuth.current = false;
        });
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, [exchangeCodeForTokens]);

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
    pendingAuth.current = true;
    try {
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['read:recovery', 'read:sleep', 'read:workout', 'read:profile', 'read:cycles'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      // Use non-ephemeral session so Cloudflare cookies persist between attempts.
      console.log('[Whoop OAuth] Starting auth with redirectUri:', redirectUri);
      const result = await request.promptAsync(discovery, {
        preferEphemeralSession: false,
      });
      console.log('[Whoop OAuth] Result:', JSON.stringify({ type: result.type, params: (result as any).params }));

      if (result.type === 'success' && result.params.code) {
        await exchangeCodeForTokens(result.params.code);
      } else if (result.type === 'dismiss' || result.type === 'cancel') {
        // User dismissed — the deep link listener may still catch the callback
        console.log('[Whoop OAuth] Browser dismissed, waiting for deep link fallback…');
        // Don't clear connecting — deep link handler will handle it
        // Set a timeout to clear connecting state if no callback arrives
        setTimeout(() => {
          if (pendingAuth.current) {
            pendingAuth.current = false;
            setConnecting(false);
          }
        }, 10000);
        return; // Don't clear connecting in finally
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

      {/* Wearable Device Catalog */}
      <Card style={[styles.section, styles.futureCard]}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          AVAILABLE WEARABLES
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary} style={{ marginBottom: 10 }}>
          Connect your wearable to sync recovery, sleep, and workout data automatically.
        </ThemedText>
        {WEARABLE_CATALOG.map((device) => (
          <View key={device.name} style={styles.futureRow}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" color={device.status === 'available' ? COLORS.text : COLORS.textMuted}>
                {device.name}
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textMuted} style={{ fontSize: 10 }}>
                {device.description}
              </ThemedText>
            </View>
            <View style={[
              styles.statusBadge,
              device.status === 'available' ? styles.statusAvailable :
              device.status === 'beta' ? styles.statusBeta : styles.statusPlanned,
            ]}>
              <ThemedText variant="caption" style={[
                styles.statusText,
                device.status === 'available' ? { color: COLORS.success } :
                device.status === 'beta' ? { color: COLORS.warning } : { color: COLORS.textMuted },
              ]}>
                {device.status === 'available' ? 'Available' : device.status === 'beta' ? 'Beta' : 'Planned'}
              </ThemedText>
            </View>
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
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  statusAvailable: {
    backgroundColor: COLORS.success + '15',
  },
  statusBeta: {
    backgroundColor: COLORS.warning + '15',
  },
  statusPlanned: {
    backgroundColor: COLORS.surfaceLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
