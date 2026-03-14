import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { useProgress } from '@/hooks/use-progress';
import { useTrends } from '@/hooks/use-trends';
import { COLORS, ACWR_ZONES, MONOTONY_THRESHOLD } from '@/lib/utils/constants';
import type { ACWR, StallType } from '@/lib/types/progress';

function getACWRZoneColor(zone: ACWR['zone']): string {
  switch (zone) {
    case 'sweet_spot':
      return COLORS.success;
    case 'danger':
      return COLORS.warning;
    case 'overreaching':
      return COLORS.error;
    case 'undertraining':
      return COLORS.orange;
    default:
      return COLORS.textSecondary;
  }
}

function getACWRZoneLabel(zone: ACWR['zone']): string {
  switch (zone) {
    case 'sweet_spot':
      return 'Optimal';
    case 'danger':
      return 'Caution';
    case 'overreaching':
      return 'Danger';
    case 'undertraining':
      return 'Undertraining';
    default:
      return zone;
  }
}

function getStallLabel(stallType: StallType): string {
  switch (stallType) {
    case 'vo2max_plateau':
      return 'VO2max Plateau';
    case 'pace_stagnation':
      return 'Pace Stagnation';
    case 'hrv_stagnation':
      return 'HRV Stagnation';
    case 'training_monotony':
      return 'Training Monotony';
    case 'overreaching':
      return 'Overreaching';
    case 'recovery_deficit':
      return 'Recovery Deficit';
    case 'none':
      return 'No Stall Detected';
    default:
      return 'Unknown';
  }
}

function getTrendArrow(trend: number): string {
  if (trend > 0.5) return '+';
  if (trend < -0.5) return '-';
  return '~';
}

function getTrendColor(trend: number): string {
  if (trend > 0.5) return COLORS.success;
  if (trend < -0.5) return COLORS.error;
  return COLORS.textSecondary;
}

