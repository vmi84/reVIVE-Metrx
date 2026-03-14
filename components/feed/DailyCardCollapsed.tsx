/**
 * DailyCardCollapsed — Compact view (~90px) for non-expanded feed cards.
 *
 * Left: small IACIRing | Center: date + phenotype | Right: 4 key metrics
 */

import { View, StyleSheet } from 'react-native';
import { IACIRing } from '../dashboard/IACIRing';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { FeedDay } from '../../lib/types/feed';
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

export function DailyCardCollapsed({ day }: Props) {
  const hasIACI = day.iaci != null;
  const score = day.iaci?.score ?? 0;
  const tier = day.iaci?.readinessTier ?? 'maintain';
  const phenotype = day.iaci?.phenotype?.label ?? (day.checkinCompleted ? '' : 'Check-in pending');

  const hrv = day.physiology?.hrv_rmssd;
  const rhr = day.physiology?.resting_heart_rate;
  const sleepMs = day.physiology?.sleep_duration_ms;
  const strain = day.physiology?.day_strain;

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

      {/* Center: Date + Phenotype */}
      <View style={styles.center}>
        <ThemedText variant="body" style={styles.dateLabel}>
          {relativeDate(day.date)}
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
          {phenotype}
        </ThemedText>
      </View>

      {/* Right: 4 Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCell}>
          <ThemedText variant="caption" color={COLORS.textMuted}>HRV</ThemedText>
          <ThemedText variant="caption" style={styles.metricValue}>
            {hrv != null ? Math.round(hrv) : '--'}
          </ThemedText>
        </View>
        <View style={styles.metricCell}>
          <ThemedText variant="caption" color={COLORS.textMuted}>RHR</ThemedText>
          <ThemedText variant="caption" style={styles.metricValue}>
            {rhr != null ? Math.round(rhr) : '--'}
          </ThemedText>
        </View>
        <View style={styles.metricCell}>
          <ThemedText variant="caption" color={COLORS.textMuted}>Sleep</ThemedText>
          <ThemedText variant="caption" style={styles.metricValue}>
            {sleepMs != null ? (Math.round(sleepMs / 3600000 * 10) / 10).toFixed(1) : '--'}
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
  dateLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 100,
    gap: 2,
  },
  metricCell: {
    width: 46,
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
});
