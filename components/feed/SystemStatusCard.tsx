/**
 * SystemStatusCard — Displays the systemic stress status summary.
 *
 * Shows stress level badge, headline, description, and per-subsystem one-liners
 * ranked from most to least stressed.
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { SystemStatusSummary, StressLevel } from '../../lib/types/load-capacity';

interface Props {
  status: SystemStatusSummary;
}

const STRESS_COLORS: Record<StressLevel, string> = {
  low: COLORS.success,
  moderate: COLORS.warning,
  high: COLORS.error,
};

const STRESS_LABELS: Record<StressLevel, string> = {
  low: 'LOW',
  moderate: 'MOD',
  high: 'HIGH',
};

const STATUS_COLORS: Record<string, string> = {
  strong: COLORS.success,
  adequate: COLORS.primary,
  limited: COLORS.warning,
  compromised: COLORS.error,
};

export function SystemStatusCard({ status }: Props) {
  const badgeColor = STRESS_COLORS[status.stressLevel];

  return (
    <Card style={styles.card}>
      {/* Header: Badge + Headline */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText variant="caption" style={styles.badgeText}>
            {STRESS_LABELS[status.stressLevel]}
          </ThemedText>
        </View>
        <ThemedText variant="body" style={styles.headline} numberOfLines={2}>
          {status.headline}
        </ThemedText>
      </View>

      {/* Description */}
      <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.description}>
        {status.description}
      </ThemedText>

      {/* Per-Subsystem Highlights (ranked most → least stressed) */}
      <View style={styles.highlights}>
        {status.subsystemHighlights.map((h) => (
          <View key={h.subsystem} style={styles.highlightRow}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[h.status] }]} />
            <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.highlightText} numberOfLines={1}>
              {h.oneLiner}
            </ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  headline: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  highlights: {
    gap: 4,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 11,
  },
});