export default function ProgressReport() {
  const { progress, loading: progressLoading, assessProgress } = useProgress();
  const { trends, loading: trendsLoading, fetchTrends } = useTrends();

  useEffect(() => {
    assessProgress();
    fetchTrends();
  }, []);

  const loading = progressLoading || trendsLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Progress Report',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading && !progress ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <ThemedText variant="caption" style={styles.loadingText}>
              Analyzing your progress...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* ACWR Section */}
            <Card style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Workload Ratio (ACWR)
              </ThemedText>
              {progress?.acwr ? (
                <>
                  <View style={styles.scoreRow}>
                    <ThemedText variant="score" color={getACWRZoneColor(progress.acwr.zone)}>
                      {progress.acwr.ratio.toFixed(2)}
                    </ThemedText>
                    <View
                      style={[
                        styles.zoneBadge,
                        { backgroundColor: getACWRZoneColor(progress.acwr.zone) + '20' },
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        color={getACWRZoneColor(progress.acwr.zone)}
                        style={styles.zoneBadgeText}
                      >
                        {getACWRZoneLabel(progress.acwr.zone)}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <ThemedText variant="caption">Acute (7d avg)</ThemedText>
                      <ThemedText variant="body">{progress.acwr.acute.toFixed(1)}</ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <ThemedText variant="caption">Chronic (28d avg)</ThemedText>
                      <ThemedText variant="body">{progress.acwr.chronic.toFixed(1)}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.zoneScale}>
                    <View style={[styles.zoneBar, { backgroundColor: COLORS.orange, flex: 0.8 }]} />
                    <View style={[styles.zoneBar, { backgroundColor: COLORS.success, flex: 0.5 }]} />
                    <View style={[styles.zoneBar, { backgroundColor: COLORS.warning, flex: 0.2 }]} />
                    <View style={[styles.zoneBar, { backgroundColor: COLORS.error, flex: 0.5 }]} />
                  </View>
                  <View style={styles.zoneLabelRow}>
                    <ThemedText variant="caption">0</ThemedText>
                    <ThemedText variant="caption">0.8</ThemedText>
                    <ThemedText variant="caption">1.3</ThemedText>
                    <ThemedText variant="caption">1.5</ThemedText>
                    <ThemedText variant="caption">2.0+</ThemedText>
                  </View>
                </>
              ) : (
                <ThemedText variant="body" color={COLORS.textSecondary}>
                  Not enough data to calculate ACWR yet.
                </ThemedText>
              )}
            </Card>

            {/* Training Monotony */}
            <Card style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Training Monotony
              </ThemedText>
              {progress ? (
                <>
                  <View style={styles.scoreRow}>
                    <ThemedText
                      variant="score"
                      color={
                        progress.monotony > MONOTONY_THRESHOLD
                          ? COLORS.error
                          : COLORS.success
                      }
                    >
                      {progress.monotony.toFixed(2)}
                    </ThemedText>
                    <View
                      style={[
                        styles.zoneBadge,
                        {
                          backgroundColor:
                            progress.monotony > MONOTONY_THRESHOLD
                              ? COLORS.error + '20'
                              : COLORS.success + '20',
                        },
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        color={
                          progress.monotony > MONOTONY_THRESHOLD
                            ? COLORS.error
                            : COLORS.success
                        }
                        style={styles.zoneBadgeText}
                      >
                        {progress.monotony > MONOTONY_THRESHOLD ? 'High Risk' : 'Good Variety'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="caption" style={styles.helperText}>
                    {`Threshold: ${MONOTONY_THRESHOLD.toFixed(1)} — Values above indicate too-uniform training loads.`}
                  </ThemedText>
                </>
              ) : (
                <ThemedText variant="body" color={COLORS.textSecondary}>
                  Not enough data to calculate monotony yet.
                </ThemedText>
              )}
            </Card>

            {/* Stall Detection */}
            <Card style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                Stall Detection
              </ThemedText>
              {progress ? (
                <>
                  <View style={styles.stallRow}>
                    <View
                      style={[
                        styles.stallIndicator,
                        {
                          backgroundColor:
                            progress.stallType === 'none'
                              ? COLORS.success
                              : COLORS.warning,
                        },
                      ]}
                    />
                    <ThemedText variant="body">
                      {getStallLabel(progress.stallType)}
                    </ThemedText>
                  </View>
                  {progress.alternativeApproaches.length > 0 && (
                    <View style={styles.approachesContainer}>
                      <ThemedText variant="caption" style={styles.approachesTitle}>
                        Suggested Alternatives
                      </ThemedText>
                      {progress.alternativeApproaches.map((approach, index) => (
                        <View key={index} style={styles.approachRow}>
                          <ThemedText variant="caption" color={COLORS.primary}>
                            {'\u2022'}
                          </ThemedText>
                          <ThemedText variant="body" style={styles.approachText}>
                            {approach}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <ThemedText variant="body" color={COLORS.textSecondary}>
                  Not enough data for stall detection.
                </ThemedText>
              )}
            </Card>

            {/* IACI Trend Summary */}
            <Card style={styles.section}>
              <ThemedText variant="subtitle" style={styles.sectionTitle}>
                IACI Trend Summary
              </ThemedText>
              {Object.keys(trends).length > 0 ? (
                <View>
                  {(['7d', '21d', '28d', '90d'] as const).map((period) => {
                    const t = trends[period];
                    if (!t) return null;
                    return (
                      <View key={period} style={styles.trendRow}>
                        <ThemedText variant="body" style={styles.trendPeriod}>
                          {period === '7d'
                            ? 'Weekly'
                            : period === '21d'
                            ? '3-Week'
                            : period === '28d'
                            ? 'Monthly'
                            : 'Quarterly'}
                        </ThemedText>
                        <View style={styles.trendValues}>
                          <ThemedText
                            variant="body"
                            color={getTrendColor(t.iaciTrend)}
                            style={styles.trendValue}
                          >
                            {getTrendArrow(t.iaciTrend)} IACI {t.iaciTrend > 0 ? '+' : ''}
                            {t.iaciTrend.toFixed(1)}
                          </ThemedText>
                          <ThemedText variant="caption">
                            Load avg: {t.trainingLoadAvg.toFixed(1)} | Strain: {t.strainAvg.toFixed(1)}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <ThemedText variant="body" color={COLORS.textSecondary}>
                  Not enough data for trend analysis.
                </ThemedText>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  zoneBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoneBadgeText: {
    fontWeight: '600',
    fontSize: 13,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detailItem: {
    gap: 2,
  },
  zoneScale: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  zoneBar: {
    height: '100%',
  },
  zoneLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperText: {
    marginTop: 8,
  },
  stallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stallIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  approachesContainer: {
    marginTop: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
  },
  approachesTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  approachRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    paddingLeft: 4,
  },
  approachText: {
    flex: 1,
    fontSize: 14,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trendPeriod: {
    width: 80,
    fontWeight: '600',
  },
  trendValues: {
    flex: 1,
    gap: 2,
  },
  trendValue: {
    fontWeight: '600',
  },
});
