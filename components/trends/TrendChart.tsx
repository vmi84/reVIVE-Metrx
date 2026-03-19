/**
 * TrendChart — Simple line chart using react-native-svg.
 *
 * Shows two data series (IACI score + device recovery) over time.
 * No external chart library needed.
 */

import { View, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, Rect } from 'react-native-svg';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

export interface ChartDataPoint {
  date: string; // YYYY-MM-DD
  label: string; // Display label (e.g., "Mar 15")
  iaciScore: number | null;
  deviceRecovery: number | null;
}

interface Props {
  data: ChartDataPoint[];
  height?: number;
}

const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 36 };
const IACI_COLOR = COLORS.primary; // Blue
const RECOVERY_COLOR = '#00C48C'; // Green

export function TrendChart({ data, height = 200 }: Props) {
  if (data.length < 2) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.empty}>
          Not enough data to show trends. Check back after a few days.
        </ThemedText>
      </View>
    );
  }

  const width = 340; // Will stretch via viewBox
  const plotW = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = height - CHART_PADDING.top - CHART_PADDING.bottom;

  // Y axis: 0-100
  const yMin = 0;
  const yMax = 100;

  const toX = (i: number) => CHART_PADDING.left + (i / (data.length - 1)) * plotW;
  const toY = (val: number) => CHART_PADDING.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  // Build polyline points
  const iaciPoints = data
    .map((d, i) => d.iaciScore != null ? `${toX(i)},${toY(d.iaciScore)}` : null)
    .filter(Boolean)
    .join(' ');

  const recoveryPoints = data
    .map((d, i) => d.deviceRecovery != null ? `${toX(i)},${toY(d.deviceRecovery)}` : null)
    .filter(Boolean)
    .join(' ');

  // Y axis grid lines
  const yTicks = [0, 25, 50, 75, 100];

  // X axis labels (show every Nth)
  const labelEvery = Math.max(1, Math.floor(data.length / 6));

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: IACI_COLOR }]} />
          <ThemedText variant="caption" color={COLORS.textSecondary}>IACI Score</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RECOVERY_COLOR }]} />
          <ThemedText variant="caption" color={COLORS.textSecondary}>Device Recovery</ThemedText>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <Rect x={CHART_PADDING.left} y={CHART_PADDING.top} width={plotW} height={plotH} fill={COLORS.surface} rx={4} />

        {/* Y axis grid lines */}
        {yTicks.map((tick) => (
          <Line
            key={tick}
            x1={CHART_PADDING.left}
            y1={toY(tick)}
            x2={CHART_PADDING.left + plotW}
            y2={toY(tick)}
            stroke={COLORS.border}
            strokeWidth={0.5}
          />
        ))}

        {/* Y axis labels */}
        {yTicks.map((tick) => (
          <SvgText
            key={`yl-${tick}`}
            x={CHART_PADDING.left - 6}
            y={toY(tick) + 3}
            fontSize={9}
            fill={COLORS.textMuted}
            textAnchor="end"
          >
            {tick}
          </SvgText>
        ))}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % labelEvery !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`xl-${i}`}
              x={toX(i)}
              y={height - 6}
              fontSize={8}
              fill={COLORS.textMuted}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}

        {/* IACI line */}
        {iaciPoints && (
          <Polyline
            points={iaciPoints}
            fill="none"
            stroke={IACI_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Recovery line */}
        {recoveryPoints && (
          <Polyline
            points={recoveryPoints}
            fill="none"
            stroke={RECOVERY_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4,3"
          />
        )}

        {/* IACI dots */}
        {data.map((d, i) => d.iaciScore != null ? (
          <Circle key={`ic-${i}`} cx={toX(i)} cy={toY(d.iaciScore)} r={3} fill={IACI_COLOR} />
        ) : null)}

        {/* Recovery dots */}
        {data.map((d, i) => d.deviceRecovery != null ? (
          <Circle key={`rc-${i}`} cx={toX(i)} cy={toY(d.deviceRecovery)} r={3} fill={RECOVERY_COLOR} />
        ) : null)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 40,
  },
});
