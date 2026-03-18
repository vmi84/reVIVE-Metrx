/**
 * DailyCardCollapsed — Compact view for non-expanded feed cards.
 *
 * Layout:
 *   Left:   Recovery color bar + IACI score (large) + device recovery % (small)
 *   Center: [WHOOP] badge + Date + phenotype
 *   Right:  Stacked metrics (HRV, Sleep, Strain)
 */

import { View, StyleSheet } from 'react-native';
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

function recoveryColor(score: number | null | undefined): string {
  if (score == null) return COLORS.textMuted;
  if (score >= 67) return '#00C48C';
  if (score >= 34) return '#FFB800';
  return '#FF4444';
}

export function DailyCardCollapsed({ day }: Props) {
  const hasIACI = day.iaci != null;
  const iaciScore = day.iaci?.score ?? null;
  const phenotype = day.iaci?.phenotype?.label ?? (day.checkinCompleted ? '' : 'Check-in pending');

  const recovery = day.physiology?.recovery_score;
  const hrv = day.physiology?.hrv_rmssd;
  const sleepPct = day.physiology?.sleep_performance_pct;
  const strain = day.physiology?.day_strain;
  const hasDevice = day.deviceSynced && day.physiology != null;
  const sourceMeta = day.deviceSource ? getSourceMeta(day.deviceSource) : null;
  const recColor = recoveryColor(recovery);

  return (
    <View style={styles.row}>
      {/* Left: color bar + scores */}
      <View style={styles.leftGroup}>
        <View style={[styles.colorBar, { backgroundColor: recColor }]} />
        <View style={styles.scoreCol}>
          <ThemedText style={styles.iaciScore}>
            {hasIACI ? Math.round(iaciScore!) : '--'}
          </ThemedText>
          {recovery != null && (
            <ThemedText style={[styles.deviceScore, { color: recColor }]}>
              {Math.round(recovery)}%
            </ThemedText>
          )}
        </View>
      </View>

      {/* Center: device badge + date + phenotype */}
      <View style={styles.center}>
        {hasDevice && sourceMeta && (
          <View style={[styles.badge, { borderColor: sourceMeta.color }]}>
            <ThemedText variant="caption" style={[styles.badgeText, { color: sourceMeta.color }]}>
              {sourceMeta.label}
            </ThemedText>
          </View>
        )}
        <ThemedText variant="body" style={styles.dateLabel}>
          {relativeDate(day.date)}
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
          {phenotype}
        </ThemedText>
      </View>

      {/* Right: stacked metrics */}
      <View style={styles.metricsStack}>
        <View style={styles.metricRow}>
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.metricLabel}>HRV</ThemedText>
          <ThemedText variant="caption" style={styles.metricVal}>
            {hrv != null ? `${Math.round(hrv)} ms` : '--'}
          </ThemedText>
        </View>
        <View style={styles.metricRow}>
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.metricLabel}>Sleep</ThemedText>
          <ThemedText variant="caption" style={styles.metricVal}>
            {sleepPct != null ? `${Math.round(sleepPct)}%` : '--'}
          </ThemedText>
        </View>
        <View style={styles.metricRow}>
          <ThemedText variant="caption" color={COLORS.textMuted} style={styles.metricLabel}>Strain</ThemedText>
          <ThemedText variant="caption" style={styles.metricVal}>
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
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorBar: {
    width: 4,
    height: 48,
    borderRadius: 2,
  },
  scoreCol: {
    width: 44,
    alignItems: 'center',
  },
  iaciScore: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 26,
  },
  deviceScore: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  center: {
    flex: 1,
    marginHorizontal: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dateLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  metricsStack: {
    width: 82,
    gap: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    width: 36,
  },
  metricVal: {
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'right',
  },
});
