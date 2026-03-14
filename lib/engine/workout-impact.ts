/**
 * Post-Workout Impact Calculator
 *
 * Estimates the subsystem impact and recovery time after a workout
 * is logged, to drive recovery plan generation.
 */

import { SubsystemKey } from '../types/iaci';
import { WorkoutImpactInputs, WorkoutImpactResult } from '../types/load-capacity';

const SUBSYSTEM_KEYS: SubsystemKey[] = [
  'autonomic', 'musculoskeletal', 'cardiometabolic',
  'sleep', 'metabolic', 'psychological',
];

// Workout types that stress specific body areas
const WORKOUT_AREA_MAP: Record<string, string[]> = {
  run: ['quads', 'hamstrings', 'calves', 'glutes', 'hips'],
  cycle: ['quads', 'hamstrings', 'glutes', 'calves'],
  swim: ['shoulders', 'core', 'upper_back'],
  row: ['upper_back', 'shoulders', 'core', 'hamstrings'],
  strength: ['full_body'],
  upper_body: ['shoulders', 'chest', 'upper_back', 'core'],
  lower_body: ['quads', 'hamstrings', 'glutes', 'calves'],
  hike: ['quads', 'hamstrings', 'calves', 'glutes'],
  walk: ['calves', 'hips'],
  intervals: ['quads', 'hamstrings', 'calves', 'glutes'],
  tempo: ['quads', 'hamstrings', 'calves'],
};

// Base recovery hours by workout intensity
function baseRecoveryHours(strain: number | null, rpe: number | null, durationMin: number): number {
  const intensity = strain ?? (rpe != null ? rpe * 2.1 : 10);
  if (intensity > 16) return 48;
  if (intensity > 12) return 36;
  if (intensity > 8) return 24;
  if (intensity > 5) return 18;
  return 12;
}

export function computeWorkoutImpact(inputs: WorkoutImpactInputs): WorkoutImpactResult {
  const { preIACI, preLoadCapacity, workout } = inputs;

  // Estimate intensity factor (0-1 scale)
  const strainNorm = workout.strain != null ? workout.strain / 21 : 0.5;
  const rpeNorm = workout.rpe != null ? workout.rpe / 10 : strainNorm;
  const intensityFactor = Math.max(strainNorm, rpeNorm);
  const durationFactor = Math.min(workout.durationMin / 120, 1.5); // 120min = 1.0

  // Combined load factor
  const loadFactor = intensityFactor * 0.6 + durationFactor * 0.4;

  // Estimate per-subsystem impact (negative = fatigue)
  const impact: Record<SubsystemKey, number> = {
    autonomic: 0,
    musculoskeletal: 0,
    cardiometabolic: 0,
    sleep: 0,
    metabolic: 0,
    psychological: 0,
  };

  // Autonomic: proportional to strain, amplified if already stressed
  const autoStress = preLoadCapacity.subsystemStress.autonomic.totalStress;
  const autoAmplifier = autoStress > 60 ? 1.5 : autoStress > 40 ? 1.2 : 1.0;
  impact.autonomic = Math.round(-loadFactor * 15 * autoAmplifier);

  // Musculoskeletal: based on workout type + areas loaded
  const musculoAmplifier = preLoadCapacity.subsystemStress.musculoskeletal.totalStress > 50 ? 1.4 : 1.0;
  impact.musculoskeletal = Math.round(-loadFactor * 18 * musculoAmplifier);

  // Cardiometabolic: proportional to time in zones 3-5
  const highZoneTime = (workout.hrZones['zone3'] ?? 0) +
    (workout.hrZones['zone4'] ?? 0) +
    (workout.hrZones['zone5'] ?? 0);
  const totalZoneTime = Object.values(workout.hrZones).reduce((a, b) => a + b, 0) || 1;
  const highZoneRatio = highZoneTime / totalZoneTime;
  impact.cardiometabolic = Math.round(-(highZoneRatio * 20 + loadFactor * 8));

  // Sleep: high strain or high stress = predicted sleep disruption
  if (intensityFactor > 0.7) {
    impact.sleep = -5;
  }

  // Metabolic: energy expenditure factor
  impact.metabolic = Math.round(-loadFactor * 8);

  // Psychological: high RPE sessions can cause mental fatigue
  if (rpeNorm > 0.7) {
    impact.psychological = -5;
  }

  // Estimate post-IACI
  let iaciDelta = 0;
  for (const key of SUBSYSTEM_KEYS) {
    const w = key === 'autonomic' ? 0.25 :
              key === 'musculoskeletal' ? 0.20 :
              key === 'cardiometabolic' ? 0.15 :
              key === 'sleep' ? 0.15 :
              key === 'metabolic' ? 0.15 : 0.10;
    iaciDelta += impact[key] * w;
  }
  const estimatedPostIACI = Math.max(0, Math.min(100,
    Math.round(preIACI.score + iaciDelta),
  ));

  // Impacted areas
  const impactedAreas: Record<string, number> = {};
  const workoutAreas = workout.bodyAreasLoaded.length > 0
    ? workout.bodyAreasLoaded
    : WORKOUT_AREA_MAP[workout.type] ?? ['full_body'];

  for (const area of workoutAreas) {
    const currentSoreness = preLoadCapacity.areaCapacity[area]?.soreness ?? 0;
    const sorenessIncrease = Math.round(loadFactor * 1.5);
    impactedAreas[area] = Math.min(currentSoreness + sorenessIncrease, 4);
  }

  // Recovery time
  const systemicHours = baseRecoveryHours(workout.strain, workout.rpe, workout.durationMin);
  const capacityMultiplier = preLoadCapacity.capacityBand === 'depleted' ? 2.0 :
    preLoadCapacity.capacityBand === 'low' ? 1.5 :
    preLoadCapacity.capacityBand === 'moderate' ? 1.2 : 1.0;

  const areaSpecific: Record<string, number> = {};
  for (const [area, soreness] of Object.entries(impactedAreas)) {
    areaSpecific[area] = Math.round(systemicHours * capacityMultiplier * (soreness >= 3 ? 1.3 : 1.0));
  }

  return {
    estimatedSubsystemImpact: impact,
    estimatedPostIACI,
    impactedAreas,
    recoveryTimeEstimate: {
      systemicHours: Math.round(systemicHours * capacityMultiplier),
      areaSpecific,
    },
  };
}
