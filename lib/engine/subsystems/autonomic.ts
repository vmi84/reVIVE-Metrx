/**
 * Subsystem A: Autonomic / Neurophysiological Recovery
 * "Is the athlete systemically upregulated, suppressed, or balanced?"
 *
 * Inputs: HRV relative to baseline, RHR relative to baseline, prior-day and 3-day strain,
 * sleep duration, sleep quality/performance, sleep consistency, subjective stress, perceived fatigue.
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { BaselineData } from '../../types/iaci';
import {
  clamp,
  normalizeToBaseline,
  zScoreToPercent,
  invertedZScoreToPercent,
  weightedAverage,
} from '../../utils/math';

export interface AutonomicInputs {
  hrvRmssd: number | null;
  restingHeartRate: number | null;
  priorDayStrain: number | null;
  threeDayAvgStrain: number | null;
  sleepDurationMs: number | null;
  sleepPerformancePct: number | null;
  sleepConsistencyPct: number | null;
  subjectiveStress: number | null;  // 1-5
  perceivedFatigue: number | null;  // 1-5
}

export interface AutonomicBaselines {
  hrv: BaselineData | null;
  rhr: BaselineData | null;
  strain: BaselineData | null;
  sleepDuration: BaselineData | null;
}

const IDEAL_SLEEP_MS = 8 * 3600000; // 8 hours

export function scoreAutonomic(
  inputs: AutonomicInputs,
  baselines: AutonomicBaselines,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // HRV relative to baseline (most important)
  if (inputs.hrvRmssd != null && baselines.hrv) {
    const z = normalizeToBaseline(inputs.hrvRmssd, baselines.hrv.rollingMean, baselines.hrv.rollingSd);
    const score = zScoreToPercent(z);
    components.push(score);
    weights.push(0.30);
    if (score < 50) limitingFactors.push('HRV below baseline');
  }

  // RHR relative to baseline (inverted — lower is better)
  if (inputs.restingHeartRate != null && baselines.rhr) {
    const z = normalizeToBaseline(inputs.restingHeartRate, baselines.rhr.rollingMean, baselines.rhr.rollingSd);
    const score = invertedZScoreToPercent(z);
    components.push(score);
    weights.push(0.20);
    if (score < 50) limitingFactors.push('RHR elevated above baseline');
  }

  // Strain load (inverted — higher recent strain reduces score)
  if (inputs.threeDayAvgStrain != null && baselines.strain) {
    const z = normalizeToBaseline(inputs.threeDayAvgStrain, baselines.strain.rollingMean, baselines.strain.rollingSd);
    const score = invertedZScoreToPercent(z);
    components.push(score);
    weights.push(0.15);
    if (score < 45) limitingFactors.push('High accumulated strain');
  }

  // Sleep duration
  if (inputs.sleepDurationMs != null) {
    const ratio = inputs.sleepDurationMs / IDEAL_SLEEP_MS;
    const score = clamp(ratio * 80 + 10, 0, 100); // 8h = 90, 6h = 70, 10h = 100
    components.push(score);
    weights.push(0.10);
    if (score < 60) limitingFactors.push('Insufficient sleep duration');
  }

  // Sleep performance
  if (inputs.sleepPerformancePct != null) {
    components.push(clamp(inputs.sleepPerformancePct, 0, 100));
    weights.push(0.08);
    if (inputs.sleepPerformancePct < 60) limitingFactors.push('Poor sleep performance');
  }

  // Sleep consistency
  if (inputs.sleepConsistencyPct != null) {
    components.push(clamp(inputs.sleepConsistencyPct, 0, 100));
    weights.push(0.05);
  }

  // Subjective stress (inverted — 1=low stress=good, 5=high stress=bad)
  if (inputs.subjectiveStress != null) {
    const score = clamp((6 - inputs.subjectiveStress) * 20, 0, 100);
    components.push(score);
    weights.push(0.06);
    if (inputs.subjectiveStress >= 4) limitingFactors.push('High subjective stress');
  }

  // Perceived fatigue (inverted)
  if (inputs.perceivedFatigue != null) {
    const score = clamp((6 - inputs.perceivedFatigue) * 20, 0, 100);
    components.push(score);
    weights.push(0.06);
    if (inputs.perceivedFatigue >= 4) limitingFactors.push('High perceived fatigue');
  }

  const finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50; // Default to midpoint if no data

  return {
    key: 'autonomic',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      hrvRmssd: inputs.hrvRmssd,
      restingHeartRate: inputs.restingHeartRate,
      priorDayStrain: inputs.priorDayStrain,
      threeDayAvgStrain: inputs.threeDayAvgStrain,
      sleepDurationMs: inputs.sleepDurationMs,
      sleepPerformancePct: inputs.sleepPerformancePct,
      subjectiveStress: inputs.subjectiveStress,
      perceivedFatigue: inputs.perceivedFatigue,
    },
    limitingFactors,
  };
}
