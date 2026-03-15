/**
 * CheckinPromptCard — Shown at top of feed when today's check-in is incomplete.
 *
 * Two buttons: "Start Check-In" and "Use Yesterday's Data"
 */

import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '../ui/ThemedText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';

interface Props {
  syncing: boolean;
  deviceSynced: boolean;
  onUseYesterday: () => void;
}

export function CheckinPromptCard({ syncing, deviceSynced, onUseYesterday }: Props) {
  return (
    <Card style={styles.card}>
      <ThemedText variant="title" style={styles.greeting}>
        Good Morning
      </ThemedText>
      <ThemedText variant="body" color={COLORS.textSecondary} style={styles.prompt}>
        {syncing
          ? 'Syncing device data...'
          : deviceSynced
          ? 'Device data synced. How are you feeling today?'
          : 'Complete your check-in to see today\'s recovery score.'}
      </ThemedText>

      <View style={styles.buttons}>
        <Button
          title="Start Check-In"
          onPress={() => router.push('/morning-checkin')}
          loading={syncing}
          style={styles.primaryBtn}
        />
        <Button
          title="Use Yesterday's Data"
          onPress={onUseYesterday}
          variant="secondary"
          style={styles.secondaryBtn}
        />
      </View>

      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.hint}>
        Using yesterday's data? You can tap any metric to adjust it after.
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  greeting: {
    marginBottom: 8,
  },
  prompt: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  buttons: {
    width: '100%',
    gap: 10,
    paddingHorizontal: 16,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  hint: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
  },
});
