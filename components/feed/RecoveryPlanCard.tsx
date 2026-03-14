/**
 * RecoveryPlanCard — Displays the post-workout recovery plan.
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { RecoveryPlan } from '../../lib/types/load-capacity';

interface Props {
  plan: RecoveryPlan;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText variant="caption" style={styles.sectionHeader}>
      {title}
    </ThemedText>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <ThemedText variant="caption" color={COLORS.primary}>•</ThemedText>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.bulletText}>
            {item}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

export function RecoveryPlanCard({ plan }: Props) {
  return (
    <Card style={styles.card}>
      <ThemedText variant="body" style={styles.title}>
        Recovery Plan — {plan.workoutType}
      </ThemedText>

      {/* Immediate */}
      <SectionHeader title={`IMMEDIATE (${plan.immediate.durationMin} min)`} />
      <BulletList items={[...plan.immediate.actions, ...plan.immediate.modalities]} />

      {/* Short-Term */}
      <SectionHeader title="SHORT-TERM" />
      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.timing}>
        {plan.shortTerm.timing}
      </ThemedText>
      <BulletList items={plan.shortTerm.modalities} />

      {/* Area Focus */}
      {Object.keys(plan.shortTerm.areaFocus).length > 0 && (
        <View style={styles.areaFocusContainer}>
          {Object.entries(plan.shortTerm.areaFocus).map(([area, mods]) => (
            <View key={area} style={styles.areaRow}>
              <ThemedText variant="caption" color={COLORS.warning} style={styles.areaLabel}>
                {area}:
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary}>
                {mods.join(', ')}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Evening */}
      <SectionHeader title="EVENING" />
      <BulletList items={[
        `Target ${plan.evening.targetSleepHours}hrs sleep`,
        ...plan.evening.sleepProtocol,
        ...plan.evening.avoidances,
      ]} />

      {/* Next Day */}
      <SectionHeader title="TOMORROW" />
      <ThemedText variant="caption" color={COLORS.textSecondary}>
        Expected focus: {plan.nextDay.expectedFocus.replace('_', ' ')}
        {plan.nextDay.criticalAreas.length > 0
          ? ` — watch ${plan.nextDay.criticalAreas.join(', ')}` : ''}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  list: {
    gap: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
  },
  timing: {
    fontSize: 11,
    marginBottom: 4,
  },
  areaFocusContainer: {
    marginTop: 6,
    paddingLeft: 8,
    gap: 2,
  },
  areaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  areaLabel: {
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
