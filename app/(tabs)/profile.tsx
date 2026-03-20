/**
 * Settings Tab (formerly Profile)
 *
 * Organized sections:
 *   1. Athlete Profile (links to onboarding questionnaire)
 *   2. Connected Devices (only shows integrated devices; Manage Devices for onboarding new ones)
 *   3. Data (import/export, lab results)
 *   4. Training Mode (quick toggle for athlete mode)
 *   5. Account (sign out)
 */

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, LayoutAnimation } from 'react-native';
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
import { COLORS, setActiveTheme } from '../../lib/utils/constants';
import type { AthleteMode, TrainingSchedule } from '../../lib/types/athlete-mode';
import type { AppTheme } from '../../store/settings-store';

const TRAINING_MODALITY_OPTIONS = [
  'Running', 'Cycling', 'Swimming', 'Rowing', 'Elliptical',
  'Walking', 'Hiking', 'Yoga', 'Strength Training', 'CrossFit',
  'Martial Arts', 'Dance', 'Climbing', 'Skiing',
];

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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

  // Top-level section collapse state (separate from profile sub-groups)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['profile', 'devices', 'data', 'training', 'prefs']),
  );
  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const isSectionOpen = (key: string) => !collapsedSections.has(key);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Athlete Profile ── */}
      <Card style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection('profile')} style={styles.sectionToggle}>
          <ThemedText variant="caption" style={styles.sectionHeader}>ATHLETE PROFILE</ThemedText>
          <ThemedText variant="caption" style={styles.chevronTop}>{isSectionOpen('profile') ? '▾' : '▸'}</ThemedText>
        </TouchableOpacity>
        {isSectionOpen('profile') && <>
        <ThemedText variant="subtitle">{profile?.full_name ?? user?.email ?? 'Athlete'}</ThemedText>
        <ThemedText variant="subtitle">{profile?.full_name ?? user?.email ?? 'Athlete'}</ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary}>{user?.email}</ThemedText>

        {/* About */}
        <ProfileGroup
          title="ABOUT"
          summary={[settings.sports.join(', ') || 'No sports', settings.experienceLevel || ''].filter(Boolean).join(' · ')}
          expanded={expandedGroups.has('about')}
          onToggle={() => toggleGroup('about')}
          onEdit={() => router.push('/onboarding?step=1')}
        >
          <SettingRow label="Sports" value={settings.sports.length > 0 ? settings.sports.join(', ') : 'Not set'} />
          <SettingRow label="Experience" value={settings.experienceLevel || 'Not set'} />
        </ProfileGroup>

        {/* Goals & Recovery */}
        <ProfileGroup
          title="GOALS & RECOVERY"
          summary={settings.primaryGoal || 'No goal set'}
          expanded={expandedGroups.has('goals')}
          onToggle={() => toggleGroup('goals')}
          onEdit={() => router.push('/onboarding?step=3')}
        >
          <SettingRow label="Primary Goal" value={settings.primaryGoal || 'Not set'} />
          <SettingRow label="Recovery Priorities" value={
            settings.recoveryPriorities.length > 0 ? settings.recoveryPriorities.join(', ') : 'Not set'
          } />
          <SettingRow label="Preferred Activities" value={
            settings.preferredRecoveryActivities.length > 0 ? settings.preferredRecoveryActivities.join(', ') : 'Not set'
          } />
        </ProfileGroup>

        {/* Environment & Equipment */}
        <ProfileGroup
          title="ENVIRONMENT & EQUIPMENT"
          summary={[
            settings.trainingEnvironment.length > 0 ? settings.trainingEnvironment.join(', ') : '',
            settings.availableEquipment.length > 0 ? `${settings.availableEquipment.length} items` : '',
          ].filter(Boolean).join(' · ') || 'Not set'}
          expanded={expandedGroups.has('env')}
          onToggle={() => toggleGroup('env')}
          onEdit={() => router.push('/onboarding?step=4')}
        >
          <SettingRow label="Environment" value={
            settings.trainingEnvironment.length > 0 ? settings.trainingEnvironment.join(', ') : 'Not set'
          } />
          <SettingRow label="Equipment" value={
            settings.availableEquipment.length > 0 ? settings.availableEquipment.join(', ') : 'Not set'
          } />
          <SettingRow label="Diet" value={settings.dietaryApproach || 'Not set'} />
        </ProfileGroup>

        {/* Health */}
        <ProfileGroup
          title="HEALTH"
          summary={settings.knownConditions || 'No conditions'}
          expanded={expandedGroups.has('health')}
          onToggle={() => toggleGroup('health')}
          onEdit={() => router.push('/onboarding?step=5')}
        >
          <SettingRow label="Known Conditions" value={settings.knownConditions || 'None'} />
        </ProfileGroup>

        <Button
          title="Full Profile Editor"
          variant="secondary"
          onPress={() => router.push('/onboarding')}
          style={styles.editBtn}
        />
        </>}
      </Card>

      {/* ── Connected Devices ── */}
      <Card style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection('devices')} style={styles.sectionToggle}>
          <ThemedText variant="caption" style={styles.sectionHeader}>CONNECTED DEVICES</ThemedText>
          <ThemedText variant="caption" style={styles.chevronTop}>{isSectionOpen('devices') ? '▾' : '▸'}</ThemedText>
        </TouchableOpacity>
        {isSectionOpen('devices') && <>
        {whoopConnected ? (
          <View>
            <View style={styles.deviceRow}>
              <ThemedText variant="body" style={styles.deviceName}>WHOOP</ThemedText>
              <View style={styles.connectedBadge}>
                <ThemedText variant="caption" style={styles.connectedText}>Connected</ThemedText>
              </View>
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
          <ThemedText variant="body" color={COLORS.textSecondary}>
            No devices connected. Tap below to add a wearable.
          </ThemedText>
        )}

        <Button
          title="Manage Devices"
          variant="secondary"
          onPress={() => router.push('/device-setup')}
          style={styles.connectButton}
        />
        </>}
      </Card>

      {/* ── Data ── */}
      <Card style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection('data')} style={styles.sectionToggle}>
          <ThemedText variant="caption" style={styles.sectionHeader}>DATA</ThemedText>
          <ThemedText variant="caption" style={styles.chevronTop}>{isSectionOpen('data') ? '▾' : '▸'}</ThemedText>
        </TouchableOpacity>
        {isSectionOpen('data') && <>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/lab-results')}>
          <ThemedText variant="body" color={COLORS.primary}>Enter Lab Results</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/import-data')}>
          <ThemedText variant="body" color={COLORS.primary}>Import Wearable Data (ZIP/CSV)</ThemedText>
        </TouchableOpacity>
        </>}
      </Card>

      {/* ── Training Mode ── */}
      <Card style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection('training')} style={styles.sectionToggle}>
          <ThemedText variant="caption" style={styles.sectionHeader}>TRAINING MODE</ThemedText>
          <ThemedText variant="caption" style={styles.chevronTop}>{isSectionOpen('training') ? '▾' : '▸'}</ThemedText>
        </TouchableOpacity>
        {isSectionOpen('training') && <>

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
        </>}
      </Card>

      {/* ── App Preferences ── */}
      <Card style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection('prefs')} style={styles.sectionToggle}>
          <ThemedText variant="caption" style={styles.sectionHeader}>APP PREFERENCES</ThemedText>
          <ThemedText variant="caption" style={styles.chevronTop}>{isSectionOpen('prefs') ? '▾' : '▸'}</ThemedText>
        </TouchableOpacity>
        {isSectionOpen('prefs') && <>

        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.modeLabel}>
          Theme
        </ThemedText>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, settings.theme === 'dark' && styles.toggleBtnActive]}
            onPress={() => { settings.updateProfile({ theme: 'dark' }); setActiveTheme('dark'); }}
          >
            <ThemedText variant="caption" style={settings.theme === 'dark' ? styles.toggleTextActive : styles.toggleText}>
              Dark
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, settings.theme === 'light' && styles.toggleBtnActive]}
            onPress={() => { settings.updateProfile({ theme: 'light' }); setActiveTheme('light'); }}
          >
            <ThemedText variant="caption" style={settings.theme === 'light' ? styles.toggleTextActive : styles.toggleText}>
              Light
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.modeLabel, { marginTop: 16 }]}>
          Preferred Training Modalities (select up to 3, in priority order)
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary} style={{ marginBottom: 8, fontSize: 11 }}>
          Recovery activities will be tailored to support these in order of priority.
          {settings.preferredTrainingModalities.length > 0 && (
            `\nCurrent: ${settings.preferredTrainingModalities.map((m, i) => `${i + 1}. ${m}`).join('  ')}`
          )}
        </ThemedText>
        <View style={styles.modalityGrid}>
          {TRAINING_MODALITY_OPTIONS.map((mod) => {
            const idx = settings.preferredTrainingModalities.indexOf(mod);
            const isSelected = idx >= 0;
            const isFull = settings.preferredTrainingModalities.length >= 3 && !isSelected;
            return (
              <TouchableOpacity
                key={mod}
                style={[
                  styles.modalityChip,
                  isSelected && styles.modalityChipSelected,
                  isFull && styles.modalityChipDisabled,
                ]}
                onPress={() => {
                  const current = [...settings.preferredTrainingModalities];
                  if (isSelected) {
                    current.splice(idx, 1);
                  } else if (current.length < 3) {
                    current.push(mod);
                  }
                  settings.updateProfile({ preferredTrainingModalities: current });
                }}
                disabled={isFull}
              >
                {isSelected && (
                  <ThemedText variant="caption" style={styles.modalityRank}>{idx + 1}</ThemedText>
                )}
                <ThemedText variant="caption" style={[
                  styles.modalityLabel,
                  isSelected && styles.modalityLabelSelected,
                  isFull && { color: COLORS.textMuted },
                ]}>
                  {mod}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
        </>}
      </Card>

      {/* ── Help & Account ── */}
      <Card style={styles.section}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/help-guide')}
        >
          <ThemedText variant="body" color={COLORS.primary} style={{ fontWeight: '600' }}>
            Help Guide
          </ThemedText>
          <ThemedText variant="caption" color={COLORS.textMuted}>
            Learn about every feature and metric
          </ThemedText>
        </TouchableOpacity>
      </Card>

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

function ProfileGroup({ title, summary, expanded, onToggle, onEdit, children }: {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={groupStyles.container}>
      <TouchableOpacity onPress={onToggle} style={groupStyles.header} activeOpacity={0.7}>
        <ThemedText variant="caption" style={groupStyles.chevron}>{expanded ? '▾' : '▸'}</ThemedText>
        <View style={groupStyles.titleCol}>
          <ThemedText variant="caption" style={groupStyles.title}>{title}</ThemedText>
          {!expanded && (
            <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={groupStyles.summary}>
              {summary}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity onPress={onEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ThemedText variant="caption" color={COLORS.primary}>Edit</ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>
      {expanded && <View style={groupStyles.body}>{children}</View>}
    </View>
  );
}

const groupStyles = StyleSheet.create({
  container: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chevron: { fontSize: 12, color: COLORS.textMuted, width: 14 },
  titleCol: { flex: 1 },
  title: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: COLORS.textMuted, textTransform: 'uppercase' },
  summary: { fontSize: 11, marginTop: 1 },
  body: { marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  sectionHeader: { textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginBottom: 0 },
  sectionToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, marginBottom: 8 },
  chevronTop: { fontSize: 12, color: COLORS.textMuted },
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
  deviceName: { fontWeight: '600', fontSize: 15 },
  connectedBadge: { backgroundColor: COLORS.success + '15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  connectedText: { color: COLORS.success, fontWeight: '700', fontSize: 11 },
  connectButton: { marginTop: 12 },
  linkRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  signOut: { marginTop: 8 },
  modalityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modalityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalityChipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  modalityChipDisabled: {
    opacity: 0.4,
  },
  modalityRank: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '30',
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalityLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalityLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
