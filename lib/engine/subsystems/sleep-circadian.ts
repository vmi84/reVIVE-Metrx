/**
 * Subsystem D: Sleep / Circadian Restoration
 * "Did the athlete restore adequately overnight?"
 *
 * Inputs: Total sleep time, sleep performance, sleep consistency, sleep onset/wake consistency,
 * awakenings, subjective sleep quality, travel/schedule disruption, late caffeine/alcohol/heavy meal tags.
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { clamp, weightedAverage } from '../../utils/math';

export interface SleepCircadianInputs {
  sleepDurationMs: number | null;
  sleepPerformancePct: number | null;
  sleepConsistencyPct: number | null;
  remSleepMs: number | null;
  deepSleepMs: number | null;
  awakenings: number | null;
  sleepLatencyMs: number | null;
  subjectiveSleepQuality: number | null; // 1-5
  lateCaffeine: boolean | null;
  lateAlcohol: boolean | null;
  lateHeavyMeal: boolean | null;
  isTraveling: boolean | null;
  timezoneChange: number | null;
}

const IDEAL_SLEEP_MS = 8 * 3600000;
const IDEAL_DEEP_PCT = 0.20;
const IDEAL_REM_PCT = 0.25;

export function scoreSleepCircadian(
  inputs: SleepCircadianInputs,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Total sleep time
  if (inputs.sleepDurationMs != null) {
    const hours = inputs.sleepDurationMs / 3600000;
    let score: number;
    if (hours >= 8) score = 95;
    else if (hours >= 7) score = 80;
    else if (hours >= 6) score = 60;
    else if (hours >= 5) score = 40;
    else score = 20;
    components.push(score);
    weights.push(0.25);
    if (hours < 6) limitingFactors.push(`Short sleep (${hours.toFixed(1)}h)`);
  }

  // Sleep performance (Whoop's composite)
  if (inputs.sleepPerformancePct != null) {
    components.push(clamp(inputs.sleepPerformancePct, 0, 100));
    weights.push(0.18);
    if (inputs.sleepPerformancePct < 60) limitingFactors.push('Low sleep performance');
  }

  // Sleep consistency
  if (inputs.sleepConsistencyPct != null) {
    components.push(clamp(inputs.sleepConsistencyPct, 0, 100));
    weights.push(0.10);
    if (inputs.sleepConsistencyPct < 50) limitingFactors.push('Inconsistent sleep schedule');
  }

  // Deep sleep ratio
  if (inputs.deepSleepMs != null && inputs.sleepDurationMs != null && inputs.sleepDurationMs > 0) {
    const deepRatio = inputs.deepSleepMs / inputs.sleepDurationMs;
    const score = clamp((deepRatio / IDEAL_DEEP_PCT) * 80, 0, 100);
    components.push(score);
    weights.push(0.10);
    if (deepRatio < 0.12) limitingFactors.push('Low deep sleep');
  }

  // REM sleep ratio
  if (inputs.remSleepMs != null && inputs.sleepDurationMs != null && inputs.sleepDurationMs > 0) {
    const remRatio = inputs.remSleepMs / inputs.sleepDurationMs;
    const score = clamp((remRatio / IDEAL_REM_PCT) * 80, 0, 100);
    components.push(score);
    weights.push(0.08);
    if (remRatio < 0.15) limitingFactors.push('Low REM sleep');
  }

  // Awakenings
  if (inputs.awakenings != null) {
    const score = clamp(100 - inputs.awakenings * 10, 0, 100);
    components.push(score);
    weights.push(0.07);
    if (inputs.awakenings >= 5) limitingFactors.push('Frequent awakenings');
  }

  // Sleep latency
  if (inputs.sleepLatencyMs != null) {
    const latencyMin = inputs.sleepLatencyMs / 60000;
    let score: number;
    if (latencyMin <= 15) score = 90;
    else if (latencyMin <= 30) score = 70;
    else if (latencyMin <= 45) score = 50;
    else score = 30;
    components.push(score);
    weights.push(0.05);
  }

  // Subjective sleep quality
  if (inputs.subjectiveSleepQuality != null) {
    const score = clamp(inputs.subjectiveSleepQuality * 20, 0, 100);
    components.push(score);
    weights.push(0.07);
    if (inputs.subjectiveSleepQuality <= 2) limitingFactors.push('Poor subjective sleep quality');
  }

  // Disruption flags
  let disruptionPenalty = 0;
  if (inputs.lateCaffeine) { disruptionPenalty += 5; limitingFactors.push('Late caffeine'); }
  if (inputs.lateAlcohol) { disruptionPenalty += 8; limitingFactors.push('Late alcohol'); }
  if (inputs.lateHeavyMeal) { disruptionPenalty += 3; }
  if (inputs.isTraveling) {
    const tzShift = Math.abs(inputs.timezoneChange ?? 0);
    disruptionPenalty += 3 + tzShift * 2;
    if (tzShift > 0) limitingFactors.push(`Travel + ${tzShift}h timezone shift`);
  }

  let finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50;

  finalScore = clamp(finalScore - disruptionPenalty, 0, 100);

  return {
    key: 'sleep',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      sleepDurationMs: inputs.sleepDurationMs,
      sleepPerformancePct: inputs.sleepPerformancePct,
      sleepConsistencyPct: inputs.sleepConsistencyPct,
      deepSleepMs: inputs.deepSleepMs,
      remSleepMs: inputs.remSleepMs,
      awakenings: inputs.awakenings,
      subjectiveSleepQuality: inputs.subjectiveSleepQuality,
      lateCaffeine: inputs.lateCaffeine,
      lateAlcohol: inputs.lateAlcohol,
    },
    limitingFactors,
  };
}
