import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTrends } from '../../hooks/use-trends';
import { useProgress } from '../../hooks/use-progress';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { SubsystemBars } from '../../components/dashboard/SubsystemBars';
import { COLORS } from '../../lib/utils/constants';
import { SubsystemKey } from '../../lib/types/iaci';

type Period = '7d' | '21d' | '28d' | '90d';

export default function Trends() {
  const { trends, loading, fetchTrends } = useTrends();
  const { progress, assessProgress } = useProgress();
  const [period, setPeriod] = useState<Period>('7d');

  useEffect(() => {
    fetchTrends();
    assessProgress();
  }, []);

  const currentTrend = trends[period];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period selector */}
      <View style={styles.periods}>
        {(['7d', '21d', '28d', '90d'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
          >
            <ThemedText
              variant="caption"
              style={[styles.periodLabel, period === p && styles.periodLabelActive]}
            >
              {p}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* IACI Trend */}
      {currentTrend && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            IACI TREND ({period})
          </ThemedText>
          <View style={styles.trendRow}>
            <ThemedText variant="title">
              {currentTrend.iaciTrend > 0 ? '+' : ''}{currentTrend.iaciTrend.toFixed(2)}
            </ThemedText>
            <ThemedText variant="caption" color={
              currentTrend.iaciTrend > 0 ? COLORS.success :
              currentTrend.iaciTrend < 0 ? COLORS.error : COLORS.textSecondary
            }>
              {currentTrend.iaciTrend > 0 ? 'Improving' :
               currentTrend.iaciTrend < 0 ? 'Declining' : 'Stable'}
            </ThemedText>
          </View>
        </Card>
      )}

      {/* Training Load */}
      {currentTrend && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            TRAINING LOAD
          </ThemedText>
          <View style={styles.loadMetrics}>
            <View style={styles.loadItem}>
              <ThemedText variant="subtitle">
                {currentTrend.strainAvg.toFixed(1)}
              </ThemedText>
              <ThemedText variant="caption">Avg Strain</ThemedText>
            </View>
            <View style={styles.loadItem}>
              <ThemedText variant="subtitle">
                {currentTrend.trainingLoadAvg.toFixed(1)}
              </ThemedText>
              <ThemedText variant="caption">Load Avg</ThemedText>
            </View>
          </View>
        </Card>
      )}

      {/* ACWR */}
      {progress && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            WORKLOAD RATIO (ACWR)
          </ThemedText>
          <View style={styles.acwrRow}>
            <ThemedText variant="title">
              {progress.acwr.ratio.toFixed(2)}
            </ThemedText>
            <View style={[
              styles.acwrBadge,
              { backgroundColor: getACWRColor(progress.acwr.zone) },
            ]}>
              <ThemedText variant="caption" style={styles.acwrText}>
                {progress.acwr.zone.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.acwrDetail}>
            Acute: {progress.acwr.acute.toFixed(1)} / Chronic: {progress.acwr.chronic.toFixed(1)}
          </ThemedText>
        </Card>
      )}

      {/* Stall Detection */}
      {progress?.stallType !== 'none' && progress && (
        <Card style={[styles.section, styles.stallCard]}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            STALL DETECTED
          </ThemedText>
          <ThemedText variant="subtitle" color={COLORS.warning}>
            {progress.stallType.replace(/_/g, ' ')}
          </ThemedText>
          <ThemedText variant="body" style={styles.stallExplanation}>
            Alternative approaches:
          </ThemedText>
          {progress.alternativeApproaches.map((approach, i) => (
            <ThemedText key={i} variant="caption" style={styles.approach}>
              {i + 1}. {approach}
            </ThemedText>
          ))}
        </Card>
      )}

      {!currentTrend && !loading && (
        <View style={styles.empty}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            Not enough data yet. Keep logging to see trends.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

function getACWRColor(zone: string): string {
  switch (zone) {
    case 'sweet_spot': return COLORS.success;
    case 'undertraining': return COLORS.warning;
    case 'danger': return COLORS.orange;
    case 'overreaching': return COLORS.error;
    default: return COLORS.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  periods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodLabel: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodLabelActive: {
    color: '#fff',
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
  trendRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  loadMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  loadItem: {
    alignItems: 'center',
  },
  acwrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  acwrBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acwrText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  acwrDetail: {
    marginTop: 8,
  },
  stallCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  stallExplanation: {
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  approach: {
    color: COLORS.text,
    marginBottom: 4,
    paddingLeft: 8,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});
