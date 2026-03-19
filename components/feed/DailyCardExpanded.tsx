/**
 * DailyCardExpanded — Full expanded view for a daily feed card.
 *
 * Shows: IACI ring, device data summary, system status, workout focus,
 * area capacity, editable metrics, subsystem bars, phenotype, protocol,
 * training compat, recovery plan, recovery day plan.
 *
 * Device badge and colors are resolved dynamically from `deviceSource`
 * via the DEVICE_SOURCE_REGISTRY — not hardcoded to any vendor.
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
import { MetricRow } from './MetricRow';
import { RecoveryPlanCard } from './RecoveryPlanCard';
import { RecoveryDayPlanCard } from './RecoveryDayPlanCard';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { FeedDay, MetricSource, getSourceMeta } from '../../lib/types/feed';
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

/** Color-code recovery score (green/yellow/red). */
function recoveryColor(score: number | null | undefined): string {
  if (score == null) return COLORS.textMuted;
  if (score >= 67) return '#00C48C';
  if (score >= 34) return '#FFB800';
  return '#FF4444';
}

export function DailyCardExpanded({ day, onMetricAccept, onMetricEdit }: Props) {
  const hasIACI = day.iaci != null;
  const isToday = day.date === today();
  const phys = day.physiology;
  const sourceMeta = day.deviceSource ? getSourceMeta(day.deviceSource) : null;

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
      {/* Date Header + Device badge */}
      <View style={styles.dateRow}>
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.dateHeader}>
          {relativeDate(day.date)}
        </ThemedText>
        {day.deviceSynced && sourceMeta && (
          <View style={[styles.deviceBadge, { borderColor: sourceMeta.color }]}>
            <ThemedText variant="caption" style={[styles.deviceBadgeText, { color: sourceMeta.color }]}>
              {sourceMeta.label} SYNCED
            </ThemedText>
          </View>
        )}
      </View>

      {/* Scores Row: IACI Ring + Device Recovery side by side */}
      <View style={styles.scoresRow}>
        {hasIACI && (
          <View style={styles.scoreBlock}>
            <IACIRing score={day.iaci!.score} tier={day.iaci!.readinessTier} size={100} />
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.scoreLabel}>
              IACI Score
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.completeness}>
              {Math.round(day.iaci!.dataCompleteness * 100)}% data
            </ThemedText>
          </View>
        )}
        {phys?.recovery_score != null && (
          <View style={styles.scoreBlock}>
            <View style={[styles.recoveryCircle, { borderColor: recoveryColor(phys.recovery_score) }]}>
              <ThemedText style={[styles.recoveryScoreLarge, { color: recoveryColor(phys.recovery_score) }]}>
                {Math.round(phys.recovery_score)}
              </ThemedText>
              <ThemedText style={[styles.recoveryPctLabel, { color: recoveryColor(phys.recovery_score) }]}>
                %
              </ThemedText>
            </View>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.scoreLabel}>
              Device Recovery
            </ThemedText>
          </View>
        )}
      </View>

      {/* Device Key Metrics Summary */}
      {day.deviceSynced && phys && sourceMeta && (
        <Card style={[styles.deviceSummaryCard, { borderLeftColor: sourceMeta.color }]}>
          <View style={styles.deviceSummaryHeader}>
            <ThemedText variant="caption" style={styles.sectionHeader}>
              {sourceMeta.label} DATA
            </ThemedText>
            <View style={[styles.deviceBadge, { borderColor: sourceMeta.color }]}>
              <ThemedText variant="caption" style={[styles.deviceBadgeText, { color: sourceMeta.color }]}>
                SYNCED
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroRow}>
            {phys.recovery_score != null && (
              <View style={styles.heroCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Recovery</ThemedText>
                <ThemedText variant="subtitle" style={{
                  color: recoveryColor(phys.recovery_score),
                  fontWeight: '700',
                }}>
                  {Math.round(phys.recovery_score)}%
                </ThemedText>
              </View>
            )}
            {phys.sleep_duration_ms != null && (
              <View style={styles.heroCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Sleep</ThemedText>
                {phys.sleep_performance_pct != null ? (
                  <ThemedText variant="subtitle" style={styles.heroValue}>
                    {Math.round(phys.sleep_performance_pct)}%
                  </ThemedText>
                ) : (
                  <ThemedText variant="subtitle" style={styles.heroValue}>
                    {(Math.round(phys.sleep_duration_ms / 3600000 * 10) / 10).toFixed(1)}h
                  </ThemedText>
                )}
                <ThemedText variant="caption" color={COLORS.textMuted}>
                  {phys.sleep_performance_pct != null
                    ? `${(Math.round(phys.sleep_duration_ms / 3600000 * 10) / 10).toFixed(1)}h`
                    : ''}
                </ThemedText>
              </View>
            )}
            {phys.day_strain != null && (
              <View style={styles.heroCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Strain</ThemedText>
                <ThemedText variant="subtitle" style={styles.heroValue}>
                  {phys.day_strain.toFixed(1)}
                </ThemedText>
              </View>
            )}
            {phys.hrv_rmssd != null && (
              <View style={styles.heroCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>HRV</ThemedText>
                <ThemedText variant="subtitle" style={styles.heroValue}>
                  {Math.round(phys.hrv_rmssd)}
                </ThemedText>
                <ThemedText variant="caption" color={COLORS.textMuted}>ms</ThemedText>
              </View>
            )}
          </View>
          {/* Secondary metrics row */}
          <View style={styles.secondaryRow}>
            {phys.resting_heart_rate != null && (
              <View style={styles.secondaryCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>RHR</ThemedText>
                <ThemedText variant="caption" style={styles.secondaryValue}>
                  {Math.round(phys.resting_heart_rate)} bpm
                </ThemedText>
              </View>
            )}
            {phys.respiratory_rate != null && (
              <View style={styles.secondaryCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Resp Rate</ThemedText>
                <ThemedText variant="caption" style={styles.secondaryValue}>
                  {phys.respiratory_rate.toFixed(1)} brpm
                </ThemedText>
              </View>
            )}
            {phys.spo2_pct != null && (
              <View style={styles.secondaryCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>SpO2</ThemedText>
                <ThemedText variant="caption" style={styles.secondaryValue}>
                  {Math.round(phys.spo2_pct)}%
                </ThemedText>
              </View>
            )}
            {phys.skin_temp_deviation != null && (
              <View style={styles.secondaryCell}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Skin Temp</ThemedText>
                <ThemedText variant="caption" style={styles.secondaryValue}>
                  {phys.skin_temp_deviation > 0 ? '+' : ''}{phys.skin_temp_deviation.toFixed(1)}°C
                </ThemedText>
              </View>
            )}
          </View>
        </Card>
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

      {/* Editable Metrics */}
      {phys && (
        <Card style={styles.metricsCard}>
          <ThemedText variant="caption" style={styles.sectionHeader}>METRICS</ThemedText>
          {editableMetrics
            .filter(m => m.value != null)
            .map((m) => {
              const source = (day.metricSources[m.key] ?? 'manual') as MetricSource;
              const validation = day.metricValidations[m.key];
              return (
                <MetricRow
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateHeader: {
    textAlign: 'center',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  recoveryCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  recoveryScoreLarge: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  recoveryPctLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  deviceBadge: {
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  deviceBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  deviceSummaryCard: {
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  deviceSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  heroCell: {
    alignItems: 'center',
  },
  heroValue: {
    fontWeight: '700',
    color: COLORS.text,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  secondaryCell: {
    alignItems: 'center',
  },
  secondaryValue: {
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  completeness: {
    fontSize: 9,
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
