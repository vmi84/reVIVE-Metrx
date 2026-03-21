/**
 * Training Compatibility (Expanded — 39 modalities)
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
import type { AthleteModeConfig } from '../types/athlete-mode';
import { TIER_THRESHOLDS } from '../utils/constants';

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

/**
 * @param athleteMode - Optional athlete mode config for competitive threshold shifts
 */
export function getTrainingCompatibility(
  iaciScore: number,
  phenotypeKey: PhenotypeKey,
  scores: SubsystemScores,
  athleteMode?: AthleteModeConfig | null,
): TrainingCompatibility {
  const thresholds = athleteMode?.tierThresholds ?? {
    perform: TIER_THRESHOLDS.perform,
    train: TIER_THRESHOLDS.train,
    maintain: TIER_THRESHOLDS.maintain,
    recover: TIER_THRESHOLDS.recover,
    protect: 0,
  };
  let base = getBasePermissions(iaciScore, thresholds);

  // Apply phenotype overrides FIRST
  let result = applyPhenotypeOverrides(base, phenotypeKey, scores);

  // Competitive mode: upgrade caution/avoid → allowed for performance modalities AFTER phenotype
  // This ensures competitive athletes aren't unnecessarily restricted by phenotype downgrades
  if (athleteMode?.upgradePerformancePermissions) {
    const performanceKeys: TrainingModalityKey[] = [
      'intervals', 'tempo', 'strengthHeavy', 'strengthLight', 'plyometrics',
      'zone2', 'agtAlactic', 'agtAerobic',
    ];
    for (const key of performanceKeys) {
      if (result[key] === 'caution') {
        result = { ...result, [key]: 'allowed' };
      } else if (result[key] === 'avoid') {
        result = { ...result, [key]: 'caution' };
      }
    }
  }

  return result;
}

interface TierThresholds {
  perform: number;
  train: number;
  maintain: number;
  recover: number;
  protect: number;
}

