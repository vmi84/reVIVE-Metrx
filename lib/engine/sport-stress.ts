/**
 * Sport Stress Engine
 *
 * Connects sport profiles to the IACI engine:
 * 1. Derives the correct weight preset from athlete's selected sports
 * 2. Computes sport-specific subsystem adjustments (small penalties/bonuses
 *    based on sport stress markers)
 * 3. Provides recovery need priorities for the ranking algorithm
 */

import { SubsystemKey, SubsystemWeights, SubsystemScores } from '../types/iaci';
import {
  SportProfile,
  StressLevel,
  getSportProfiles,
  deriveWeightPreset,
  getUnionedRecoveryNeeds,
  getAllStressMarkers,
  SportStressMarker,
} from '../../data/sport-profiles';
import { getWeightsForAthlete, AthleteType } from './personalization';

// ---------------------------------------------------------------------------
// Weight derivation from sport profile
// ---------------------------------------------------------------------------

/**
 * Get IACI weights appropriate for the athlete's selected sports.
 * Replaces the old hardcoded `profile?.sport === 'endurance'` check.
 */
export function getWeightsForSportProfile(
  sportKeys: string | string[] | null | undefined,
  customWeights: Partial<SubsystemWeights> | null,
): SubsystemWeights {
  const profiles = getSportProfiles(sportKeys);
  const preset = deriveWeightPreset(profiles);
  return getWeightsForAthlete(preset as AthleteType | null, customWeights);
}

// ---------------------------------------------------------------------------
// Sport stress adjustment
// ---------------------------------------------------------------------------

/** Numeric value of stress levels for computation */
const STRESS_VALUES: Record<StressLevel, number> = {
  very_high: 4,
  high: 3,
  moderate: 2,
  low: 1,
};

/**
 * Compute sport-specific subsystem score adjustments.
 *
 * Sports that heavily stress a subsystem cause a small penalty
 * (1-4 points per subsystem) reflecting the cumulative training
 * load characteristic of that sport. This adjusts the raw subsystem
 * scores before the IACI composite is computed.
 *
 * The adjustment is subtle: it represents the background stress
 * from the sport's training demands, not acute session load
 * (which is captured by Whoop strain and morning check-in).
 */
export function computeSportAdjustments(
  sportKeys: string | string[] | null | undefined,
): Record<SubsystemKey, number> {
  const adjustments: Record<SubsystemKey, number> = {
    autonomic: 0,
    musculoskeletal: 0,
    cardiometabolic: 0,
    sleep: 0,
    metabolic: 0,
    psychological: 0,
    neurological: 0,
  };

  const profiles = getSportProfiles(sportKeys);
  if (profiles.length === 0) return adjustments;

  // Average stress across all selected sports
  const subsystems: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological', 'neurological',
  ];

  for (const sys of subsystems) {
    const avgStress = profiles.reduce(
      (sum, p) => sum + STRESS_VALUES[p.subsystemStress[sys]], 0,
    ) / profiles.length;

    // Only apply penalty for above-moderate stress (>2)
    // Scale: high=1pt penalty, very_high=2pt penalty
    if (avgStress > 2) {
      adjustments[sys] = -Math.round(avgStress - 2);
    }
  }

  return adjustments;
}

/**
 * Apply sport stress adjustments to subsystem scores.
 * Returns a new SubsystemScores object with adjusted scores (clamped 0-100).
 */
export function applySportAdjustments(
  scores: SubsystemScores,
  sportKeys: string | string[] | null | undefined,
): SubsystemScores {
  const adjustments = computeSportAdjustments(sportKeys);
  const adjusted = { ...scores };

  for (const key of Object.keys(adjustments) as SubsystemKey[]) {
    if (adjustments[key] !== 0) {
      const original = scores[key];
      adjusted[key] = {
        ...original,
        score: Math.max(0, Math.min(100, original.score + adjustments[key])),
      };
    }
  }

  return adjusted;
}

// ---------------------------------------------------------------------------
// Recovery need priorities
// ---------------------------------------------------------------------------

/**
 * Get the prioritized recovery needs for the athlete's sport profile.
 * Used by the training recommendation ranking algorithm.
 */
export function getSportRecoveryNeeds(
  sportKeys: string | string[] | null | undefined,
): SubsystemKey[] {
  const profiles = getSportProfiles(sportKeys);
  return getUnionedRecoveryNeeds(profiles);
}

/**
 * Get all sport-specific stress markers for display and tracking.
 */
export function getSportStressMarkers(
  sportKeys: string | string[] | null | undefined,
): SportStressMarker[] {
  const profiles = getSportProfiles(sportKeys);
  return getAllStressMarkers(profiles);
}
