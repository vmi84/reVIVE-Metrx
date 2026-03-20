import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTrends } from '../../hooks/use-trends';
import { useProgress } from '../../hooks/use-progress';
import { usePhysiologyStore } from '../../store/physiology-store';
import { useFeedStore } from '../../store/feed-store';
import { TrendChart, type ChartDataPoint, type ChartSeries } from '../../components/trends/TrendChart';
import { ACWRChart, type ACWRDataPoint } from '../../components/trends/ACWRChart';
import { useDailyStore } from '../../store/daily-store';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { SubsystemBars } from '../../components/dashboard/SubsystemBars';
import { COLORS } from '../../lib/utils/constants';
import { SubsystemKey } from '../../lib/types/iaci';
import { daysAgo, formatDate } from '../../lib/utils/date';

type Period = '7d' | '21d' | '28d' | '90d';
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '21d': 21, '28d': 28, '90d': 90 };

export default function Trends() {
  const { trends, loading, fetchTrends } = useTrends();
  const { progress, assessProgress } = useProgress();
  const { athleteMode } = useDailyStore();
  const physRecords = usePhysiologyStore((s) => s.records);
  const feedDays = useFeedStore((s) => s.days);
  const [period, setPeriod] = useState<Period>('7d');

  useEffect(() => {
    fetchTrends();
    assessProgress();
  }, []);

  const currentTrend = trends[period];

  // Chart series definitions
  const recoverySeries: ChartSeries[] = useMemo(() => [
    { key: 'iaciScore', label: 'IACI Score', color: COLORS.primary },
    { key: 'deviceRecovery', label: 'Device Recovery', color: '#00C48C', dashed: true },
    { key: 'hrv', label: 'HRV (normalized)', color: '#FF9800' },
    { key: 'sleepHrs', label: 'Sleep (hrs→%)', color: '#9C27B0', dashed: true },
    { key: 'rhr', label: 'RHR (inverted)', color: '#F44336' },
    { key: 'physical', label: 'Physical Feel', color: '#4CAF50' },
    { key: 'mental', label: 'Mental Feel', color: '#2196F3', dashed: true },
  ], []);

  // Build chart data from physiology store + feed store
  const chartData = useMemo((): ChartDataPoint[] => {
    const numDays = PERIOD_DAYS[period];
    const points: ChartDataPoint[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const dateStr = daysAgo(i);
      const physRec = physRecords[dateStr];
      const feedDay = feedDays.find(d => d.date === dateStr);
      const subj = feedDay?.subjective;

      // Normalize HRV to 0-100 scale (typical range 20-120ms)
      const rawHrv = physRec?.cardiovascular?.hrvRmssd;
      const hrvNorm = rawHrv != null ? Math.min(100, Math.max(0, (rawHrv / 120) * 100)) : null;

      // Normalize sleep hours to 0-100 (8h = 100%)
      const sleepMs = physRec?.sleep?.totalSleepMs;
      const sleepNorm = sleepMs != null ? Math.min(100, (sleepMs / (8 * 3600000)) * 100) : null;

      // Invert RHR (lower is better): 40bpm=100, 80bpm=0
      const rawRhr = physRec?.cardiovascular?.restingHeartRate;
      const rhrInverted = rawRhr != null ? Math.max(0, Math.min(100, (80 - rawRhr) * 2.5)) : null;

      // Composite physical feel from check-in (energy, soreness inverted, stiffness inverted)
      const energy = (subj as any)?.overall_energy ?? null;
      const soreness = (subj as any)?.stiffness ?? null; // Using quick soreness
      const physical = energy != null ? (energy / 5) * 100 : null;

      // Composite mental feel from check-in (motivation, stress inverted, mental fatigue inverted)
      const motivation = (subj as any)?.motivation ?? null;
      const stressRaw = (subj as any)?.subjective_stress ?? null;
      const mental = motivation != null && stressRaw != null
        ? ((motivation + (6 - stressRaw)) / 10) * 100
        : motivation != null ? (motivation / 5) * 100 : null;

      points.push({
        date: dateStr,
        label: formatDate(dateStr, 'MMM d'),
        iaciScore: feedDay?.iaci?.score ?? null,
        deviceRecovery: physRec?.recovery?.recoveryScore ?? null,
        hrv: hrvNorm,
        sleepHrs: sleepNorm,
        rhr: rhrInverted,
        physical,
        mental,
      });
    }

    return points;
  }, [period, physRecords, feedDays]);

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

      {/* Recovery Trend Chart — IACI vs Device Recovery */}
      <Card style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>
          RECOVERY TREND
        </ThemedText>
        <TrendChart data={chartData} series={recoverySeries} height={240} />
      </Card>

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

      {/* ACWR Visual Chart */}
      {progress && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            WORKLOAD RATIO (ACWR) TREND
          </ThemedText>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.acwrExplainer}>
            The Acute:Chronic Workload Ratio compares your recent training load (7 days) to your
            longer-term average (28 days). Staying in the green zone (0.8-{athleteMode === 'competitive' ? '1.5' : '1.3'}) means
            you're building fitness safely. Yellow/red means injury or overtraining risk is elevated.
          </ThemedText>
          <ACWRChart
            data={[{ date: '', label: 'Now', acwr: progress.acwr.ratio }]}
            height={160}
            sweetSpotMax={athleteMode === 'competitive' ? 1.5 : 1.3}
            dangerMin={athleteMode === 'competitive' ? 1.8 : 1.5}
          />
        </Card>
      )}

      {/* ACWR Current Value */}
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
  acwrExplainer: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
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
