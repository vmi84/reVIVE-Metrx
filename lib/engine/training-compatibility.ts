/**
 * Training Compatibility (Expanded — 32 modalities)
 *
 * Determines which training types are recommended, allowed, cautioned, or avoided
 * based on IACI score, phenotype, and subsystem states.
 *
 * Recovery-focused modalities (yoga, walking, breathwork, etc.) remain safe at
 * lower IACI tiers. Performance modalities (intervals, heavy strength, plyos)
 * are restricted as before.
 */

import {
  SubsystemScores,
  SubsystemKey,
  PhenotypeKey,
  TrainingCompatibility,
  TrainingPermission,
  TrainingModalityKey,
  RankedTrainingModality,
} from '../types/iaci';
import { TRAINING_RECOVERY_MAP, TrainingRecoveryProfile } from '../../data/training-recovery-map';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type P = TrainingPermission;
const R: P = 'recommended';
const A: P = 'allowed';
const C: P = 'caution';
const X: P = 'avoid';

function upgrade(permission: TrainingPermission): TrainingPermission {
  switch (permission) {
    case 'avoid': return 'caution';
    case 'caution': return 'allowed';
    case 'allowed': return 'recommended';
    case 'recommended': return 'recommended';
  }
}

function downgrade(permission: TrainingPermission): TrainingPermission {
  switch (permission) {
    case 'recommended': return 'allowed';
    case 'allowed': return 'caution';
    case 'caution': return 'avoid';
    case 'avoid': return 'avoid';
  }
}

/** Build a full TrainingCompatibility from a partial override on top of a base */
function makeCompat(values: Record<TrainingModalityKey, P>): TrainingCompatibility {
  return values;
}

// ---------------------------------------------------------------------------
// Base Permissions by IACI Tier
// ---------------------------------------------------------------------------

export function getTrainingCompatibility(
  iaciScore: number,
  phenotypeKey: PhenotypeKey,
  scores: SubsystemScores,
): TrainingCompatibility {
  const base = getBasePermissions(iaciScore);
  return applyPhenotypeOverrides(base, phenotypeKey, scores);
}

function getBasePermissions(iaciScore: number): TrainingCompatibility {
  // Perform tier (≥85): Nearly everything open
  if (iaciScore >= 85) {
    return makeCompat({
      // Performance
      zone1: R, zone2: R, intervals: R, tempo: R,
      strengthHeavy: A, strengthLight: R, techniqueDrill: R, plyometrics: A,
      // Recovery strength
      eccentricRecovery: R, correctiveExercise: R, kettlebellRecovery: R,
      // Bodyweight
      bodyweightRecovery: R, calisthenicsFlow: R,
      // AGT
      agtAlactic: R, agtAerobic: R,
      // Mitochondrial
      mitoZone2: R,
      // Mind-body
      yoga: R, taiChi: R, breathworkActive: R, meditation: R,
      // Mobility
      mobilityFlow: R,
      // Aquatic & low-impact
      swimEasy: R, aquaticRecovery: R, walkingRecovery: R, easyCycling: R,
      // Lifestyle
      gardening: R, massage: R, dancing: R, hiking: R,
      sauna: R, coldExposure: R, playRecreation: R,
    });
  }

  // Train tier (70-84)
  if (iaciScore >= 70) {
    return makeCompat({
      zone1: R, zone2: R, intervals: A, tempo: A,
      strengthHeavy: C, strengthLight: A, techniqueDrill: R, plyometrics: C,
      eccentricRecovery: R, correctiveExercise: R, kettlebellRecovery: R,
      bodyweightRecovery: R, calisthenicsFlow: R,
      agtAlactic: R, agtAerobic: R,
      mitoZone2: R,
      yoga: R, taiChi: R, breathworkActive: R, meditation: R,
      mobilityFlow: R,
      swimEasy: R, aquaticRecovery: R, walkingRecovery: R, easyCycling: R,
      gardening: R, massage: R, dancing: R, hiking: R,
      sauna: R, coldExposure: A, playRecreation: R,
    });
  }

  // Maintain tier (55-69)
  if (iaciScore >= 55) {
    return makeCompat({
      zone1: R, zone2: A, intervals: C, tempo: C,
      strengthHeavy: X, strengthLight: C, techniqueDrill: A, plyometrics: X,
      eccentricRecovery: R, correctiveExercise: R, kettlebellRecovery: A,
      bodyweightRecovery: R, calisthenicsFlow: A,
      agtAlactic: A, agtAerobic: R,
      mitoZone2: R,
      yoga: R, taiChi: R, breathworkActive: R, meditation: R,
      mobilityFlow: R,
      swimEasy: R, aquaticRecovery: R, walkingRecovery: R, easyCycling: R,
      gardening: R, massage: R, dancing: R, hiking: R,
      sauna: R, coldExposure: A, playRecreation: R,
    });
  }

  // Recover tier (35-54)
  if (iaciScore >= 35) {
    return makeCompat({
      zone1: A, zone2: C, intervals: X, tempo: X,
      strengthHeavy: X, strengthLight: X, techniqueDrill: C, plyometrics: X,
      eccentricRecovery: A, correctiveExercise: A, kettlebellRecovery: C,
      bodyweightRecovery: A, calisthenicsFlow: C,
      agtAlactic: C, agtAerobic: A,
      mitoZone2: R,
      yoga: R, taiChi: R, breathworkActive: R, meditation: R,
      mobilityFlow: R,
      swimEasy: A, aquaticRecovery: R, walkingRecovery: R, easyCycling: A,
      gardening: R, massage: R, dancing: A, hiking: R,
      sauna: A, coldExposure: C, playRecreation: A,
    });
  }

  // Protect tier (<35)
  return makeCompat({
    zone1: C, zone2: X, intervals: X, tempo: X,
    strengthHeavy: X, strengthLight: X, techniqueDrill: X, plyometrics: X,
    eccentricRecovery: C, correctiveExercise: A, kettlebellRecovery: X,
    bodyweightRecovery: C, calisthenicsFlow: X,
    agtAlactic: X, agtAerobic: C,
    mitoZone2: A,
    yoga: R, taiChi: R, breathworkActive: R, meditation: R,
    mobilityFlow: R,
    swimEasy: C, aquaticRecovery: A, walkingRecovery: R, easyCycling: C,
    gardening: A, massage: R, dancing: C, hiking: A,
    sauna: C, coldExposure: X, playRecreation: A,
  });
}

