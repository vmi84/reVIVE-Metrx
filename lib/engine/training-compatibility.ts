/**
 * Training Compatibility
 *
 * Determines which training types are recommended, allowed, cautioned, or avoided
 * based on IACI score, phenotype, and subsystem states.
 */

import {
  SubsystemScores,
  PhenotypeKey,
  TrainingCompatibility,
  TrainingPermission,
} from '../types/iaci';

export function getTrainingCompatibility(
  iaciScore: number,
  phenotypeKey: PhenotypeKey,
  scores: SubsystemScores,
): TrainingCompatibility {
  // Base permissions from IACI tier
  const base = getBasePermissions(iaciScore);

  // Phenotype-specific overrides
  return applyPhenotypeOverrides(base, phenotypeKey, scores);
}

function getBasePermissions(iaciScore: number): TrainingCompatibility {
  if (iaciScore >= 85) {
    return {
      zone1: 'recommended',
      zone2: 'recommended',
      intervals: 'recommended',
      tempo: 'recommended',
      strengthHeavy: 'allowed',
      strengthLight: 'recommended',
      techniqueDrill: 'recommended',
      plyometrics: 'allowed',
    };
  }
  if (iaciScore >= 70) {
    return {
      zone1: 'recommended',
      zone2: 'recommended',
      intervals: 'allowed',
      tempo: 'allowed',
      strengthHeavy: 'caution',
      strengthLight: 'allowed',
      techniqueDrill: 'recommended',
      plyometrics: 'caution',
    };
  }
  if (iaciScore >= 55) {
    return {
      zone1: 'recommended',
      zone2: 'allowed',
      intervals: 'caution',
      tempo: 'caution',
      strengthHeavy: 'avoid',
      strengthLight: 'caution',
      techniqueDrill: 'allowed',
      plyometrics: 'avoid',
    };
  }
  if (iaciScore >= 35) {
    return {
      zone1: 'allowed',
      zone2: 'caution',
      intervals: 'avoid',
      tempo: 'avoid',
      strengthHeavy: 'avoid',
      strengthLight: 'avoid',
      techniqueDrill: 'caution',
      plyometrics: 'avoid',
    };
  }
  // Protect tier
  return {
    zone1: 'caution',
    zone2: 'avoid',
    intervals: 'avoid',
    tempo: 'avoid',
    strengthHeavy: 'avoid',
    strengthLight: 'avoid',
    techniqueDrill: 'avoid',
    plyometrics: 'avoid',
  };
}

function applyPhenotypeOverrides(
  base: TrainingCompatibility,
  phenotypeKey: PhenotypeKey,
  scores: SubsystemScores,
): TrainingCompatibility {
  const result = { ...base };

  switch (phenotypeKey) {
    case 'locally_fatigued':
      // Musculoskeletal limited — adjust based on which regions
      if (scores.musculoskeletal.score < 45) {
        result.strengthHeavy = 'avoid';
        result.plyometrics = 'avoid';
      }
      // Aerobic work is fine if cardio is okay
      if (scores.cardiometabolic.score > 65) {
        result.zone2 = upgrade(result.zone2);
      }
      break;

    case 'centrally_suppressed':
      // No complex coordination
      result.intervals = 'avoid';
      result.tempo = 'avoid';
      result.plyometrics = 'avoid';
      result.techniqueDrill = 'caution';
      break;

    case 'sleep_driven_suppression':
      // Reduce cognitive load
      result.intervals = 'avoid';
      result.techniqueDrill = 'caution';
      break;

    case 'under_fueled':
      // No high-glycolytic work
      result.intervals = 'avoid';
      result.tempo = 'caution';
      break;

    case 'illness_risk':
      // Everything restricted
      result.zone1 = 'caution';
      result.zone2 = 'avoid';
      result.intervals = 'avoid';
      result.tempo = 'avoid';
      result.strengthHeavy = 'avoid';
      result.strengthLight = 'avoid';
      result.techniqueDrill = 'avoid';
      result.plyometrics = 'avoid';
      break;
  }

  return result;
}

function upgrade(permission: TrainingPermission): TrainingPermission {
  switch (permission) {
    case 'avoid': return 'caution';
    case 'caution': return 'allowed';
    case 'allowed': return 'recommended';
    case 'recommended': return 'recommended';
  }
}