function getBasePermissions(iaciScore: number, t?: TierThresholds): TrainingCompatibility {
  const thresholds = t ?? { perform: 85, train: 70, maintain: 55, recover: 35, protect: 0 };

  // Perform tier: Nearly everything open
  if (iaciScore >= thresholds.perform) {
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
      // Neurological recovery
      redLightTherapy: R, neurofeedback: A, pemfTherapy: R,
      vestibularRehab: A, cognitiveRest: R, gentleNeckMobility: R, eyeTrackingDrills: A,
    });
  }

  // Train tier
  if (iaciScore >= thresholds.train) {
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
      redLightTherapy: R, neurofeedback: A, pemfTherapy: R,
      vestibularRehab: A, cognitiveRest: R, gentleNeckMobility: R, eyeTrackingDrills: A,
    });
  }

  // Maintain tier
  if (iaciScore >= thresholds.maintain) {
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
      redLightTherapy: R, neurofeedback: A, pemfTherapy: R,
      vestibularRehab: A, cognitiveRest: R, gentleNeckMobility: R, eyeTrackingDrills: A,
    });
  }

  // Recover tier
  if (iaciScore >= thresholds.recover) {
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
      redLightTherapy: R, neurofeedback: C, pemfTherapy: R,
      vestibularRehab: C, cognitiveRest: R, gentleNeckMobility: A, eyeTrackingDrills: C,
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
    redLightTherapy: R, neurofeedback: X, pemfTherapy: R,
    vestibularRehab: X, cognitiveRest: R, gentleNeckMobility: A, eyeTrackingDrills: X,
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
    case 'neurologically_compromised': {
      // Check if concussion protocol is active (score capped at 25)
      const isConcussion = scores.neurological.score <= 25;

      if (isConcussion) {
        // Concussion: ALL modalities avoid except walking (caution), meditation, breathwork
        for (const key of Object.keys(result) as TrainingModalityKey[]) {
          result[key] = X;
        }
        result.walkingRecovery = C;
        result.meditation = A;
        result.breathworkActive = A;
        result.cognitiveRest = R;
        result.redLightTherapy = A;
        result.pemfTherapy = A;
        result.gentleNeckMobility = C;
      } else {
        // Neurological impairment without concussion — restrict impact/balance-risk
        result.intervals = X;
        result.strengthHeavy = X;
        result.plyometrics = X;
        result.agtAlactic = X;
        result.tempo = X;
        result.techniqueDrill = C;
        result.hiking = C;
        result.yoga = C;
        result.swimEasy = C; // drowning risk if dizzy
        result.easyCycling = C; // fall risk
        result.coldExposure = X;
        result.sauna = C;
        // Safe activities
        result.walkingRecovery = R;
        result.meditation = R;
        result.breathworkActive = R;
        result.mobilityFlow = A;
        result.taiChi = A;
        result.massage = R;
        result.cognitiveRest = R;
        result.redLightTherapy = R;
        result.pemfTherapy = R;
        result.vestibularRehab = C;
        result.gentleNeckMobility = A;
        result.eyeTrackingDrills = C;
      }
      break;
    }

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
/**
 * @param userEnvironment - User's available training environments (e.g., ['home', 'gym', 'outdoors']).
 * @param athleteSportKeys - Athlete's sport keys for sport-aware weighting (e.g., ['running', 'cycling']).
 *
 * Key design rules:
 *   1. ALWAYS include at least one active aerobic option (walking, cycling, swimming) — even at low IACI
 *   2. Weight recommendations by athlete's sport (runners get aerobic options weighted higher)
 *   3. Active movement always ranks above passive/mind-body (meditation never #1 for IACI > 30)
 *   4. Include Zone 1 low-intensity modalities even though they're technically "performance"
 *   5. Preferred recovery activities from user profile get weighted higher (+15 relevance)
 */
export function getRecoveryTrainingRecommendations(
  compatibility: TrainingCompatibility,
  subsystemScores: SubsystemScores,
  sportRecoveryNeeds: SubsystemKey[] = [],
  maxResults: number = 8,
  userEnvironment?: string[],
  athleteSportKeys?: string[],
  preferredActivities?: string[],
): RankedTrainingModality[] {
  const results: RankedTrainingModality[] = [];
  const envSet = userEnvironment && userEnvironment.length > 0
    ? new Set(userEnvironment.map(e => e.toLowerCase()))
    : null;

  const iaciScore = computeIACIFromScores(subsystemScores);

  // Determine athlete's sport category for weighting
  const isEnduranceAthlete = athleteSportKeys?.some(k =>
    ['running', 'cycling', 'swimming', 'triathlon', 'rowing', 'ultramarathon', 'biathlon', 'xc_skiing'].includes(k),
  ) ?? false;

  // Active aerobic modality keys — always eligible for recovery
  const ACTIVE_AEROBIC_KEYS: TrainingModalityKey[] = [
    'walkingRecovery', 'easyCycling', 'swimEasy', 'zone1', 'agtAerobic', 'mitoZone2', 'hiking',
  ];

  const allKeys = Object.keys(TRAINING_RECOVERY_MAP) as TrainingModalityKey[];

  for (const key of allKeys) {
    const profile = TRAINING_RECOVERY_MAP[key];
    const permission = compatibility[key];

    // Skip avoided modalities (unless it's a basic aerobic that's always safe)
    const isActiveAerobic = ACTIVE_AEROBIC_KEYS.includes(key);
    if (permission === 'avoid' && !isActiveAerobic) continue;

    // Allow low-intensity "performance" modalities (Zone 1, easy cycling, etc.) for recovery
    // Only skip high-intensity performance modalities (intervals, tempo, heavy strength, plyo)
    const HIGH_INTENSITY_KEYS: TrainingModalityKey[] = [
      'intervals', 'tempo', 'strengthHeavy', 'plyometrics',
    ];
    if (profile.isPerformanceModality && HIGH_INTENSITY_KEYS.includes(key)) continue;

    // Filter by user's available environment
    if (envSet && profile.environment.length > 0) {
      const hasAccess = profile.environment.some(
        e => envSet.has(e.toLowerCase()) || e.toLowerCase() === 'anywhere',
      );
      if (!hasAccess) continue;
    }

    // Relaxed IACI floor — active aerobic always allowed (Zone 0-1 for blood flow)
    if (!isActiveAerobic && iaciScore < profile.iaciFloor) continue;

    // Compute relevance score
    const primaryDeficit = avgDeficit(profile.primarySubsystems, subsystemScores);
    const secondaryDeficit = avgDeficit(profile.secondarySubsystems, subsystemScores);
    const sportBonus = profile.primarySubsystems.some(s => sportRecoveryNeeds.includes(s)) ? 10 : 0;
    const permissionBonus = permission === 'recommended' ? 5 : 0;

    // Active movement bonus — prioritize active recovery over passive/mind-body
    const activeBonus = isActiveAerobic ? 15 : 0;

    // Sport-aware bonus — endurance athletes get extra weight on aerobic modalities
    const enduranceBonus = (isEnduranceAthlete && isActiveAerobic) ? 12 : 0;

    // Mind-body demotion — meditation/breathwork should support, not lead (unless very low IACI)
    const mindBodyPenalty = (profile.category === 'mind_body' && iaciScore > 30) ? -10 : 0;

    // User preference matching — maps user-friendly names to modality keys
    const matchesPreference = (pref: string, modalityKey: TrainingModalityKey, modalityLabel: string): boolean => {
      const p = pref.toLowerCase();
      const label = modalityLabel.toLowerCase();
      if (label.includes(p) || p.includes(label)) return true;
      // Explicit mappings for common activity names
      if (p.includes('walk') && modalityKey === 'walkingRecovery') return true;
      if (p.includes('run') && (modalityKey === 'zone1' || modalityKey === 'zone2' || modalityKey === 'agtAerobic' || modalityKey === 'mitoZone2')) return true;
      if ((p.includes('cycling') || p.includes('bike')) && modalityKey === 'easyCycling') return true;
      if (p.includes('swim') && (modalityKey === 'swimEasy' || modalityKey === 'aquaticRecovery')) return true;
      if (p.includes('yoga') && modalityKey === 'yoga') return true;
      if (p.includes('foam') && modalityKey === 'massage') return true;
      if (p.includes('stretch') && modalityKey === 'mobilityFlow') return true;
      if (p.includes('sauna') && modalityKey === 'sauna') return true;
      if (p.includes('cold') && modalityKey === 'coldExposure') return true;
      if (p.includes('breath') && modalityKey === 'breathworkActive') return true;
      if (p.includes('meditat') && modalityKey === 'meditation') return true;
      if ((p.includes('row') || p.includes('erg')) && modalityKey === 'agtAerobic') return true;
      if ((p.includes('ellip') || p.includes('cross train')) && modalityKey === 'easyCycling') return true;
      if (p.includes('hik') && modalityKey === 'hiking') return true;
      if (p.includes('mobility') && modalityKey === 'mobilityFlow') return true;
      if (p.includes('strength') && modalityKey === 'strengthLight') return true;
      if (p.includes('massage') && modalityKey === 'massage') return true;
      return false;
    };

    const hasPrefs = preferredActivities && preferredActivities.length > 0;
    const isPreferred = hasPrefs && preferredActivities!.some(pref => matchesPreference(pref, key, profile.label));

    // Preferred activities get a large boost; non-preferred aerobic get demoted
    // This ensures the user's chosen activities dominate the recommendation list
    let prefBonus = 0;
    if (hasPrefs) {
      if (isPreferred) {
        // Ranked bonus: 1st preference = +25, 2nd = +20, 3rd = +15
        const prefIndex = preferredActivities!.findIndex(pref => matchesPreference(pref, key, profile.label));
        prefBonus = prefIndex === 0 ? 25 : prefIndex === 1 ? 20 : 15;
      } else if (isActiveAerobic) {
        // Non-preferred aerobic activities get demoted (but not removed)
        prefBonus = -15;
      }
    }

    const relevanceScore = primaryDeficit + 0.3 * secondaryDeficit
      + sportBonus + permissionBonus + activeBonus + enduranceBonus + mindBodyPenalty + prefBonus;

    // RPE — for aerobic at avoided permission, force to Zone 0-1
    const effectivePermission = (isActiveAerobic && permission === 'avoid') ? 'caution' as TrainingPermission : permission;
    const rpe = computeRecommendedRPE(iaciScore, profile.isPerformanceModality, profile.category, effectivePermission);

    // Sport-aware label override — if user prefers running and this is an aerobic modality,
    // show "Easy Run" instead of "Walking Recovery", "Z2 Run" instead of "Zone 2" etc.
    let displayLabel = profile.label;
    if (isPreferred && hasPrefs) {
      const matchedPref = preferredActivities!.find(pref => matchesPreference(pref, key, profile.label));
      if (matchedPref) {
        const mp = matchedPref.toLowerCase();
        if (mp.includes('run')) {
          if (key === 'zone1') displayLabel = 'Easy Run (Z1)';
          else if (key === 'zone2') displayLabel = 'Z2 Run (Aerobic)';
          else if (key === 'mitoZone2') displayLabel = 'Long Easy Run (Mito)';
          else if (key === 'agtAerobic') displayLabel = 'Aerobic Run Repeats';
        } else if (mp.includes('cycling') || mp.includes('bike')) {
          if (key === 'easyCycling') displayLabel = 'Easy Spin';
        } else if (mp.includes('swim')) {
          if (key === 'swimEasy') displayLabel = 'Easy Swim';
        } else if (mp.includes('ellip')) {
          if (key === 'easyCycling') displayLabel = 'Elliptical (Easy)';
        } else if (mp.includes('row')) {
          if (key === 'agtAerobic') displayLabel = 'Easy Row';
        }
      }
    }

    results.push({
      key,
      label: displayLabel,
      permission: effectivePermission,
      relevanceScore: Math.round(relevanceScore * 10) / 10,
      primarySubsystems: profile.primarySubsystems,
      secondarySubsystems: profile.secondarySubsystems,
      recoveryFraming: profile.recoveryFraming,
      intensityGuidance: profile.intensityGuidance,
      recommendedRPE: rpe,
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

  // Guarantee: at least one active aerobic option in top 3
  const top = results.slice(0, maxResults);
  const hasAerobicInTop3 = top.slice(0, 3).some(r => ACTIVE_AEROBIC_KEYS.includes(r.key as TrainingModalityKey));
  if (!hasAerobicInTop3) {
    // Find the highest-ranked aerobic option and swap it into position 2
    const aerobicIdx = top.findIndex(r => ACTIVE_AEROBIC_KEYS.includes(r.key as TrainingModalityKey));
    if (aerobicIdx > 2) {
      const [aerobic] = top.splice(aerobicIdx, 1);
      top.splice(1, 0, aerobic); // Insert at position 2 (after #1 pick)
    }
  }

  return top;
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

/**
 * Compute recommended RPE (1-10) based on IACI score and modality type.
 * Higher IACI → higher RPE allowed. Recovery modalities cap lower.
 */
/**
 * Compute recommended RPE (1-10) based on IACI score, modality type, AND permission level.
 * Caution activities are always capped at RPE 1-2.
 * Avoided activities should never appear, but if they do, RPE 1.
 */
function computeRecommendedRPE(
  iaciScore: number,
  isPerformance: boolean,
  category: string,
  permission?: TrainingPermission,
): string {
  // Mind-body and lifestyle categories always low RPE
  if (category === 'mind_body' || category === 'lifestyle') return 'RPE 1-3/10';

  // Permission overrides: caution = very easy, avoid = don't do it
  if (permission === 'avoid') return 'RPE 1/10';
  if (permission === 'caution') return 'RPE 1-2/10';

  // Recommended/allowed: scale by IACI tier
  if (iaciScore >= 85) return isPerformance ? 'RPE 7-9/10' : 'RPE 3-5/10';
  if (iaciScore >= 70) return isPerformance ? 'RPE 6-8/10' : 'RPE 3-5/10';
  if (iaciScore >= 55) return isPerformance ? 'RPE 5-7/10' : 'RPE 2-4/10';
  if (iaciScore >= 35) return 'RPE 2-3/10';
  return 'RPE 1-2/10';
}

/** Quick IACI estimate from subsystem scores (unweighted average) */
function computeIACIFromScores(scores: SubsystemScores): number {
  const keys: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological', 'neurological',
  ];
  const total = keys.reduce((sum, k) => sum + (scores[k]?.score ?? 50), 0);
  return Math.round(total / keys.length);
}
