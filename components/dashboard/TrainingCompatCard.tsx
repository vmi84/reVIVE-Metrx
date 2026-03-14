import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { TrainingCompatibility, TrainingPermission } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface TrainingCompatCardProps {
  compatibility: TrainingCompatibility;
}

const TRAINING_LABELS: Record<keyof TrainingCompatibility, string> = {
  zone1: 'Zone 1 (Easy)',
  zone2: 'Zone 2 (Aerobic)',
  intervals: 'Intervals',
  tempo: 'Tempo/Threshold',
  strengthHeavy: 'Heavy Strength',
  strengthLight: 'Light Strength',
  techniqueDrill: 'Technique Drills',
  plyometrics: 'Plyometrics',
};

const PERMISSION_ICONS: Record<TrainingPermission, { icon: string; color: string }> = {
  recommended: { icon: '●', color: COLORS.tierPerform },
  allowed: { icon: '●', color: COLORS.tierTrain },
  caution: { icon: '●', color: COLORS.tierMaintain },
  avoid: { icon: '●', color: COLORS.tierProtect },
};

export function TrainingCompatCard({ compatibility }: TrainingCompatCardProps) {
  const entries = Object.entries(compatibility) as [keyof TrainingCompatibility, TrainingPermission][];

  return (
    <Card>
      <ThemedText variant="caption" style={styles.header}>
        TRAINING COMPATIBILITY
      </ThemedText>
      <View style={styles.grid}>
        {entries.map(([key, permission]) => {
          const { icon, color } = PERMISSION_ICONS[permission];
          return (
            <View key={key} style={styles.row}>
              <ThemedText style={[styles.icon, { color }]}>{icon}</ThemedText>
              <ThemedText variant="caption" style={styles.label}>
                {TRAINING_LABELS[key]}
              </ThemedText>
              <ThemedText variant="caption" style={[styles.permission, { color }]}>
                {permission}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 10,
    width: 14,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  permission: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    width: 90,
    textAlign: 'right',
  },
});
