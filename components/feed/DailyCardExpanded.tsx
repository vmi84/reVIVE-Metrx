/**
 * DailyCardExpanded — Full expanded view for a daily feed card.
 *
 * Shows: IACI ring, system status, workout focus, area capacity,
 * editable metrics, subsystem bars, phenotype, protocol, training compat,
 * recovery plan (if workout logged), recovery day plan (if recovery only).
 */

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { IACIRing } from '../dashboard/IACIRing';
import { SubsystemBars } from '../dashboard/SubsystemBars';
import { PhenotypeCard } from '../dashboard/PhenotypeCard';
import { ProtocolCard } from '../dashboard/ProtocolCard';
import { TrainingCompatCard } from '../dashboard/TrainingCompatCard';
import { SystemStatusCard } from './SystemStatusCard';
import { WorkoutFocusBadge } from './WorkoutFocusBadge';
import { AreaCapacityMap } from './AreaCapacityMap';
import { WhoopMetricRow } from './WhoopMetricRow';
import { RecoveryPlanCard } from './RecoveryPlanCard';
import { RecoveryDayPlanCard } from './RecoveryDayPlanCard';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { FeedDay, MetricSource } from '../../lib/types/feed';
import { today } from '../../lib/utils/date';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  day: FeedDay;
  onMetricAccept?: (metric: string) => void;
  onMetricEdit?: (metric: string, value: number) => void;
}

function relativeDate(dateStr: string): string {
  const diff = differenceInDays(parseISO(today()), parseISO(dateStr));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return dateStr;
}

export function DailyCardExpanded({ day, onMetricAccept, onMetricEdit }: Props) {
  const hasIACI = day.iaci != null;
  const isToday = day.date === today();
  const phys = day.physiology;

  // Editable metrics
  const editableMetrics = [
    { key: 'hrv_rmssd', label: 'HRV', value: phys?.hrv_rmssd ?? null, unit: 'ms' },
    { key: 'resting_heart_rate', label: 'Resting Heart Rate', value: phys?.resting_heart_rate ?? null, unit: 'bpm' },
    { key: 'sleep_duration_ms', label: 'Sleep Duration', value: phys?.sleep_duration_ms ? Math.round(phys.sleep_duration_ms / 3600000 * 10) / 10 : null, unit: 'hrs' },
    { key: 'day_strain', label: 'Strain', value: phys?.day_strain ?? null, unit: '' },
    { key: 'recovery_score', label: 'Recovery Score', value: phys?.recovery_score ?? null, unit: '%' },
    { key: 'respiratory_rate', label: 'Respiratory Rate', value: phys?.respiratory_rate ?? null, unit: 'brpm' },
  ];

  return (
    <View style={styles.container}>
      {/* Date Header */}
      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.dateHeader}>
        {relativeDate(day.date)}
      </ThemedText>

      {/* IACI Ring */}
      {hasIACI && (
        <View style={styles.ringSection}>
          <IACIRing score={day.iaci!.score} tier={day.iaci!.readinessTier} size={120} />
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.completeness}>
            Data completeness: {Math.round(day.iaci!.dataCompleteness * 100)}%
          </ThemedText>
        </View>
      )}

      {/* System Status Summary */}
      {day.loadCapacity?.statusSummary && (
        <SystemStatusCard status={day.loadCapacity.statusSummary} />
      )}

      {/* Workout Focus Badge */}
      {day.loadCapacity && (
        <WorkoutFocusBadge
          focus={day.loadCapacity.workoutFocus}
          rationale={day.loadCapacity.focusRationale}
        />
      )}

      {/* Area Capacity Map */}
      {day.loadCapacity && (
        <AreaCapacityMap areaCapacity={day.loadCapacity.areaCapacity} />
      )}

      {/* Editable Whoop Metrics */}
      {phys && (
        <Card style={styles.metricsCard}>
          <ThemedText variant="caption" style={styles.sectionHeader}>METRICS</ThemedText>
          {editableMetrics
            .filter(m => m.value != null)
            .map((m) => {
              const source = (day.metricSources[m.key] ?? 'manual') as MetricSource;
              const validation = day.metricValidations[m.key];
              return (
                <WhoopMetricRow
                  key={m.key}
                  label={m.label}
                  value={m.value}
                  unit={m.unit}
                  source={source}
                  status={validation?.status ?? 'pending'}
                  editable={isToday}
                  onAccept={() => onMetricAccept?.(m.key)}
                  onEdit={(val) => onMetricEdit?.(m.key, val)}
                />
              );
            })}
        </Card>
      )}

      {/* Subsystem Bars */}
      {hasIACI && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>SUBSYSTEM SCORES</ThemedText>
          <SubsystemBars scores={day.iaci!.subsystemScores} />
        </Card>
      )}

      {/* Phenotype */}
      {hasIACI && day.iaci!.phenotype && (
        <View style={styles.section}>
          <PhenotypeCard phenotype={day.iaci!.phenotype} />
        </View>
      )}

      {/* Protocol */}
      {hasIACI && day.iaci!.protocol && (
        <View style={styles.section}>
          <ProtocolCard protocol={day.iaci!.protocol} />
        </View>
      )}

      {/* Training Compatibility */}
      {hasIACI && day.iaci!.protocol?.trainingCompatibility && (
        <View style={styles.section}>
          <TrainingCompatCard compatibility={day.iaci!.protocol.trainingCompatibility} />
        </View>
      )}

      {/* Recovery Plan (post-workout) */}
      {day.recoveryPlan && (
        <RecoveryPlanCard plan={day.recoveryPlan} />
      )}

      {/* Recovery Day Plan (recovery only) */}
      {day.recoveryDayPlan && (
        <RecoveryDayPlanCard plan={day.recoveryDayPlan} />
      )}

      {/* Quick Actions (today only) */}
      {isToday && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/recovery')}
          >
            <ThemedText variant="body" style={styles.actionText}>
              View Protocols
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dateHeader: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  completeness: {
    marginTop: 6,
  },
  metricsCard: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
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
