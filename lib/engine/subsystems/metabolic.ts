/**
 * Subsystem E: Metabolic / Fueling / Hydration Status
 * "Is the athlete under-fueled, under-hydrated, or adequately supported?"
 *
 * Inputs: Hydration volume, electrolyte intake, low-carb/keto state, meal timing,
 * protein adequacy, carb timing, post-workout fueling, fasting status, GI disruption, body mass change.
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { clamp, weightedAverage } from '../../utils/math';

export interface MetabolicInputs {
  hydrationGlasses: number | null;       // glasses of water yesterday
  electrolytesTaken: boolean | null;
  proteinAdequate: boolean | null;
  fasting: boolean | null;
  giDisruption: number | null;           // 1-5
  lateHeavyMeal: boolean | null;
  bodyMassChangeKg: number | null;       // day-over-day change
  postWorkoutFuelingAdequate: boolean | null;
}

const TARGET_HYDRATION_GLASSES = 10;

export function scoreMetabolic(
  inputs: MetabolicInputs,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Hydration
  if (inputs.hydrationGlasses != null) {
    const ratio = inputs.hydrationGlasses / TARGET_HYDRATION_GLASSES;
    const score = clamp(ratio * 90, 0, 100);
    components.push(score);
    weights.push(0.25);
    if (inputs.hydrationGlasses < 5) limitingFactors.push('Low hydration');
  }

  // Electrolytes
  if (inputs.electrolytesTaken != null) {
    components.push(inputs.electrolytesTaken ? 85 : 55);
    weights.push(0.15);
    if (!inputs.electrolytesTaken) limitingFactors.push('No electrolyte intake');
  }

  // Protein adequacy
  if (inputs.proteinAdequate != null) {
    components.push(inputs.proteinAdequate ? 88 : 45);
    weights.push(0.20);
    if (!inputs.proteinAdequate) limitingFactors.push('Insufficient protein');
  }

  // Fasting state
  if (inputs.fasting != null) {
    components.push(inputs.fasting ? 40 : 80);
    weights.push(0.10);
    if (inputs.fasting) limitingFactors.push('Fasting state');
  }

  // GI disruption (inverted)
  if (inputs.giDisruption != null) {
    const score = clamp((6 - inputs.giDisruption) * 20, 0, 100);
    components.push(score);
    weights.push(0.15);
    if (inputs.giDisruption >= 3) limitingFactors.push('GI disruption');
  }

  // Post-workout fueling
  if (inputs.postWorkoutFuelingAdequate != null) {
    components.push(inputs.postWorkoutFuelingAdequate ? 85 : 50);
    weights.push(0.10);
    if (!inputs.postWorkoutFuelingAdequate) limitingFactors.push('Poor post-workout fueling');
  }

  // Body mass change (significant drop may indicate dehydration)
  if (inputs.bodyMassChangeKg != null) {
    const change = inputs.bodyMassChangeKg;
    let score: number;
    if (Math.abs(change) < 0.5) score = 85;
    else if (change < -1.0) { score = 40; limitingFactors.push('Significant body mass drop'); }
    else if (change < -0.5) score = 65;
    else score = 75; // Slight gain, usually fine
    components.push(score);
    weights.push(0.05);
  }

  const finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50;

  return {
    key: 'metabolic',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      hydrationGlasses: inputs.hydrationGlasses,
      electrolytesTaken: inputs.electrolytesTaken,
      proteinAdequate: inputs.proteinAdequate,
      fasting: inputs.fasting,
      giDisruption: inputs.giDisruption,
    },
    limitingFactors,
  };
}
