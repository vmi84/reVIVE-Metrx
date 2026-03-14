import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface Metric {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

interface MetricsRowProps {
  metrics: Metric[];
}

const TREND_ICONS = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <View style={styles.container}>
      {metrics.map((metric, i) => (
        <View key={i} style={styles.item}>
          <ThemedText variant="caption" style={styles.label}>
            {metric.label}
          </ThemedText>
          <View style={styles.valueRow}>
            <ThemedText variant="subtitle" style={styles.value}>
              {metric.value}
            </ThemedText>
            {metric.unit && (
              <ThemedText variant="caption" style={styles.unit}>
                {metric.unit}
              </ThemedText>
            )}
            {metric.trend && (
              <ThemedText variant="caption" style={[
                styles.trend,
                metric.trend === 'up' && styles.trendUp,
                metric.trend === 'down' && styles.trendDown,
              ]}>
                {TREND_ICONS[metric.trend]}
              </ThemedText>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: COLORS.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  trend: {
    fontSize: 14,
    marginLeft: 2,
    color: COLORS.textSecondary,
  },
  trendUp: {
    color: COLORS.success,
  },
  trendDown: {
    color: COLORS.error,
  },
});
