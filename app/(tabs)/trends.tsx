/**
 * Trends Tab — Tabbed charts with toggleable data series.
 *
 * Tab 1: Recovery — IACI, Device Recovery, HRV, Sleep, RHR
 * Tab 2: Check-In — Physical Feel, Mental Feel, Energy, Soreness, Stress, Motivation
 * Tab 3: Training Load — ACWR with zone shading + strain metrics
 */

import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTrends } from '../../hooks/use-trends';
import { useProgress } from '../../hooks/use-progress';
import { usePhysiologyStore } from '../../store/physiology-store';
import { useFeedStore } from '../../store/feed-store';
import { useDailyStore } from '../../store/daily-store';
import { TrendChart, type ChartDataPoint, type ChartSeries } from '../../components/trends/TrendChart';
import { ACWRChart } from '../../components/trends/ACWRChart';
import { Card } from '../../components/ui/Card';
import { ThemedText } from '../../components/ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { daysAgo, formatDate } from '../../lib/utils/date';

// ─── Types ─────────────────────────────────────────────────────────────────

type Period = '7d' | '21d' | '28d' | '90d';
type ChartTab = 'recovery' | 'checkin' | 'training';

const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '21d': 21, '28d': 28, '90d': 90 };

const CHART_TABS: { key: ChartTab; label: string }[] = [
  { key: 'recovery', label: 'Recovery' },
  { key: 'checkin', label: 'Check-In' },
  { key: 'training', label: 'Training Load' },
];

// ─── Series Definitions ────────────────────────────────────────────────────

const RECOVERY_SERIES: ChartSeries[] = [
  { key: 'iaciScore', label: 'IACI Score', color: COLORS.primary },
  { key: 'deviceRecovery', label: 'Device Recovery', color: '#00C48C', dashed: true },
  { key: 'hrv', label: 'HRV (normalized)', color: '#FF9800' },
  { key: 'sleepPct', label: 'Sleep Quality', color: '#9C27B0', dashed: true },
  { key: 'rhr', label: 'RHR (inverted)', color: '#F44336' },
];

const CHECKIN_SERIES: ChartSeries[] = [
  { key: 'energy', label: 'Energy', color: '#4CAF50' },
  { key: 'sleepQuality', label: 'Sleep Quality', color: '#9C27B0' },
  { key: 'soreness', label: 'Soreness (inv)', color: '#FF9800', dashed: true },
  { key: 'motivation', label: 'Motivation', color: COLORS.primary },
  { key: 'stress', label: 'Stress (inv)', color: '#F44336', dashed: true },
  { key: 'mentalFatigue', label: 'Mental Fatigue (inv)', color: '#FF5722', dashed: true },
  { key: 'physical', label: 'Physical Composite', color: '#00C48C' },
  { key: 'mental', label: 'Mental Composite', color: '#2196F3' },
];

