import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { TrainingCompatibility, TrainingPermission, TrainingModalityKey } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface TrainingCompatCardProps {
  compatibility: TrainingCompatibility;
}

/** Performance modalities shown on the dashboard (subset of 32) */
const DASHBOARD_MODALITIES: { key: TrainingModalityKey; label: string }[] = [
  { key: 'zone1', label: 'Zone 1 (Easy)' },
  { key: 'zone2', label: 'Zone 2 (Aerobic)' },
  { key: 'intervals', label: 'Intervals' },
  { key: 'tempo', label: 'Tempo/Threshold' },
  { key: 'strengthHeavy', label: 'Heavy Strength' },
  { key: 'strengthLight', label: 'Light Strength' },
  { key: 'techniqueDrill', label: 'Technique Drills' },
  { key: 'plyometrics', label: 'Plyometrics' },
];

const PERMISSION_ICONS: Record<TrainingPermission, { icon: string; color: string }> = {
  recommended: { icon: '●', color: COLORS.tierPerform },
  allowed: { icon: '●', color: COLORS.tierTrain },
  caution: { icon: '●', color: COLORS.tierMaintain },
  avoid: { icon: '●', color: COLORS.tierProtect },
};

export function TrainingCompatCard({ compatibility }: TrainingCompatCardProps) {
  return (
    <Card>
      <ThemedText variant="caption" style={styles.header}>
        TRAINING COMPATIBILITY
      </ThemedText>
      <View style={styles.grid}>
        {DASHBOARD_MODALITIES.map(({ key, label }) => {
          const permission = compatibility?.[key] ?? 'allowed';
          const { icon, color } = PERMISSION_ICONS[permission] ?? PERMISSION_ICONS.allowed;
          return (
            <View key={key} style={styles.row}>
              <ThemedText style={[styles.icon, { color }]}>{icon}</ThemedText>
              <ThemedText variant="caption" style={styles.label}>
                {label}
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
