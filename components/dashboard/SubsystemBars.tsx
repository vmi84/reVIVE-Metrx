import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { SubsystemScores, SubsystemKey, getSubsystemBand } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface SubsystemBarsProps {
  scores: SubsystemScores;
}

const SUBSYSTEM_LABELS: Record<SubsystemKey, string> = {
  autonomic: 'Autonomic',
  musculoskeletal: 'Musculoskeletal',
  cardiometabolic: 'Cardiometabolic',
  sleep: 'Sleep/Circadian',
  metabolic: 'Metabolic',
  psychological: 'Psychological',
};

function getBarColor(score: number): string {
  if (score >= 85) return COLORS.tierPerform;
  if (score >= 70) return COLORS.tierTrain;
  if (score >= 55) return COLORS.tierMaintain;
  if (score >= 40) return COLORS.tierRecover;
  return COLORS.tierProtect;
}

export function SubsystemBars({ scores }: SubsystemBarsProps) {
  const keys: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological',
  ];

  return (
    <View style={styles.container}>
      {keys.map((key) => {
        const score = scores[key].score;
        const color = getBarColor(score);
        return (
          <View key={key} style={styles.row}>
            <ThemedText variant="caption" style={styles.label}>
              {SUBSYSTEM_LABELS[key]}
            </ThemedText>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${score}%`, backgroundColor: color },
                ]}
              />
            </View>
            <ThemedText variant="caption" style={[styles.score, { color }]}>
              {Math.round(score)}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    width: 100,
    fontSize: 11,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  score: {
    width: 28,
    textAlign: 'right',
    fontWeight: '700',
    fontSize: 13,
  },
});
