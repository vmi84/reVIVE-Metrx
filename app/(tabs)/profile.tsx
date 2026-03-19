/**
 * Settings Tab (formerly Profile)
 *
 * Organized sections:
 *   1. Athlete Profile (links to onboarding questionnaire)
 *   2. Connected Devices (Whoop, future Garmin/Oura)
 *   3. Training Mode (quick toggle for athlete mode)
 *   4. Data (import/export, lab results)
 *   5. Account (sign out)
 */

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../hooks/use-auth';
import { useWhoopSync } from '../../hooks/use-whoop-sync';
import { useSyncStore } from '../../store/sync-store';
import { usePhysiologyStore } from '../../store/physiology-store';
import { useDailyStore } from '../../store/daily-store';
import { useSettingsStore } from '../../store/settings-store';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';
import type { AthleteMode, TrainingSchedule } from '../../lib/types/athlete-mode';

export default function Settings() {
  const { profile, signOut, user } = useAuth();
  const { syncHistorical, syncing, syncProgress } = useWhoopSync();
  const syncError = useSyncStore(s => s.syncError);
  const lastSync = useSyncStore(s => s.lastDeviceSync);
  const hasData = usePhysiologyStore(s => s.hasData);
  const lastImport = usePhysiologyStore(s => s.lastImport);
  const { athleteMode, trainingSchedule, setAthleteMode, setTrainingSchedule } = useDailyStore();
  const settings = useSettingsStore();
  const [whoopConnected, setWhoopConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('whoop_access_token');
      setWhoopConnected(!!token);
    })();
  }, []);

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const modeLabel = athleteMode === 'competitive' ? 'Coach-Led (Competitive)' : 'Self-Directed (Recreational)';
  const scheduleLabel = trainingSchedule === 'double' ? 'Two-a-day' : 'Single session';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Athlete Profile ── */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>ATHLETE PROFILE</ThemedText>
        <ThemedText variant="subtitle">{profile?.full_name ?? user?.email ?? 'Athlete'}</ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary}>{user?.email}</ThemedText>
        {profile?.sport && (
          <ThemedText variant="caption" style={styles.sport}>
            {Array.isArray(profile.sport) ? profile.sport.join(', ') : profile.sport}
          </ThemedText>
        )}
        <SettingRow label="Experience" value={settings.experienceLevel || 'Not set'} />
        <SettingRow label="Goal" value={settings.primaryGoal || 'Not set'} />
        <SettingRow label="Diet" value={settings.dietaryApproach || 'Not set'} />
        <SettingRow label="Equipment" value={
          settings.availableEquipment.length > 0
            ? `${settings.availableEquipment.length} items`
            : 'Not set'
        } />
        <Button
          title="Edit Athlete Profile"
          variant="secondary"
          onPress={() => router.push('/onboarding')}
          style={styles.editBtn}
        />
      </Card>

      {/* ── Connected Devices ── */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>CONNECTED DEVICES</ThemedText>
        {whoopConnected ? (
          <View>
            <View style={styles.deviceRow}>
              <ThemedText variant="body">WHOOP</ThemedText>
              <ThemedText variant="caption" color={COLORS.success}>Connected</ThemedText>
            </View>
            {lastSync && (
              <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                Last synced: {new Date(lastSync).toLocaleString()}
              </ThemedText>
            )}
            {hasData && lastImport && (
              <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                {lastImport.recordCount} days ({lastImport.dateRange?.start} to {lastImport.dateRange?.end})
              </ThemedText>
            )}
            <Button
              title={syncing ? 'Syncing...' : 'Sync All Data'}
              variant="secondary"
              onPress={async () => {
                try {
                  await syncHistorical();
                } catch (e: any) {
                  Alert.alert('Sync Error', e?.message ?? String(e));
                }
              }}
              loading={syncing}
              style={styles.connectButton}
            />
            {syncing && syncProgress && (
              <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginTop: 6, textAlign: 'center' }}>
                {syncProgress}
              </ThemedText>
            )}
            {syncError && !syncing && (
              <ThemedText variant="caption" color={COLORS.error} style={{ marginTop: 6 }}>
                {syncError}
              </ThemedText>
            )}
          </View>
        ) : (
          <ThemedText variant="body" color={COLORS.textSecondary}>No devices connected.</ThemedText>
        )}

        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.comingSoonLabel}>COMING SOON</ThemedText>
          {['Garmin', 'Oura', 'Apple Watch', 'Polar', 'COROS'].map(d => (
            <View key={d} style={styles.comingSoonRow}>
              <ThemedText variant="caption" color={COLORS.textMuted}>{d}</ThemedText>
              <ThemedText variant="caption" color={COLORS.textMuted}>Phase 2</ThemedText>
            </View>
          ))}
        </View>

        <Button
          title={whoopConnected ? 'Manage Devices' : 'Connect Device'}
          variant="secondary"
          onPress={() => router.push('/device-setup')}
          style={styles.connectButton}
        />
      </Card>

      {/* ── Training Mode ── */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>TRAINING MODE</ThemedText>

        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.modeLabel}>
          Athlete Mode
        </ThemedText>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, athleteMode === 'recreational' && styles.toggleBtnActive]}
            onPress={() => { setAthleteMode('recreational'); settings.updateProfile({ athleteMode: 'recreational' }); }}
          >
            <ThemedText variant="caption" style={athleteMode === 'recreational' ? styles.toggleTextActive : styles.toggleText}>
              Self-Directed
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, athleteMode === 'competitive' && styles.toggleBtnActive]}
            onPress={() => { setAthleteMode('competitive'); settings.updateProfile({ athleteMode: 'competitive' }); }}
          >
            <ThemedText variant="caption" style={athleteMode === 'competitive' ? styles.toggleTextActive : styles.toggleText}>
              Coach-Led
            </ThemedText>
          </TouchableOpacity>
        </View>
        {athleteMode === 'competitive' && (
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.modeHint}>
            Relaxed thresholds, reduced penalties, recovery-focused Effort Guide
          </ThemedText>
        )}

        <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.modeLabel, { marginTop: 12 }]}>
          Daily Schedule
        </ThemedText>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, trainingSchedule === 'single' && styles.toggleBtnActive]}
            onPress={() => { setTrainingSchedule('single'); settings.updateProfile({ trainingSchedule: 'single' }); }}
          >
            <ThemedText variant="caption" style={trainingSchedule === 'single' ? styles.toggleTextActive : styles.toggleText}>
              Single
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, trainingSchedule === 'double' && styles.toggleBtnActive]}
            onPress={() => { setTrainingSchedule('double'); settings.updateProfile({ trainingSchedule: 'double' }); }}
          >
            <ThemedText variant="caption" style={trainingSchedule === 'double' ? styles.toggleTextActive : styles.toggleText}>
              Two-a-day
            </ThemedText>
          </TouchableOpacity>
        </View>

        <SettingRow label="Phase" value={settings.trainingPhase || 'Not set'} />
        <SettingRow label="Frequency" value={
          settings.trainingFrequency
            ? `${settings.trainingFrequency} days/week`
            : 'Not set'
        } />
      </Card>

      {/* ── Data ── */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>DATA</ThemedText>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/lab-results')}>
          <ThemedText variant="body" color={COLORS.primary}>Enter Lab Results</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/import-data')}>
          <ThemedText variant="body" color={COLORS.primary}>Import Wearable Data (ZIP/CSV)</ThemedText>
        </TouchableOpacity>
      </Card>

      {/* ── Account ── */}
      <Button
        title="Sign Out"
        variant="ghost"
        onPress={handleSignOut}
        style={styles.signOut}
      />
    </ScrollView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={settingStyles.row}>
      <ThemedText variant="caption" color={COLORS.textSecondary}>{label}</ThemedText>
      <ThemedText variant="body" style={settingStyles.value}>{value}</ThemedText>
    </View>
  );
}

const settingStyles = StyleSheet.create({
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  value: { textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  sectionHeader: { textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12 },
  sport: { marginTop: 4, textTransform: 'capitalize', color: COLORS.textSecondary },
  editBtn: { marginTop: 12 },
  modeLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  modeHint: { marginTop: 6, fontStyle: 'italic', fontSize: 11 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: { flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  toggleTextActive: { fontSize: 13, color: '#fff', fontWeight: '700' },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  connectButton: { marginTop: 12 },
  comingSoon: { marginTop: 16 },
  comingSoonLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  comingSoonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border + '40' },
  linkRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  signOut: { marginTop: 8 },
});
