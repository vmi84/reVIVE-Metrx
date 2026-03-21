/**
 * Personalization (Phase 2 stub)
 *
 * Adjusts subsystem weights based on athlete type and response history.
 * Phase 1: Returns preset weights based on athlete profile.
 * Phase 2: Will learn from protocol adherence and next-day IACI changes.
 */

import {
  SubsystemWeights,
  DEFAULT_WEIGHTS,
  ENDURANCE_WEIGHTS,
  POWER_WEIGHTS,
  OLDER_ATHLETE_WEIGHTS,
} from '../types/iaci';

export type AthleteType = 'endurance' | 'power' | 'hybrid' | 'older_athlete';

export function getWeightsForAthlete(
  athleteType: AthleteType | null,
  customWeights: Partial<SubsystemWeights> | null,
): SubsystemWeights {
  // Custom weights override everything
  if (customWeights) {
    return normalizeWeights({
      ...DEFAULT_WEIGHTS,
      ...customWeights,
    });
  }

  // Athlete type presets
  switch (athleteType) {
    case 'endurance': return ENDURANCE_WEIGHTS;
    case 'power': return POWER_WEIGHTS;
    case 'older_athlete': return OLDER_ATHLETE_WEIGHTS;
    default: return DEFAULT_WEIGHTS;
  }
}

function normalizeWeights(weights: SubsystemWeights): SubsystemWeights {
  const total =
    weights.autonomic +
    weights.musculoskeletal +
    weights.cardiometabolic +
    weights.sleep +
    weights.metabolic +
    weights.psychological +
    weights.neurological;

  if (Math.abs(total - 1.0) < 0.001) return weights;

  return {
    autonomic: weights.autonomic / total,
    musculoskeletal: weights.musculoskeletal / total,
    cardiometabolic: weights.cardiometabolic / total,
    sleep: weights.sleep / total,
    metabolic: weights.metabolic / total,
    psychological: weights.psychological / total,
    neurological: weights.neurological / total,
  };
}