const TRAINING_SERIES: ChartSeries[] = [
  { key: 'strain', label: 'Day Strain', color: '#FF9800' },
  { key: 'iaciScore', label: 'IACI Score', color: COLORS.primary, dashed: true },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function Trends() {
  const { trends, loading, fetchTrends } = useTrends();
  const { progress, assessProgress } = useProgress();
  const { athleteMode } = useDailyStore();
  const physRecords = usePhysiologyStore((s) => s.records);
  const feedDays = useFeedStore((s) => s.days);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartTab, setChartTab] = useState<ChartTab>('recovery');

  useEffect(() => {
    fetchTrends();
    assessProgress();
  }, []);

  const currentTrend = trends[period];

  // Build chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    const numDays = PERIOD_DAYS[period];
    const points: ChartDataPoint[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const dateStr = daysAgo(i);
      const physRec = physRecords[dateStr];
      const feedDay = feedDays.find(d => d.date === dateStr);
      const subj = feedDay?.subjective as any;

      // Recovery metrics (normalized to 0-100)
      const rawHrv = physRec?.cardiovascular?.hrvRmssd;
      const hrvNorm = rawHrv != null ? Math.min(100, Math.max(0, (rawHrv / 120) * 100)) : null;

      const sleepMs = physRec?.sleep?.totalSleepMs;
      const sleepPct = sleepMs != null ? Math.min(100, (sleepMs / (8 * 3600000)) * 100) : null;

      const rawRhr = physRec?.cardiovascular?.restingHeartRate;
      const rhrInverted = rawRhr != null ? Math.max(0, Math.min(100, (80 - rawRhr) * 2.5)) : null;

      // Check-in metrics (1-5 → 0-100)
      const energyRaw = subj?.overall_energy ?? null;
      const sleepQualRaw = subj?.subjective_sleep_quality ?? null;
      const sorenessRaw = subj?.stiffness ?? null; // Using quick soreness
      const motivRaw = subj?.motivation ?? null;
      const stressRaw = subj?.subjective_stress ?? null;
      const mentalFatRaw = subj?.mental_fatigue ?? null;

      const toScale = (v: number | null) => v != null ? (v / 5) * 100 : null;
      const toScaleInv = (v: number | null) => v != null ? ((6 - v) / 5) * 100 : null;

      const energyScaled = toScale(energyRaw);
      const sorenessInv = toScaleInv(sorenessRaw);
      const motivScaled = toScale(motivRaw);
      const stressInv = toScaleInv(stressRaw);
      const mentalFatInv = toScaleInv(mentalFatRaw);
      const sleepQualScaled = toScale(sleepQualRaw);

      // Composites
      const physicalComps = [energyScaled, sorenessInv].filter(v => v != null) as number[];
      const physical = physicalComps.length > 0 ? physicalComps.reduce((a, b) => a + b) / physicalComps.length : null;

      const mentalComps = [motivScaled, stressInv, mentalFatInv].filter(v => v != null) as number[];
      const mental = mentalComps.length > 0 ? mentalComps.reduce((a, b) => a + b) / mentalComps.length : null;

      // Training load
      const dayStrain = physRec?.dayStrain ?? null;
      // Normalize strain to 0-100 (Whoop strain 0-21 scale)
      const strainNorm = dayStrain != null ? Math.min(100, (dayStrain / 21) * 100) : null;

      points.push({
        date: dateStr,
        label: formatDate(dateStr, 'MMM d'),
        // Recovery
        iaciScore: feedDay?.iaci?.score ?? null,
        deviceRecovery: physRec?.recovery?.recoveryScore ?? null,
        hrv: hrvNorm,
        sleepPct,
        rhr: rhrInverted,
        // Check-in
        energy: energyScaled,
        sleepQuality: sleepQualScaled,
        soreness: sorenessInv,
        motivation: motivScaled,
        stress: stressInv,
        mentalFatigue: mentalFatInv,
        physical,
        mental,
        // Training
        strain: strainNorm,
      });
    }

    return points;
  }, [period, physRecords, feedDays]);

  // Get the right series for the active tab
  const activeSeries = chartTab === 'recovery' ? RECOVERY_SERIES
    : chartTab === 'checkin' ? CHECKIN_SERIES
    : TRAINING_SERIES;

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

      {/* Chart Tab selector */}
      <View style={styles.chartTabs}>
        {CHART_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setChartTab(tab.key)}
            style={[styles.chartTab, chartTab === tab.key && styles.chartTabActive]}
          >
            <ThemedText
              variant="caption"
              style={[styles.chartTabLabel, chartTab === tab.key && styles.chartTabLabelActive]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart — changes based on active tab */}
      <Card style={styles.chartCard}>
        {chartTab === 'training' ? (
          <>
            <ThemedText variant="caption" style={styles.sectionHeader}>
              TRAINING LOAD & STRAIN
            </ThemedText>
            <TrendChart data={chartData} series={activeSeries} height={220} />

            {/* ACWR below the strain chart */}
            {progress && (
              <>
                <ThemedText variant="caption" style={[styles.sectionHeader, { marginTop: 16 }]}>
                  ACUTE:CHRONIC WORKLOAD RATIO
                </ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.acwrExplainer}>
                  Compares recent (7d) vs long-term (28d) training load. Green = safe building. Yellow/Red = injury risk elevated.
                </ThemedText>
                <ACWRChart
                  data={[{ date: '', label: 'Now', acwr: progress.acwr.ratio }]}
                  height={140}
                  sweetSpotMax={athleteMode === 'competitive' ? 1.5 : 1.3}
                  dangerMin={athleteMode === 'competitive' ? 1.8 : 1.5}
                />
                <View style={styles.acwrRow}>
                  <ThemedText variant="subtitle" style={{ fontWeight: '700' }}>
                    {progress.acwr.ratio.toFixed(2)}
                  </ThemedText>
                  <View style={[styles.acwrBadge, { backgroundColor: getACWRColor(progress.acwr.zone) }]}>
                    <ThemedText variant="caption" style={styles.acwrText}>
                      {progress.acwr.zone.replace('_', ' ')}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color={COLORS.textSecondary}>
                    Acute: {progress.acwr.acute.toFixed(1)} / Chronic: {progress.acwr.chronic.toFixed(1)}
                  </ThemedText>
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <ThemedText variant="caption" style={styles.sectionHeader}>
              {chartTab === 'recovery' ? 'RECOVERY METRICS' : 'CHECK-IN METRICS'}
            </ThemedText>
            <TrendChart data={chartData} series={activeSeries} height={240} />
          </>
        )}
      </Card>

      {/* Summary cards below chart */}
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

      {/* Training Load Summary */}
      {currentTrend && (
        <Card style={styles.section}>
          <ThemedText variant="caption" style={styles.sectionHeader}>
            TRAINING LOAD
          </ThemedText>
          <View style={styles.loadMetrics}>
            <View style={styles.loadItem}>
              <ThemedText variant="subtitle">{currentTrend.strainAvg.toFixed(1)}</ThemedText>
              <ThemedText variant="caption" color={COLORS.textMuted}>Avg Strain</ThemedText>
            </View>
            <View style={styles.loadItem}>
              <ThemedText variant="subtitle">{currentTrend.trainingLoadAvg.toFixed(1)}</ThemedText>
              <ThemedText variant="caption" color={COLORS.textMuted}>Load Avg</ThemedText>
            </View>
          </View>
        </Card>
      )}

      {/* Stall Detection */}
      {progress?.stallType !== 'none' && progress && (
        <Card style={[styles.section, styles.stallCard]}>
          <ThemedText variant="caption" style={styles.sectionHeader}>STALL DETECTED</ThemedText>
          <ThemedText variant="subtitle" color={COLORS.warning}>
            {progress.stallType.replace(/_/g, ' ')}
          </ThemedText>
          <ThemedText variant="body" style={styles.stallExplanation}>Alternative approaches:</ThemedText>
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

// ─── Helpers ───────────────────────────────────────────────────────────────

function getACWRColor(zone: string): string {
  switch (zone) {
    case 'sweet_spot': return COLORS.success;
    case 'undertraining': return COLORS.warning;
    case 'danger': return COLORS.orange;
    case 'overreaching': return COLORS.error;
    default: return COLORS.textSecondary;
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────

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
    marginBottom: 10,
  },
  periodTab: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
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
    fontSize: 12,
  },
  periodLabelActive: {
    color: '#fff',
  },
  chartTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  chartTab: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTabActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  chartTabLabel: {
    fontWeight: '500',
    color: COLORS.textMuted,
    fontSize: 11,
  },
  chartTabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: 16,
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  acwrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  acwrBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  acwrText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'capitalize',
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
