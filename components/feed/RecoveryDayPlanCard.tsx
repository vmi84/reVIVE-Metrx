/**
 * RecoveryDayPlanCard — Full-day recovery protocol for recovery-only days.
 *
 * Shows timeline (morning/midMorning/afternoon/evening) with modalities,
 * plus nutrition and sleep protocols.
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { RecoveryDayPlan, RecoveryBlock } from '../../lib/types/load-capacity';

interface Props {
  plan: RecoveryDayPlan;
}

function TimeBlock({ block }: { block: RecoveryBlock }) {
  if (block.modalities.length === 0) return null;
  return (
    <View style={styles.timeBlock}>
      <View style={styles.timeHeader}>
        <ThemedText variant="caption" style={styles.timeLabel}>
          {block.timeWindow}
        </ThemedText>
        <ThemedText variant="caption" color={COLORS.textMuted}>
          {block.totalMinutes} min
        </ThemedText>
      </View>
      {block.modalities.map((action, i) => (
        <View key={i} style={styles.actionRow}>
          <View style={styles.actionDot} />
          <View style={styles.actionContent}>
            <ThemedText variant="caption" style={styles.actionName}>
              {action.name}
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.actionMeta}>
              {action.durationMin}min • {action.targetSubsystem}
              {action.targetAreas.length > 0 ? ` • ${action.targetAreas.join(', ')}` : ''}
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.actionInstruction}>
              {action.instruction}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

export function RecoveryDayPlanCard({ plan }: Props) {
  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.recoveryBadge}>
          <ThemedText variant="caption" style={styles.badgeText}>RECOVERY DAY</ThemedText>
        </View>
        <ThemedText variant="caption" color={COLORS.textMuted}>
          ~{plan.totalEstimatedMinutes} min total
        </ThemedText>
      </View>

      <ThemedText variant="body" style={styles.focusText}>
        {plan.overallFocus}
      </ThemedText>

      {/* Timeline */}
      <View style={styles.timeline}>
        <TimeBlock block={plan.timeline.morning} />
        <TimeBlock block={plan.timeline.midMorning} />
        <TimeBlock block={plan.timeline.afternoon} />
        <TimeBlock block={plan.timeline.evening} />
      </View>

      {/* Nutrition */}
      <View style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>NUTRITION</ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary}>
          Hydration: {plan.nutritionProtocol.hydrationTargetMl}ml
          {plan.nutritionProtocol.electrolytes ? ' + electrolytes' : ''}
        </ThemedText>
        {plan.nutritionProtocol.proteinTimings.map((t, i) => (
          <ThemedText key={i} variant="caption" color={COLORS.textSecondary} style={styles.bulletItem}>
            • {t}
          </ThemedText>
        ))}
        {plan.nutritionProtocol.avoidances.map((a, i) => (
          <ThemedText key={i} variant="caption" color={COLORS.warning} style={styles.bulletItem}>
            ⚠ {a}
          </ThemedText>
        ))}
      </View>

      {/* Sleep */}
      <View style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionHeader}>SLEEP TARGET</ThemedText>
        <ThemedText variant="caption" color={COLORS.textSecondary}>
          {plan.sleepProtocol.targetHours}hrs target
        </ThemedText>
        {plan.sleepProtocol.sleepHygiene.map((h, i) => (
          <ThemedText key={i} variant="caption" color={COLORS.textSecondary} style={styles.bulletItem}>
            • {h}
          </ThemedText>
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recoveryBadge: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  focusText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 16,
  },
  timeline: {
    gap: 12,
  },
  timeBlock: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeLabel: {
    fontWeight: '700',
    fontSize: 11,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginTop: 5,
    marginRight: 8,
  },
  actionContent: {
    flex: 1,
  },
  actionName: {
    fontWeight: '600',
    fontSize: 13,
    color: COLORS.text,
  },
  actionMeta: {
    fontSize: 10,
    marginTop: 1,
  },
  actionInstruction: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  section: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 11,
    marginLeft: 4,
    marginTop: 2,
  },
});
