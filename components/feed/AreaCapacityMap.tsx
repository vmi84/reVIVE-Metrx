/**
 * AreaCapacityMap — Body region capacity visualization.
 *
 * Color-coded pills showing each region's load capacity:
 * green (full), blue (moderate), yellow (light), red (none/avoid)
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { AreaCapacity, AreaIntensity } from '../../lib/types/load-capacity';

interface Props {
  areaCapacity: Record<string, AreaCapacity>;
}

const INTENSITY_COLORS: Record<AreaIntensity, string> = {
  full: COLORS.success,
  moderate: COLORS.primary,
  light: COLORS.warning,
  none: COLORS.error,
};

const REGION_LABELS: Record<string, string> = {
  quads: 'Quads',
  hamstrings: 'Hams',
  calves: 'Calves',
  glutes: 'Glutes',
  hips: 'Hips',
  shoulders: 'Shoulders',
  core: 'Core',
  lower_back: 'Low Back',
  upper_back: 'Up Back',
  chest: 'Chest',
  knees: 'Knees',
  ankles: 'Ankles',
};

export function AreaCapacityMap({ areaCapacity }: Props) {
  // Only show regions with meaningful data (exclude fully-ok regions for brevity unless few total)
  const entries = Object.values(areaCapacity);
  const hasIssues = entries.some(a => a.maxIntensity !== 'full');

  // If all clear, show a brief summary
  if (!hasIssues) {
    return (
      <View style={styles.allClear}>
        <ThemedText variant="caption" color={COLORS.success}>
          All regions at full capacity
        </ThemedText>
      </View>
    );
  }

  // Sort: most impacted first
  const sorted = entries
    .filter(a => REGION_LABELS[a.region])
    .sort((a, b) => b.soreness - a.soreness);

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" style={styles.header}>AREA CAPACITY</ThemedText>
      <View style={styles.grid}>
        {sorted.map((area) => {
          const color = INTENSITY_COLORS[area.maxIntensity];
          return (
            <View key={area.region} style={[styles.pill, { borderColor: color }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <ThemedText variant="caption" style={[styles.regionLabel, { color }]}>
                {REGION_LABELS[area.region] ?? area.region}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  allClear: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  regionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
