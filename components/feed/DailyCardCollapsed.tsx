/**
 * DailyCardCollapsed — Compact view for non-expanded feed cards.
 *
 * Left: small IACIRing | Center: date + phenotype + device badge
 * Right: key metrics (HRV, Strain)
 *
 * Device badge label and color are resolved dynamically from deviceSource.
 */

import { View, StyleSheet } from 'react-native';
import { IACIRing } from '../dashboard/IACIRing';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { FeedDay, getSourceMeta } from '../../lib/types/feed';
import { today, formatDate } from '../../lib/utils/date';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  day: FeedDay;
}

function relativeDate(dateStr: string): string {
  const diff = differenceInDays(parseISO(today()), parseISO(dateStr));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return formatDate(dateStr, 'EEE MMM d');
}

/** Color-code recovery score (green/yellow/red). */
function recoveryColor(score: number | null | undefined): string {
  if (score == null) return COLORS.textMuted;
  if (score >= 67) return '#00C48C';
  if (score >= 34) return '#FFB800';
  return '#FF4444';
}

export function DailyCardCollapsed({ day }: Props) {
  const hasIACI = day.iaci != null;
  const score = day.iaci?.score ?? 0;
  const tier = day.iaci?.readinessTier ?? 'maintain';
  const phenotype = day.iaci?.phenotype?.label ?? (day.checkinCompleted ? '' : 'Check-in pending');

  const recovery = day.physiology?.recovery_score;
  const hrv = day.physiology?.hrv_rmssd;
  const sleepMs = day.physiology?.sleep_duration_ms;
  const sleepPct = day.physiology?.sleep_performance_pct;
  const strain = day.physiology?.day_strain;
  const hasDevice = day.deviceSynced && day.physiology != null;
  const sourceMeta = day.deviceSource ? getSourceMeta(day.deviceSource) : null;

  return (
    <View style={styles.row}>
      {/* Left: IACI Ring */}
      <View style={styles.ringContainer}>
        {hasIACI ? (
          <IACIRing score={score} tier={tier} size={56} />
        ) : (
          <View style={styles.ringPlaceholder}>
            <ThemedText variant="caption" color={COLORS.textMuted}>--</ThemedText>
          </View>
        )}
      </View>

      {/* Center: Date + Phenotype + Device badge */}
      <View style={styles.center}>
        <View style={styles.dateLine}>
          <ThemedText variant="body" style={styles.dateLabel}>
            {relativeDate(day.date)}
          </ThemedText>
          {hasDevice && sourceMeta && (
            <View style={[styles.deviceBadge, { borderColor: sourceMeta.color }]}>
              <ThemedText variant="caption" style={[styles.deviceBadgeText, { color: sourceMeta.color }]}>
                {sourceMeta.label}
              </ThemedText>
            </View>
          )}
        </View>
        {hasDevice ? (
          <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
            Recovery{' '}
            <ThemedText variant="caption" style={{ color: recoveryColor(recovery), fontWeight: '700' }}>
              {recovery != null ? `${Math.round(recovery)}%` : '--'}
            </ThemedText>
            {'  '}Sleep{' '}
            <ThemedText variant="caption" style={{ color: COLORS.text, fontWeight: '600' }}>
              {sleepMs != null ? `${(Math.round(sleepMs / 3600000 * 10) / 10).toFixed(1)}h` : '--'}
            </ThemedText>
            {sleepPct != null && (
              <ThemedText variant="caption" color={COLORS.textMuted}>
                {` (${Math.round(sleepPct)}%)`}
              </ThemedText>
            )}
          </ThemedText>
        ) : (
          <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
            {phenotype}
          </ThemedText>
        )}
      </View>

      {/* Right: Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCell}>
          <ThemedText variant="caption" color={COLORS.textMuted}>HRV</ThemedText>
          <ThemedText variant="caption" style={styles.metricValue}>
            {hrv != null ? Math.round(hrv) : '--'}
          </ThemedText>
        </View>
        <View style={styles.metricCell}>
          <ThemedText variant="caption" color={COLORS.textMuted}>Strain</ThemedText>
          <ThemedText variant="caption" style={styles.metricValue}>
            {strain != null ? strain.toFixed(1) : '--'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  ringContainer: {
    width: 60,
    alignItems: 'center',
  },
  ringPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginHorizontal: 12,
  },
  dateLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  deviceBadge: {
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
  },
  deviceBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: 'column',
    width: 50,
    gap: 4,
  },
  metricCell: {
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
});
