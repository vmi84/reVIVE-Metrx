/**
 * Subsystem B: Musculoskeletal Recovery
 * "Can the athlete absorb load mechanically today?"
 *
 * Inputs: Soreness by region, prior workout type, eccentric load exposure,
 * high-force/ballistic exposure, volume density, lower-body/full-body fatigue carryover,
 * stiffness/pain, subjective "legs feel heavy"/"shoulders cooked".
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { clamp, weightedAverage } from '../../utils/math';

export interface MusculoskeletalInputs {
  soreness: Record<string, number> | null; // region → 0-4
  stiffness: number | null;               // 1-5
  heavyLegs: boolean | null;
  painLocations: string[] | null;
  priorWorkoutType: string | null;
  priorDayStrain: number | null;
  threeDayAvgStrain: number | null;
  daysFromLastStrengthSession: number | null;
  daysFromLastHighIntensity: number | null;
}

export function scoreMusculoskeletal(
  inputs: MusculoskeletalInputs,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Soreness composite (most important)
  if (inputs.soreness != null) {
    const regions = Object.entries(inputs.soreness);
    if (regions.length > 0) {
      const maxSoreness = Math.max(...regions.map(([, v]) => v));
      const avgSoreness = regions.reduce((sum, [, v]) => sum + v, 0) / regions.length;
      const sorenessScore = clamp(100 - (avgSoreness * 15 + maxSoreness * 10), 0, 100);
      components.push(sorenessScore);
      weights.push(0.35);

      if (maxSoreness >= 3) {
        const soreRegions = regions.filter(([, v]) => v >= 3).map(([k]) => k);
        limitingFactors.push(`Significant soreness: ${soreRegions.join(', ')}`);
      }
    }
  }

  // Stiffness (inverted)
  if (inputs.stiffness != null) {
    const score = clamp((6 - inputs.stiffness) * 20, 0, 100);
    components.push(score);
    weights.push(0.15);
    if (inputs.stiffness >= 4) limitingFactors.push('High stiffness');
  }

  // Heavy legs
  if (inputs.heavyLegs != null) {
    components.push(inputs.heavyLegs ? 30 : 85);
    weights.push(0.10);
    if (inputs.heavyLegs) limitingFactors.push('Heavy legs reported');
  }

  // Pain locations
  if (inputs.painLocations != null) {
    const painCount = inputs.painLocations.length;
    const score = painCount === 0 ? 90 : clamp(90 - painCount * 20, 0, 100);
    components.push(score);
    weights.push(0.15);
    if (painCount > 0) limitingFactors.push(`Pain in ${inputs.painLocations.join(', ')}`);
  }

  // Recovery from prior strain
  if (inputs.priorDayStrain != null) {
    // Whoop strain 0-21 scale. 14+ is very high.
    const strainImpact = clamp(100 - inputs.priorDayStrain * 5, 0, 100);
    components.push(strainImpact);
    weights.push(0.10);
    if (inputs.priorDayStrain > 14) limitingFactors.push('Very high prior day strain');
  }

  // Days since last high-load session
  if (inputs.daysFromLastStrengthSession != null) {
    let score: number;
    if (inputs.daysFromLastStrengthSession === 0) score = 40; // Same day
    else if (inputs.daysFromLastStrengthSession === 1) score = 60;
    else if (inputs.daysFromLastStrengthSession === 2) score = 80;
    else score = 90;
    components.push(score);
    weights.push(0.08);
  }

  // Days since high intensity
  if (inputs.daysFromLastHighIntensity != null) {
    let score: number;
    if (inputs.daysFromLastHighIntensity === 0) score = 45;
    else if (inputs.daysFromLastHighIntensity === 1) score = 65;
    else if (inputs.daysFromLastHighIntensity === 2) score = 82;
    else score = 90;
    components.push(score);
    weights.push(0.07);
  }

  const finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50;

  return {
    key: 'musculoskeletal',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      sorenessMax: inputs.soreness ? Math.max(...Object.values(inputs.soreness), 0) : null,
      sorenessAvg: inputs.soreness ? Object.values(inputs.soreness).reduce((a, b) => a + b, 0) / Math.max(Object.values(inputs.soreness).length, 1) : null,
      stiffness: inputs.stiffness,
      heavyLegs: inputs.heavyLegs,
      painLocations: inputs.painLocations ? inputs.painLocations.length : 0,
      priorDayStrain: inputs.priorDayStrain,
    },
    limitingFactors,
  };
}
