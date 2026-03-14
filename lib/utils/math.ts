/**
 * Math utilities for IACI calculations.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function rollingMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function rollingSd(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = rollingMean(values);
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function normalizeToBaseline(
  value: number,
  baseline: number,
  sd: number,
): number {
  if (sd === 0) return 0;
  return (value - baseline) / sd;
}

export function zScoreToPercent(z: number): number {
  // Convert z-score to 0-100 scale centered at 50
  // z of 0 → 50, z of +2 → ~98, z of -2 → ~2
  return clamp(50 + z * 15, 0, 100);
}

export function invertedZScoreToPercent(z: number): number {
  // For metrics where lower is better (e.g., RHR)
  return clamp(50 - z * 15, 0, 100);
}

export function weightedAverage(
  values: number[],
  weights: number[],
): number {
  if (values.length !== weights.length || values.length === 0) return 0;
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
}

export function linearTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = rollingMean(values);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

export function exponentialMovingAverage(
  values: number[],
  alpha: number = 0.2,
): number {
  if (values.length === 0) return 0;
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
}
