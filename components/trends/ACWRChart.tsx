/**
 * ACWRChart — Acute:Chronic Workload Ratio chart with danger zone shading.
 *
 * Y-axis: 0 to 2.5 (ACWR scale)
 * Zones:
 *   Green (0.8-1.3): Sweet spot — optimal training load
 *   Yellow (1.3-1.5 rec / 1.3-1.8 competitive): Caution — elevated injury risk
 *   Red (>1.5 rec / >1.8 competitive): Danger — high injury/overtraining risk
 *   Gray (<0.8): Undertraining — detraining risk
 */

import { View, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, Rect } from 'react-native-svg';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

export interface ACWRDataPoint {
  date: string;
  label: string;
  acwr: number | null;
}

interface Props {
  data: ACWRDataPoint[];
  height?: number;
  /** Upper bound of sweet spot (1.3 rec, 1.5 competitive) */
  sweetSpotMax?: number;
  /** Upper bound of caution zone (1.5 rec, 1.8 competitive) */
  dangerMin?: number;
}

const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 36 };

export function ACWRChart({ data, height = 180, sweetSpotMax = 1.3, dangerMin = 1.5 }: Props) {
  if (data.length < 2) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.empty}>
          Not enough workout data for ACWR. Log more sessions.
        </ThemedText>
      </View>
    );
  }

  const width = 340;
  const plotW = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const yMin = 0;
  const yMax = 2.5;

  const toX = (i: number) => CHART_PADDING.left + (i / (data.length - 1)) * plotW;
  const toY = (val: number) => CHART_PADDING.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const labelEvery = Math.max(1, Math.floor(data.length / 6));

  // Zone boundaries
  const zoneUnder = { y1: toY(0), y2: toY(0.8), color: COLORS.textMuted + '15' };      // Gray: undertraining
  const zoneSweet = { y1: toY(0.8), y2: toY(sweetSpotMax), color: '#00C48C20' };        // Green: sweet spot
  const zoneCaution = { y1: toY(sweetSpotMax), y2: toY(dangerMin), color: '#FFB80025' }; // Yellow: caution
  const zoneDanger = { y1: toY(dangerMin), y2: toY(yMax), color: '#FF444420' };          // Red: danger

  // ACWR line
  const points = data
    .map((d, i) => d.acwr != null ? `${toX(i)},${toY(d.acwr)}` : null)
    .filter(Boolean)
    .join(' ');

  const yTicks = [0, 0.5, 0.8, 1.0, 1.3, 1.5, 2.0, 2.5];

  return (
    <View style={styles.container}>
      {/* Zone legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00C48C' }]} />
          <ThemedText variant="caption" color={COLORS.textSecondary}>Sweet Spot (0.8-{sweetSpotMax})</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFB800' }]} />
          <ThemedText variant="caption" color={COLORS.textSecondary}>Caution</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
          <ThemedText variant="caption" color={COLORS.textSecondary}>Danger</ThemedText>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Zone shading */}
        <Rect x={CHART_PADDING.left} y={zoneDanger.y1} width={plotW}
          height={Math.abs(zoneDanger.y2 - zoneDanger.y1)} fill={zoneDanger.color} />
        <Rect x={CHART_PADDING.left} y={zoneCaution.y1} width={plotW}
          height={Math.abs(zoneCaution.y2 - zoneCaution.y1)} fill={zoneCaution.color} />
        <Rect x={CHART_PADDING.left} y={zoneSweet.y1} width={plotW}
          height={Math.abs(zoneSweet.y2 - zoneSweet.y1)} fill={zoneSweet.color} />
        <Rect x={CHART_PADDING.left} y={zoneUnder.y1} width={plotW}
          height={Math.abs(zoneUnder.y2 - zoneUnder.y1)} fill={zoneUnder.color} />

        {/* Y axis grid + labels */}
        {yTicks.map((tick) => (
          <Line
            key={`g-${tick}`}
            x1={CHART_PADDING.left} y1={toY(tick)}
            x2={CHART_PADDING.left + plotW} y2={toY(tick)}
            stroke={COLORS.border} strokeWidth={tick === 1.0 ? 1 : 0.5}
            strokeDasharray={tick === 1.0 ? undefined : '3,3'}
          />
        ))}
        {yTicks.filter(t => t === 0 || t === 0.8 || t === 1.0 || t === sweetSpotMax || t === dangerMin || t === 2.5).map((tick) => (
          <SvgText
            key={`yl-${tick}`}
            x={CHART_PADDING.left - 6} y={toY(tick) + 3}
            fontSize={8} fill={COLORS.textMuted} textAnchor="end"
          >
            {tick.toFixed(1)}
          </SvgText>
        ))}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % labelEvery !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText key={`xl-${i}`} x={toX(i)} y={height - 6}
              fontSize={8} fill={COLORS.textMuted} textAnchor="middle">
              {d.label}
            </SvgText>
          );
        })}

        {/* ACWR line */}
        {points && (
          <Polyline points={points} fill="none" stroke={COLORS.warning}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* ACWR dots — colored by zone */}
        {data.map((d, i) => {
          if (d.acwr == null) return null;
          let dotColor: string = COLORS.textMuted;
          if (d.acwr >= dangerMin) dotColor = '#FF4444';
          else if (d.acwr >= sweetSpotMax) dotColor = '#FFB800';
          else if (d.acwr >= 0.8) dotColor = '#00C48C';
          return (
            <Circle key={`ac-${i}`} cx={toX(i)} cy={toY(d.acwr)} r={3} fill={dotColor} />
          );
        })}
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
    gap: 10,
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
    paddingVertical: 30,
  },
});
