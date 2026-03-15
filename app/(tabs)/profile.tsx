import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';

export default function Profile() {
  const { profile, signOut, user } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle">
          {profile?.full_name ?? 'Athlete'}
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary}>
          {user?.email}
        </ThemedText>
        {profile?.sport && (
          <ThemedText variant="caption" style={styles.sport}>
            {profile.sport} athlete
          </ThemedText>
        )}
      </Card>

      {/* Connected Devices */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          CONNECTED DEVICES
        </ThemedText>
        {(profile?.connected_devices ?? []).length > 0 ? (
          profile!.connected_devices.map((device, i) => (
            <View key={i} style={styles.deviceRow}>
              <ThemedText variant="body">{device}</ThemedText>
              <ThemedText variant="caption" color={COLORS.success}>Connected</ThemedText>
            </View>
          ))
        ) : (
          <ThemedText variant="body" color={COLORS.textSecondary}>
            No devices connected.
          </ThemedText>
        )}
        <Button
          title="Connect Device"
          variant="secondary"
          onPress={() => router.push('/device-setup')}
          style={styles.connectButton}
        />
      </Card>

      {/* Settings */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          SETTINGS
        </ThemedText>
        <SettingRow label="Sport / Athlete Type" value={profile?.sport ?? 'Not set'} />
        <SettingRow label="Goal" value={profile?.goal ?? 'Not set'} />
        <SettingRow label="Dietary Approach" value={profile?.dietary_approach ?? 'Not set'} />
        <SettingRow label="Available Equipment" value={
          (profile?.available_equipment ?? []).length > 0
            ? profile!.available_equipment.join(', ')
            : 'Not set'
        } />
      </Card>

      {/* Lab Results */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          LAB RESULTS
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/lab-results')}>
          <ThemedText variant="body" color={COLORS.primary}>
            Enter Lab Results
          </ThemedText>
        </TouchableOpacity>
      </Card>

      {/* Import Data */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          IMPORT DATA
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/import-data')}>
          <ThemedText variant="body" color={COLORS.primary}>
            Import Wearable Data (ZIP or CSV)
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
    <View style={profileStyles.settingRow}>
      <ThemedText variant="caption" color={COLORS.textSecondary}>{label}</ThemedText>
      <ThemedText variant="body">{value}</ThemedText>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  settingRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});

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
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  sport: {
    marginTop: 4,
    textTransform: 'capitalize',
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  connectButton: {
    marginTop: 12,
  },
  signOut: {
    marginTop: 8,
  },
});
