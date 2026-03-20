/**
 * TrendChart — Multi-series line chart with interactive legend.
 *
 * Uses react-native-svg. Tap a legend item to toggle that series on/off.
 * Supports any number of data series on a shared 0-100 Y axis.
 */

import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText, Rect } from 'react-native-svg';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  date: string;
  label: string;
  [key: string]: number | string | null; // Dynamic series values
}

export interface ChartSeries {
  key: string;         // Field name in ChartDataPoint
  label: string;       // Display name
  color: string;       // Line color
  dashed?: boolean;    // Dashed line style
}

interface Props {
  data: ChartDataPoint[];
  series: ChartSeries[];
  height?: number;
  yMin?: number;
  yMax?: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 36 };

// ─── Component ─────────────────────────────────────────────────────────────

export function TrendChart({ data, series, height = 220, yMin = 0, yMax = 100 }: Props) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  if (data.length < 2) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.empty}>
          Not enough data to show trends. Check back after a few days.
        </ThemedText>
      </View>
    );
  }

  const width = 340;
  const plotW = width - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = height - CHART_PADDING.top - CHART_PADDING.bottom;

  const toX = (i: number) => CHART_PADDING.left + (i / (data.length - 1)) * plotW;
  const toY = (val: number) => CHART_PADDING.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);
  const labelEvery = Math.max(1, Math.floor(data.length / 6));

  // Build polyline points for each visible series
  const visibleSeries = series.filter((s) => !hiddenSeries.has(s.key));

  return (
    <View style={styles.container}>
      {/* Interactive Legend — tap to toggle */}
      <View style={styles.legend}>
        {series.map((s) => {
          const isHidden = hiddenSeries.has(s.key);
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.legendItem, isHidden && styles.legendItemHidden]}
              onPress={() => toggleSeries(s.key)}
              activeOpacity={0.6}
            >
              <View style={[
                styles.legendDot,
                { backgroundColor: isHidden ? COLORS.textMuted : s.color },
              ]} />
              <ThemedText
                variant="caption"
                color={isHidden ? COLORS.textMuted : COLORS.textSecondary}
                style={isHidden ? styles.legendTextHidden : undefined}
              >
                {s.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <Rect
          x={CHART_PADDING.left}
          y={CHART_PADDING.top}
          width={plotW}
          height={plotH}
          fill={COLORS.surface}
          rx={4}
        />

        {/* Y axis grid lines */}
        {yTicks.map((tick) => (
          <Line
            key={`grid-${tick}`}
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
            {Math.round(tick)}
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

        {/* Data lines + dots for each visible series */}
        {visibleSeries.map((s) => {
          const points = data
            .map((d, i) => {
              const val = d[s.key];
              return val != null && typeof val === 'number' ? `${toX(i)},${toY(val)}` : null;
            })
            .filter(Boolean)
            .join(' ');

          if (!points) return null;

          return (
            <View key={s.key}>
              <Polyline
                points={points}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? '4,3' : undefined}
              />
              {data.map((d, i) => {
                const val = d[s.key];
                if (val == null || typeof val !== 'number') return null;
                return (
                  <Circle
                    key={`${s.key}-${i}`}
                    cx={toX(i)}
                    cy={toY(val)}
                    r={2.5}
                    fill={s.color}
                  />
                );
              })}
            </View>
          );
        })}
      </Svg>

      {/* Hint */}
      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.hint}>
        Tap a legend item to show/hide
      </ThemedText>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  legendItemHidden: {
    opacity: 0.4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextHidden: {
    textDecorationLine: 'line-through',
  },
  hint: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 40,
  },
});
