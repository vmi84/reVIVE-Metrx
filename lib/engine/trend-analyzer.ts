/**
 * Trend Analyzer — computes rolling trends and correlations for IACI,
 * subsystems, training load, and related metrics.
 */

import { linearTrend, rollingMean, exponentialMovingAverage } from '../utils/math';

export interface DailyMetric {
  date: string;
  iaciScore: number;
  subsystemScores: Record<string, number>;
  strain: number;
  inflammationScore: number | null;
}

export interface TrendResult {
  period: '7d' | '21d' | '28d' | '90d';
  iaciTrend: number;
  subsystemTrends: Record<string, number>;
  trainingLoadAvg: number;
  strainAvg: number;
  inflammationTrend: number | null;
}

export function analyzeTrends(
  history: DailyMetric[],
  period: '7d' | '21d' | '28d' | '90d',
): TrendResult {
  const periodDays = { '7d': 7, '21d': 21, '28d': 28, '90d': 90 }[period];
  const slice = history.slice(-periodDays);

  if (slice.length === 0) {
    return {
      period,
      iaciTrend: 0,
      subsystemTrends: {},
      trainingLoadAvg: 0,
      strainAvg: 0,
      inflammationTrend: null,
    };
  }

  const iaciValues = slice.map(d => d.iaciScore);
  const strainValues = slice.map(d => d.strain);

  // Subsystem trends
  const subsystemKeys = Object.keys(slice[0]?.subsystemScores ?? {});
  const subsystemTrends: Record<string, number> = {};
  for (const key of subsystemKeys) {
    const values = slice.map(d => d.subsystemScores[key] ?? 0);
    subsystemTrends[key] = linearTrend(values);
  }

  // Inflammation trend
  const inflammationValues = slice
    .filter(d => d.inflammationScore != null)
    .map(d => d.inflammationScore!);

  return {
    period,
    iaciTrend: linearTrend(iaciValues),
    subsystemTrends,
    trainingLoadAvg: rollingMean(strainValues),
    strainAvg: rollingMean(strainValues),
    inflammationTrend: inflammationValues.length >= 3 ? linearTrend(inflammationValues) : null,
  };
}

// ---------------------------------------------------------------------------
// Trend Context — converts raw trend slopes into actionable direction labels
// ---------------------------------------------------------------------------

import type { SubsystemKey, TrendDirection, TrendContext } from '../types/iaci';

const TREND_THRESHOLD = 0.5; // units/day — above = improving, below negative = declining

export function deriveTrendContext(trend7d: TrendResult | null): TrendContext {
  if (!trend7d) {
    return { direction: 'stable', iaciSlope: 0, subsystemTrends: {}, daysOfData: 0 };
  }

  const direction: TrendDirection =
    trend7d.iaciTrend > TREND_THRESHOLD ? 'improving' :
    trend7d.iaciTrend < -TREND_THRESHOLD ? 'declining' : 'stable';

  const subsystemTrends: Partial<Record<SubsystemKey, TrendDirection>> = {};
  for (const [key, slope] of Object.entries(trend7d.subsystemTrends)) {
    subsystemTrends[key as SubsystemKey] =
      slope > TREND_THRESHOLD ? 'improving' :
      slope < -TREND_THRESHOLD ? 'declining' : 'stable';
  }

  return {
    direction,
    iaciSlope: trend7d.iaciTrend,
    subsystemTrends,
    daysOfData: 7,
  };
}

export function computeRollingAverages(
  values: number[],
): { ema7: number; ema21: number; sma28: number } {
  return {
    ema7: exponentialMovingAverage(values.slice(-7), 0.3),
    ema21: exponentialMovingAverage(values.slice(-21), 0.1),
    sma28: rollingMean(values.slice(-28)),
  };
}
