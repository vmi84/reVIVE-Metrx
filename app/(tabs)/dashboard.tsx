import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useIACI } from '../../hooks/use-iaci';
import { useWhoopSync } from '../../hooks/use-whoop-sync';
import { useDailyStore } from '../../store/daily-store';
import { IACIRing } from '../../components/dashboard/IACIRing';
import { SubsystemBars } from '../../components/dashboard/SubsystemBars';
import { PhenotypeCard } from '../../components/dashboard/PhenotypeCard';
import { ProtocolCard } from '../../components/dashboard/ProtocolCard';
import { TrainingCompatCard } from '../../components/dashboard/TrainingCompatCard';
import { MetricsRow } from '../../components/dashboard/MetricsRow';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../lib/utils/constants';

export default function Dashboard() {
  const { iaci, computeToday } = useIACI();
  const { syncMorningData, syncing } = useWhoopSync();
  const { checkinCompleted, whoopSynced } = useDailyStore();

  useEffect(() => {
    if (!whoopSynced) {
      syncMorningData();
    }
  }, []);

  useEffect(() => {
    if (whoopSynced && checkinCompleted && !iaci) {
      computeToday();
    }
  }, [whoopSynced, checkinCompleted]);

  // Pre-check-in state
  if (!checkinCompleted) {
    return (
      <View style={styles.centered}>
        <ThemedText variant="title" style={styles.greeting}>
          Good Morning
        </ThemedText>
        <ThemedText variant="body" style={styles.prompt}>
          {syncing
            ? 'Syncing Whoop data...'
            : whoopSynced
            ? 'Whoop data synced. Complete your morning check-in.'
            : 'Complete your check-in to see today\'s recovery score.'}
        </ThemedText>
        <Button
          title="Start Morning Check-In"
          onPress={() => router.push('/morning-checkin')}
          loading={syncing}
          style={styles.checkinButton}
        />
      </View>
    );
  }

  // Loading state
  if (!iaci) {
    return (
      <View style={styles.centered}>
        <ThemedText variant="body" color={COLORS.textSecondary}>
          Computing your recovery score...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* IACI Score Ring */}
      <View style={styles.ringSection}>
        <IACIRing score={iaci.score} tier={iaci.readinessTier} />
        <ThemedText variant="caption" style={styles.completeness}>
          Data completeness: {Math.round(iaci.dataCompleteness * 100)}%
        </ThemedText>
      </View>

      {/* Key Metrics */}
      <Card style={styles.section}>
        <MetricsRow
          metrics={[
            {
              label: 'HRV',
              value: String(Math.round(iaci.subsystemScores.autonomic.inputs.hrvRmssd as number || 0)),
              unit: 'ms',
            },
            {
              label: 'RHR',
              value: String(Math.round(iaci.subsystemScores.autonomic.inputs.restingHeartRate as number || 0)),
              unit: 'bpm',
            },
            {
              label: 'Sleep',
              value: iaci.subsystemScores.sleep.inputs.sleepDurationMs
                ? String(Math.round((iaci.subsystemScores.sleep.inputs.sleepDurationMs as number) / 3600000 * 10) / 10)
                : '--',
              unit: 'hrs',
            },
            {
              label: 'Strain',
              value: String(Math.round(iaci.subsystemScores.autonomic.inputs.priorDayStrain as number || 0)),
            },
          ]}
        />
      </Card>

      {/* Subsystem Scores */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          SUBSYSTEM SCORES
        </ThemedText>
        <SubsystemBars scores={iaci.subsystemScores} />
      </Card>

      {/* Phenotype */}
      <View style={styles.section}>
        <PhenotypeCard phenotype={iaci.phenotype} />
      </View>

      {/* Protocol */}
      <View style={styles.section}>
        <ProtocolCard protocol={iaci.protocol} />
      </View>

      {/* Training Compatibility */}
      <View style={styles.section}>
        <TrainingCompatCard compatibility={iaci.protocol.trainingCompatibility} />
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, styles.actions]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/recovery')}
        >
          <ThemedText variant="body" style={styles.actionText}>
            View Recovery Protocols
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/train')}
        >
          <ThemedText variant="body" style={styles.actionText}>
            Log Workout
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  greeting: {
    marginBottom: 12,
  },
  prompt: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  checkinButton: {
    width: '100%',
    maxWidth: 300,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  completeness: {
    marginTop: 8,
    color: COLORS.textMuted,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