// ---------------------------------------------------------------------------
// Phenotype Overrides
// ---------------------------------------------------------------------------

function applyPhenotypeOverrides(
  base: TrainingCompatibility,
  phenotypeKey: PhenotypeKey,
  scores: SubsystemScores,
): TrainingCompatibility {
  const result = { ...base };

  switch (phenotypeKey) {
    case 'locally_fatigued':
      // Musculoskeletal limited — avoid impact, allow non-impact alternatives
      if (scores.musculoskeletal.score < 45) {
        result.strengthHeavy = X;
        result.plyometrics = X;
        result.eccentricRecovery = C;
        result.kettlebellRecovery = C;
        result.bodyweightRecovery = C;
      }
      // Aerobic work is fine if cardio is okay
      if (scores.cardiometabolic.score > 65) {
        result.zone2 = upgrade(result.zone2);
        result.swimEasy = upgrade(result.swimEasy);
        result.easyCycling = upgrade(result.easyCycling);
      }
      // Aquatic recovery great for local fatigue
      result.aquaticRecovery = upgrade(result.aquaticRecovery);
      break;

    case 'centrally_suppressed':
      // No complex coordination or high-intensity
      result.intervals = X;
      result.tempo = X;
      result.plyometrics = X;
      result.techniqueDrill = C;
      result.agtAlactic = X;
      result.calisthenicsFlow = C;
      // Parasympathetic modalities upgraded
      result.yoga = R;
      result.breathworkActive = R;
      result.taiChi = R;
      result.walkingRecovery = R;
      result.meditation = R;
      break;

    case 'sleep_driven_suppression':
      // Reduce cognitive load, promote sleep-friendly activities
      result.intervals = X;
      result.techniqueDrill = C;
      result.agtAlactic = C;
      // Sleep-promoting activities
      result.yoga = R;
      result.breathworkActive = R;
      result.meditation = R;
      result.walkingRecovery = R;
      result.taiChi = R;
      // Sauna can improve sleep quality
      result.sauna = upgrade(result.sauna);
      break;

    case 'under_fueled':
      // No high-glycolytic work
      result.intervals = X;
      result.tempo = C;
      result.agtAlactic = C;
      result.strengthHeavy = X;
      // Low-energy activities only
      result.walkingRecovery = R;
      result.breathworkActive = R;
      result.yoga = R;
      result.meditation = R;
      result.mitoZone2 = C; // needs fuel to benefit from mito work
      break;

    case 'accumulated_fatigue':
      // Everything heavily restricted
      result.intervals = X;
      result.tempo = X;
      result.strengthHeavy = X;
      result.strengthLight = X;
      result.plyometrics = X;
      result.agtAlactic = X;
      result.kettlebellRecovery = X;
      result.calisthenicsFlow = X;
      result.bodyweightRecovery = C;
      result.eccentricRecovery = C;
      // Only gentle recovery
      result.zone1 = A;
      result.walkingRecovery = R;
      result.yoga = R;
      result.breathworkActive = R;
      result.meditation = R;
      result.taiChi = R;
      result.mobilityFlow = R;
      result.massage = R;
      result.gardening = A;
      result.aquaticRecovery = R;
      break;

    case 'illness_risk':
      // Extreme restriction — only the gentlest modalities
      result.zone1 = C;
      result.zone2 = X;
      result.intervals = X;
      result.tempo = X;
      result.strengthHeavy = X;
      result.strengthLight = X;
      result.techniqueDrill = X;
      result.plyometrics = X;
      result.eccentricRecovery = X;
      result.correctiveExercise = C;
      result.kettlebellRecovery = X;
      result.bodyweightRecovery = X;
      result.calisthenicsFlow = X;
      result.agtAlactic = X;
      result.agtAerobic = X;
      result.mitoZone2 = X;
      result.swimEasy = X;
      result.easyCycling = X;
      result.coldExposure = X; // cold stress contraindicated when immune-compromised
      result.sauna = C;
      result.dancing = X;
      result.hiking = C;
      // Still okay
      result.walkingRecovery = C;
      result.yoga = A;
      result.breathworkActive = A;
      result.meditation = R;
      result.mobilityFlow = C;
      result.massage = A;
      result.aquaticRecovery = C;
      result.gardening = C;
      result.taiChi = A;
      result.playRecreation = C;
      break;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Recovery Training Recommendations (sport-aware ranking)
// ---------------------------------------------------------------------------

/**
 * Rank training modalities by recovery relevance.
 *
 * Algorithm:
 * 1. For each modality with permission 'recommended' or 'allowed':
 *    - relevance = avg(100 - subsystemScore) across primarySubsystems
 *    - + 0.3 × avg(100 - subsystemScore) across secondarySubsystems
 *    - + 10 if modality targets one of the sport's primary recovery needs
 * 2. Filter out 'avoid' modalities
 * 3. Sort descending by relevance
 * 4. Return top N (default 8)
 */
export function getRecoveryTrainingRecommendations(
  compatibility: TrainingCompatibility,
  subsystemScores: SubsystemScores,
  sportRecoveryNeeds: SubsystemKey[] = [],
  maxResults: number = 8,
): RankedTrainingModality[] {
  const results: RankedTrainingModality[] = [];

  const allKeys = Object.keys(TRAINING_RECOVERY_MAP) as TrainingModalityKey[];

  for (const key of allKeys) {
    const profile = TRAINING_RECOVERY_MAP[key];
    const permission = compatibility[key];

    // Skip avoided modalities
    if (permission === 'avoid') continue;

    // Skip performance modalities from recovery recommendations
    if (profile.isPerformanceModality) continue;

    // Check IACI floor
    const iaciScore = computeIACIFromScores(subsystemScores);
    if (iaciScore < profile.iaciFloor) continue;

    // Compute relevance score
    const primaryDeficit = avgDeficit(profile.primarySubsystems, subsystemScores);
    const secondaryDeficit = avgDeficit(profile.secondarySubsystems, subsystemScores);
    const sportBonus = profile.primarySubsystems.some(s => sportRecoveryNeeds.includes(s)) ? 10 : 0;
    const permissionBonus = permission === 'recommended' ? 5 : 0;

    const relevanceScore = primaryDeficit + 0.3 * secondaryDeficit + sportBonus + permissionBonus;

    results.push({
      key,
      label: profile.label,
      permission,
      relevanceScore: Math.round(relevanceScore * 10) / 10,
      primarySubsystems: profile.primarySubsystems,
      secondarySubsystems: profile.secondarySubsystems,
      recoveryFraming: profile.recoveryFraming,
      intensityGuidance: profile.intensityGuidance,
      category: profile.category,
      evidenceLevel: profile.evidenceLevel,
      durationRange: profile.durationRange,
      examples: profile.examples,
    });
  }

  // Sort by relevance (highest first), then by evidence level
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
    const evidenceOrder = { strong: 3, moderate: 2, emerging: 1 };
    return evidenceOrder[b.evidenceLevel] - evidenceOrder[a.evidenceLevel];
  });

  return results.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function avgDeficit(subsystems: SubsystemKey[], scores: SubsystemScores): number {
  if (subsystems.length === 0) return 0;
  const total = subsystems.reduce((sum, key) => {
    return sum + (100 - (scores[key]?.score ?? 50));
  }, 0);
  return total / subsystems.length;
}

/** Quick IACI estimate from subsystem scores (unweighted average) */
function computeIACIFromScores(scores: SubsystemScores): number {
  const keys: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological',
  ];
  const total = keys.reduce((sum, k) => sum + (scores[k]?.score ?? 50), 0);
  return Math.round(total / keys.length);
}
