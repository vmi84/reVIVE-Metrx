/**
 * WorkoutFocusBadge — Shows recommended workout focus.
 *
 * Green "Fitness Building" / Yellow "Active Recovery" / Red "Recovery Only"
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { WorkoutFocus } from '../../lib/types/load-capacity';

interface Props {
  focus: WorkoutFocus;
  rationale: string;
}

const FOCUS_CONFIG: Record<WorkoutFocus, { label: string; color: string; icon: string }> = {
  fitness_building: {
    label: 'Fitness Building',
    color: COLORS.success,
    icon: '💪',
  },
  active_recovery: {
    label: 'Active Recovery',
    color: COLORS.warning,
    icon: '🔄',
  },
  recovery_only: {
    label: 'Recovery Only',
    color: COLORS.error,
    icon: '🛌',
  },
};

export function WorkoutFocusBadge({ focus, rationale }: Props) {
  const config = FOCUS_CONFIG[focus];

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={styles.header}>
        <ThemedText variant="caption" style={styles.icon}>{config.icon}</ThemedText>
        <ThemedText variant="body" style={[styles.label, { color: config.color }]}>
          {config.label}
        </ThemedText>
      </View>
      <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.rationale}>
        {rationale}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
  },
  rationale: {
    fontSize: 12,
    lineHeight: 17,
  },
});
