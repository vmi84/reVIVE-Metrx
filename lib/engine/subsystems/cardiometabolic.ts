/**
 * Subsystem C: Cardiometabolic Readiness
 * "Is the athlete prepared for endurance, aerobic power, or interval work?"
 *
 * Inputs: HR response trends, recent cardio strain, time in zones, respiratory rate,
 * recovery after intervals, subjective breathlessness, prior VO2/threshold/HIIT exposure,
 * aerobic vs anaerobic density past 72 hours.
 */

import { SubsystemScore, getSubsystemBand, BaselineData } from '../../types/iaci';
import { clamp, normalizeToBaseline, invertedZScoreToPercent, weightedAverage } from '../../utils/math';

export interface CardiometabolicInputs {
  respiratoryRate: number | null;
  recentCardioStrainTotal: number | null; // sum of cardio strain past 72h
  timeInZone4_5_72h_ms: number | null;    // time in zones 4-5 past 72h
  subjectiveBreathlessness: number | null; // 1-5
  perceivedExertionMismatch: boolean | null;
  daysFromLastIntervalSession: number | null;
  daysFromLastThresholdSession: number | null;
  aerobicDensity72h: number | null;  // hours of aerobic work past 72h
  anaerobicDensity72h: number | null; // hours of anaerobic work past 72h
  restingHeartRate: number | null;
  hrvRmssd: number | null;
}

export interface CardiometabolicBaselines {
  respiratoryRate: BaselineData | null;
  rhr: BaselineData | null;
}

export function scoreCardiometabolic(
  inputs: CardiometabolicInputs,
  baselines: CardiometabolicBaselines,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Respiratory rate relative to baseline (elevated = stress/illness)
  if (inputs.respiratoryRate != null && baselines.respiratoryRate) {
    const z = normalizeToBaseline(
      inputs.respiratoryRate,
      baselines.respiratoryRate.rollingMean,
      baselines.respiratoryRate.rollingSd,
    );
    const score = invertedZScoreToPercent(z);
    components.push(score);
    weights.push(0.20);
    if (score < 45) limitingFactors.push('Elevated respiratory rate');
  }

  // Recent cardio strain density
  if (inputs.recentCardioStrainTotal != null) {
    // Typical 72h cardio strain: 20-40 moderate, 40+ high
    const score = clamp(100 - inputs.recentCardioStrainTotal * 1.5, 0, 100);
    components.push(score);
    weights.push(0.18);
    if (inputs.recentCardioStrainTotal > 40) limitingFactors.push('High cardio strain density (72h)');
  }

  // High-intensity zone time past 72h
  if (inputs.timeInZone4_5_72h_ms != null) {
    const minutes = inputs.timeInZone4_5_72h_ms / 60000;
    // >60 min in z4-5 over 72h is quite high
    const score = clamp(100 - minutes * 1.2, 0, 100);
    components.push(score);
    weights.push(0.15);
    if (minutes > 45) limitingFactors.push('High zone 4-5 volume past 72h');
  }

  // Subjective breathlessness (inverted)
  if (inputs.subjectiveBreathlessness != null) {
    const score = clamp((6 - inputs.subjectiveBreathlessness) * 20, 0, 100);
    components.push(score);
    weights.push(0.12);
    if (inputs.subjectiveBreathlessness >= 4) limitingFactors.push('Subjective breathlessness');
  }

  // Perceived exertion mismatch (higher effort for same output)
  if (inputs.perceivedExertionMismatch != null) {
    components.push(inputs.perceivedExertionMismatch ? 35 : 80);
    weights.push(0.10);
    if (inputs.perceivedExertionMismatch) limitingFactors.push('Perceived exertion mismatch');
  }

  // Days from last interval session
  if (inputs.daysFromLastIntervalSession != null) {
    let score: number;
    if (inputs.daysFromLastIntervalSession === 0) score = 35;
    else if (inputs.daysFromLastIntervalSession === 1) score = 55;
    else if (inputs.daysFromLastIntervalSession === 2) score = 75;
    else score = 88;
    components.push(score);
    weights.push(0.10);
  }

  // Aerobic density
  if (inputs.aerobicDensity72h != null) {
    const score = clamp(100 - inputs.aerobicDensity72h * 8, 0, 100);
    components.push(score);
    weights.push(0.08);
    if (inputs.aerobicDensity72h > 6) limitingFactors.push('High aerobic volume past 72h');
  }

  // RHR check
  if (inputs.restingHeartRate != null && baselines.rhr) {
    const z = normalizeToBaseline(inputs.restingHeartRate, baselines.rhr.rollingMean, baselines.rhr.rollingSd);
    const score = invertedZScoreToPercent(z);
    components.push(score);
    weights.push(0.07);
  }

  const finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50;

  return {
    key: 'cardiometabolic',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      respiratoryRate: inputs.respiratoryRate,
      recentCardioStrainTotal: inputs.recentCardioStrainTotal,
      timeInZone4_5_72h_ms: inputs.timeInZone4_5_72h_ms,
      subjectiveBreathlessness: inputs.subjectiveBreathlessness,
      perceivedExertionMismatch: inputs.perceivedExertionMismatch,
    },
    limitingFactors,
  };
}
