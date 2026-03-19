/**
 * RecoveryBetweenSessions — Competitive athlete view for Train tab.
 *
 * Shows today's planned sessions and plan-aware recovery recommendations
 * framed as "between your sessions" or "before tomorrow's session."
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { useDailyStore } from '../../store/daily-store';
import { useTrainingPlanStore } from '../../store/training-plan-store';
import { getRecoveryForPlan } from '../../lib/engine/plan-aware-recovery';
import { today } from '../../lib/utils/date';
import type { RecoveryRecommendation } from '../../lib/engine/plan-aware-recovery';

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const STRATEGY_COLORS: Record<string, string> = {
  aggressive: '#FF4444',
  preparation: '#FFB800',
  inter_session: '#4DA6FF',
  standard: '#00C48C',
};

const STRATEGY_LABELS: Record<string, string> = {
  aggressive: 'AGGRESSIVE RECOVERY',
  preparation: 'SESSION PREP',
  inter_session: 'BETWEEN SESSIONS',
  standard: 'RECOVERY',
};

export function RecoveryBetweenSessions() {
  const { iaci } = useDailyStore();
  const plannedSessions = useTrainingPlanStore((s) => s.plannedSessions);
  const todayStr = today();
  const tomorrowDate = tomorrowStr();
  const todaySessions = plannedSessions[todayStr] ?? [];
  const tomorrowSessions = plannedSessions[tomorrowDate] ?? [];

  const recommendations = getRecoveryForPlan(
    todaySessions,
    tomorrowSessions,
    iaci,
  );

  const strategy = recommendations[0]?.strategy ?? 'standard';
  const strategyColor = STRATEGY_COLORS[strategy];
  const strategyLabel = STRATEGY_LABELS[strategy];

  return (
    <View style={styles.container}>
      {/* Today's Plan */}
      {todaySessions.length > 0 && (
        <Card style={styles.planCard}>
          <ThemedText variant="caption" style={styles.sectionLabel}>
            TODAY'S PLAN
          </ThemedText>
          {todaySessions.map((s, i) => (
            <View key={i} style={styles.sessionRow}>
              <ThemedText variant="caption" style={styles.sessionSlot}>
                {s.slot === 'am' ? 'AM' : s.slot === 'pm' ? 'PM' : ''}
              </ThemedText>
              <ThemedText variant="body" style={styles.sessionType}>
                {s.type}
              </ThemedText>
              {s.durationMin != null && (
                <ThemedText variant="caption" color={COLORS.textMuted}>
                  {s.durationMin}min
                </ThemedText>
              )}
              {s.intensityZone && (
                <View style={styles.zoneBadge}>
                  <ThemedText variant="caption" style={styles.zoneText}>
                    {s.intensityZone}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      {/* Tomorrow Preview */}
      {tomorrowSessions.length > 0 && (
        <View style={styles.tomorrowRow}>
          <ThemedText variant="caption" color={COLORS.textMuted}>
            TOMORROW:{' '}
          </ThemedText>
          <ThemedText variant="caption" color={COLORS.textSecondary}>
            {tomorrowSessions.map((s) => s.type).join(' + ')}
          </ThemedText>
        </View>
      )}

      {/* Recovery Recommendations */}
      {recommendations.length > 0 && (
        <Card style={[styles.recoveryCard, { borderLeftColor: strategyColor }]}>
          <View style={styles.strategyHeader}>
            <View style={[styles.strategyBadge, { backgroundColor: strategyColor + '20' }]}>
              <ThemedText variant="caption" style={[styles.strategyText, { color: strategyColor }]}>
                {strategyLabel}
              </ThemedText>
            </View>
          </View>

          {recommendations.map((rec, i) => (
            <RecoveryItem key={rec.modalityKey} rec={rec} index={i} />
          ))}
        </Card>
      )}

      {/* Empty state */}
      {todaySessions.length === 0 && recommendations.length === 0 && (
        <Card style={styles.emptyCard}>
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
            No training plan set. Add your plan in Settings or tap "What's your training today?" below.
          </ThemedText>
        </Card>
      )}
    </View>
  );
}

function RecoveryItem({ rec, index }: { rec: RecoveryRecommendation; index: number }) {
  return (
    <View style={styles.recItem}>
      <View style={styles.recRank}>
        <ThemedText variant="caption" style={styles.recRankText}>
          {index + 1}
        </ThemedText>
      </View>
      <View style={styles.recContent}>
        <View style={styles.recHeader}>
          <ThemedText variant="body" style={styles.recLabel}>
            {rec.label}
          </ThemedText>
          <ThemedText variant="caption" color={COLORS.textMuted}>
            {rec.durationMin}min
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={2}>
          {rec.rationale}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  planCard: {
    marginBottom: 8,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  sessionSlot: {
    width: 24,
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 10,
  },
  sessionType: {
    flex: 1,
    fontWeight: '600',
  },
  zoneBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tomorrowRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  recoveryCard: {
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  strategyHeader: {
    marginBottom: 10,
  },
  strategyBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  strategyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  recItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  recRank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  recContent: {
    flex: 1,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  recLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
