import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS, BODY_REGIONS, SORENESS_LABELS } from '../../lib/utils/constants';

interface BodyMapProps {
  soreness: Record<string, number>;
  onRegionPress: (region: string) => void;
}

function getSorenessColor(level: number): string {
  switch (level) {
    case 0: return COLORS.surfaceLight;
    case 1: return '#4CAF50';
    case 2: return '#FFC107';
    case 3: return '#FF9800';
    case 4: return '#F44336';
    default: return COLORS.surfaceLight;
  }
}

export function BodyMap({ soreness, onRegionPress }: BodyMapProps) {
  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.title}>Soreness Map</ThemedText>
      <ThemedText variant="caption" style={styles.hint}>
        Tap a region to set soreness (0-4)
      </ThemedText>
      <View style={styles.grid}>
        {BODY_REGIONS.map((region) => {
          const level = soreness[region] ?? 0;
          const color = getSorenessColor(level);
          return (
            <TouchableOpacity
              key={region}
              onPress={() => onRegionPress(region)}
              style={[styles.region, { borderColor: color }]}
            >
              <View style={[styles.indicator, { backgroundColor: color }]} />
              <ThemedText variant="caption" style={styles.regionLabel}>
                {region.replace(/_/g, ' ')}
              </ThemedText>
              <ThemedText variant="caption" style={[styles.levelText, { color }]}>
                {SORENESS_LABELS[level]}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    marginBottom: 12,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  region: {
    width: '30%',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  regionLabel: {
    fontSize: 10,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  levelText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
});
