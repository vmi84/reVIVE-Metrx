/**
 * Baseline Tracker — computes rolling 21-day baselines and standard deviations
 * for baseline-relative normalization of physiological metrics.
 *
 * Formula: normalized = (today - rolling_baseline) / rolling_SD
 */

import { BaselineData } from '../types/iaci';
import { rollingMean, rollingSd, linearTrend } from '../utils/math';
import { BASELINE_WINDOW_DAYS, BASELINE_MIN_SAMPLES } from '../utils/constants';

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export function computeBaseline(
  history: HistoricalDataPoint[],
  windowDays: number = BASELINE_WINDOW_DAYS,
  minSamples: number = BASELINE_MIN_SAMPLES,
): BaselineData | null {
  if (history.length < minSamples) return null;

  // Take the most recent windowDays entries
  const recent = history.slice(-windowDays);
  const values = recent.map(d => d.value);

  const mean = rollingMean(values);
  const sd = rollingSd(values);
  const slope = linearTrend(values);

  return {
    metric: '',
    rollingMean: mean,
    rollingSd: Math.max(sd, 0.01), // Prevent zero SD
    sampleCount: values.length,
    trendSlope: slope,
    lastUpdated: recent[recent.length - 1].date,
  };
}

export function computeAllBaselines(
  physiologyHistory: Array<{
    date: string;
    hrvRmssd: number | null;
    restingHeartRate: number | null;
    respiratoryRate: number | null;
    sleepDurationMs: number | null;
    dayStrain: number | null;
  }>,
): {
  hrv: BaselineData | null;
  rhr: BaselineData | null;
  respiratoryRate: BaselineData | null;
  sleepDuration: BaselineData | null;
  strain: BaselineData | null;
} {
  const extract = (
    key: keyof typeof physiologyHistory[0],
  ): HistoricalDataPoint[] =>
    physiologyHistory
      .filter(d => d[key] != null)
      .map(d => ({ date: d.date, value: d[key] as number }));

  const hrv = computeBaseline(extract('hrvRmssd'));
  const rhr = computeBaseline(extract('restingHeartRate'));
  const respiratoryRate = computeBaseline(extract('respiratoryRate'));
  const sleepDuration = computeBaseline(extract('sleepDurationMs'));
  const strain = computeBaseline(extract('dayStrain'));

  if (hrv) hrv.metric = 'hrv_rmssd';
  if (rhr) rhr.metric = 'resting_heart_rate';
  if (respiratoryRate) respiratoryRate.metric = 'respiratory_rate';
  if (sleepDuration) sleepDuration.metric = 'sleep_duration_ms';
  if (strain) strain.metric = 'day_strain';

  return { hrv, rhr, respiratoryRate, sleepDuration, strain };
}
