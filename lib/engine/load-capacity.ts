/**
 * Systemic Load Stress Capacity Engine
 *
 * Bottom-up calculation: each subsystem contributes a stress factor (0-100),
 * which are combined into a systemic stress score. The ranked subsystem
 * stresses drive the status summary and workout focus recommendation.
 */

import { SubsystemKey, SubsystemScores } from '../types/iaci';
import {
  LoadCapacityInputs,
  LoadCapacityResult,
  SubsystemStressFactor,
  SubsystemHighlight,
  SystemStatusSummary,
  AreaCapacity,
  AreaIntensity,
  WorkoutFocus,
  StressLevel,
} from '../types/load-capacity';
import { DEFAULT_WEIGHTS } from '../types/iaci';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUBSYSTEM_KEYS: SubsystemKey[] = [
  'autonomic', 'musculoskeletal', 'cardiometabolic',
  'sleep', 'metabolic', 'psychological',
];

const LOWER_BODY_REGIONS = [
  'quads', 'hamstrings', 'calves', 'glutes', 'hips', 'knees', 'ankles', 'legs',
];

// ---------------------------------------------------------------------------
// Step 1: Per-Subsystem Stress Factors
// ---------------------------------------------------------------------------

function computeSubsystemStress(
  inputs: LoadCapacityInputs,
): Record<SubsystemKey, SubsystemStressFactor> {
  const result = {} as Record<SubsystemKey, SubsystemStressFactor>;

  for (const key of SUBSYSTEM_KEYS) {
    const score = inputs.subsystemScores[key].score;
    const baseStress = Math.max(0, 100 - score);
    let modifiers = 0;
    const keyDrivers: string[] = [];

    // Pull limiting factors from existing subsystem scoring
    const limitingFactors = inputs.subsystemScores[key].limitingFactors;
    if (limitingFactors.length > 0) {
      keyDrivers.push(...limitingFactors.slice(0, 2));
    }

    switch (key) {
      case 'autonomic': {
        if (inputs.whoopRecoveryScore != null) {
          if (inputs.whoopRecoveryScore < 33) {
            modifiers += 10;
            keyDrivers.push(`Whoop recovery very low (${inputs.whoopRecoveryScore}%)`);
          } else if (inputs.whoopRecoveryScore < 50) {
            modifiers += 5;
            keyDrivers.push(`Whoop recovery below average (${inputs.whoopRecoveryScore}%)`);
          }
        }
        if (inputs.peakStrainLast3d > 15) {
          modifiers += 5;
          keyDrivers.push(`High peak strain last 3 days (${inputs.peakStrainLast3d.toFixed(1)})`);
        }
        break;
      }
      case 'musculoskeletal': {
        const sorenessValues = Object.values(inputs.sorenessMap);
        const maxSoreness = sorenessValues.length > 0 ? Math.max(...sorenessValues) : 0;
        if (maxSoreness >= 3) {
          modifiers += 10;
          const soreRegions = Object.entries(inputs.sorenessMap)
            .filter(([, v]) => v >= 3)
            .map(([k]) => k);
          keyDrivers.push(`Significant soreness: ${soreRegions.join(', ')}`);
        }
        if (inputs.heavyLegs) {
          modifiers += 5;
          keyDrivers.push('Heavy legs reported');
        }
        if (inputs.painLocations.length > 0) {
          modifiers += 15;
          keyDrivers.push(`Pain: ${inputs.painLocations.join(', ')}`);
        }
        break;
      }
      case 'cardiometabolic': {
        if (inputs.acwr != null && inputs.acwr > 1.3) {
          modifiers += 10;
          keyDrivers.push(`ACWR elevated (${inputs.acwr.toFixed(2)})`);
        }
        // Weekly strain overload
        if (inputs.cumulativeStrain7d > 100) {
          modifiers += 5;
          keyDrivers.push(`High weekly strain (${inputs.cumulativeStrain7d.toFixed(0)})`);
        }
        break;
      }
      case 'sleep': {
        if (inputs.whoopSleepScore != null) {
          if (inputs.whoopSleepScore < 50) {
            modifiers += 10;
            keyDrivers.push(`Sleep performance poor (${inputs.whoopSleepScore}%)`);
          } else if (inputs.whoopSleepScore < 70) {
            modifiers += 5;
            keyDrivers.push(`Sleep performance below target (${inputs.whoopSleepScore}%)`);
          }
        }
        break;
      }
      // metabolic and psychological: no additional Whoop/load modifiers
      default:
        break;
    }

    result[key] = {
      subsystem: key,
      baseStress,
      modifiers,
      totalStress: Math.min(baseStress + modifiers, 100),
      keyDrivers,
    };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Step 2: Systemic Stress Score
// ---------------------------------------------------------------------------

function computeSystemicStress(
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>,
): number {
  // Weighted average using IACI weights
  let weighted = 0;
  for (const key of SUBSYSTEM_KEYS) {
    const w = DEFAULT_WEIGHTS[key];
    weighted += subsystemStress[key].totalStress * w;
  }

  // Cross-system amplifiers
  const highStressCount = SUBSYSTEM_KEYS.filter(
    k => subsystemStress[k].totalStress > 60,
  ).length;

  if (highStressCount >= 3) {
    weighted += 10;
  } else if (highStressCount >= 2) {
    weighted += 5;
  }

  const anyVeryHigh = SUBSYSTEM_KEYS.some(
    k => subsystemStress[k].totalStress > 80,
  );
  if (anyVeryHigh) {
    weighted += 3;
  }

  return Math.min(Math.round(weighted), 100);
}

// ---------------------------------------------------------------------------
// Step 3: Rank Subsystems
// ---------------------------------------------------------------------------

function rankSubsystems(
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>,
): SubsystemKey[] {
  return [...SUBSYSTEM_KEYS].sort(
    (a, b) => subsystemStress[b].totalStress - subsystemStress[a].totalStress,
  );
}

// ---------------------------------------------------------------------------
// Step 4: System Status Summary
// ---------------------------------------------------------------------------

function getStressStatus(stressFactor: number): SubsystemHighlight['status'] {
  if (stressFactor > 60) return 'compromised';
  if (stressFactor > 40) return 'limited';
  if (stressFactor > 20) return 'adequate';
  return 'strong';
}

const SUBSYSTEM_LABELS: Record<SubsystemKey, string> = {
  autonomic: 'Autonomic',
  musculoskeletal: 'Musculoskeletal',
  cardiometabolic: 'Cardiometabolic',
  sleep: 'Sleep/Circadian',
  metabolic: 'Metabolic',
  psychological: 'Psychological',
};

function generateStatusSummary(
  systemicStress: number,
  stressLevel: StressLevel,
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>,
  ranking: SubsystemKey[],
): SystemStatusSummary {
  // Build per-subsystem highlights (ordered most → least stressed)
  const subsystemHighlights: SubsystemHighlight[] = ranking.map(key => {
    const sf = subsystemStress[key];
    const status = getStressStatus(sf.totalStress);
    const driverText = sf.keyDrivers.length > 0
      ? sf.keyDrivers[0]
      : `Score: ${100 - sf.baseStress}`;
    return {
      subsystem: key,
      stressFactor: sf.totalStress,
      status,
      oneLiner: `${SUBSYSTEM_LABELS[key]}: ${driverText} — ${status}`,
    };
  });

  // Collect limiting factors from top stressed subsystems
  const limitingFactors: string[] = [];
  for (const key of ranking) {
    if (subsystemStress[key].totalStress > 40) {
      limitingFactors.push(...subsystemStress[key].keyDrivers.slice(0, 1));
    }
    if (limitingFactors.length >= 3) break;
  }

  // Headline
  const headlines: Record<StressLevel, string> = {
    low: 'Low Systemic Stress — Optimal for Building Fitness',
    moderate: 'Moderate Systemic Stress — Conditioning Focused',
    high: 'High Systemic Stress — Recovery Focused',
  };

  // Description
  const description = generateDescription(
    stressLevel,
    systemicStress,
    subsystemHighlights,
    ranking,
    subsystemStress,
  );

  return {
    stressLevel,
    headline: headlines[stressLevel],
    description,
    limitingFactors,
    subsystemHighlights,
  };
}

function generateDescription(
  stressLevel: StressLevel,
  systemicStress: number,
  highlights: SubsystemHighlight[],
  ranking: SubsystemKey[],
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>,
): string {
  const top = ranking[0];
  const topLabel = SUBSYSTEM_LABELS[top];
  const topStress = subsystemStress[top].totalStress;
  const topDriver = subsystemStress[top].keyDrivers[0] ?? '';

  const second = ranking[1];
  const secondLabel = SUBSYSTEM_LABELS[second];
  const secondStress = subsystemStress[second].totalStress;

  switch (stressLevel) {
    case 'low':
      return (
        `All systems show low stress levels. ${topLabel} has the highest ` +
        `stress at ${topStress} which is within normal range. ` +
        `You're well-positioned for a fitness-building session targeting any training modality.`
      );
    case 'moderate':
      return (
        `Moderate overall stress, primarily driven by ${topLabel.toLowerCase()} ` +
        `fatigue (stress: ${topStress}). ${topDriver ? topDriver + '. ' : ''}` +
        `${secondLabel} stress is ${secondStress > 40 ? 'also elevated' : 'manageable'} ` +
        `(stress: ${secondStress}). Consider conditioning work that avoids the most stressed systems.`
      );
    case 'high':
      return (
        `High systemic stress across multiple systems. ${topLabel} is ` +
        `compromised (stress: ${topStress}). ${secondLabel} stress is also ` +
        `elevated (stress: ${secondStress}). ` +
        `A structured multi-systemic recovery day is recommended — see your recovery plan below.`
      );
  }
}

// ---------------------------------------------------------------------------
// Step 5: Area Capacity
// ---------------------------------------------------------------------------

function computeAreaCapacity(inputs: LoadCapacityInputs): Record<string, AreaCapacity> {
  const result: Record<string, AreaCapacity> = {};

  // Get all regions from soreness map + body regions constant
  const allRegions = new Set([
    ...Object.keys(inputs.sorenessMap),
    'quads', 'hamstrings', 'calves', 'glutes', 'hips',
    'shoulders', 'core', 'lower_back', 'upper_back', 'chest',
  ]);

  for (const region of allRegions) {
    let soreness = inputs.sorenessMap[region] ?? 0;

    // Heavy legs discount for lower body
    if (inputs.heavyLegs && LOWER_BODY_REGIONS.includes(region)) {
      soreness = Math.min(soreness + 1, 4);
    }

    // Pain override
    if (inputs.painLocations.includes(region)) {
      result[region] = {
        region,
        soreness: 4,
        loadable: false,
        maxIntensity: 'none',
        rationale: `Pain reported in ${region} — avoid all loading`,
      };
      continue;
    }

    let maxIntensity: AreaIntensity;
    let loadable: boolean;
    let rationale: string;

    switch (soreness) {
      case 0:
        maxIntensity = 'full';
        loadable = true;
        rationale = `No soreness — full intensity available`;
        break;
      case 1:
        maxIntensity = 'full';
        loadable = true;
        rationale = `Mild soreness — full intensity OK`;
        break;
      case 2:
        maxIntensity = 'moderate';
        loadable = true;
        rationale = `Moderate soreness — moderate intensity max`;
        break;
      case 3:
        maxIntensity = 'light';
        loadable = false;
        rationale = `Significant soreness — light work only`;
        break;
      default: // 4+
        maxIntensity = 'none';
        loadable = false;
        rationale = `Severe soreness — avoid loading`;
        break;
    }

    result[region] = { region, soreness, loadable, maxIntensity, rationale };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Step 6: Workout Focus
// ---------------------------------------------------------------------------

function determineWorkoutFocus(
  systemicStress: number,
  areaCapacity: Record<string, AreaCapacity>,
  ranking: SubsystemKey[],
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>,
): { focus: WorkoutFocus; rationale: string; avoidAreas: string[]; preferAreas: string[]; suggestedTypes: string[]; avoidTypes: string[] } {
  const severeAreas = Object.values(areaCapacity).filter(a => a.soreness >= 3);
  const clearAreas = Object.values(areaCapacity).filter(a => a.maxIntensity === 'full');
  const avoidAreas = severeAreas.map(a => a.region);
  const preferAreas = clearAreas.map(a => a.region);

  // Most and least stressed subsystems for rationale
  const mostStressed = ranking[0];
  const leastStressed = ranking[ranking.length - 1];
  const mostLabel = SUBSYSTEM_LABELS[mostStressed];
  const leastLabel = SUBSYSTEM_LABELS[leastStressed];
  const mostStressVal = subsystemStress[mostStressed].totalStress;
  const leastStressVal = subsystemStress[leastStressed].totalStress;

  // Recovery only
  if (systemicStress > 55 || severeAreas.length >= 3 || Object.values(areaCapacity).some(a => a.soreness >= 4)) {
    return {
      focus: 'recovery_only',
      rationale: (
        `${mostLabel} stress (${mostStressVal}) is your primary limiter. ` +
        `Multiple systems are fatigued. ` +
        `A structured recovery day is recommended — see your recovery plan below.`
      ),
      avoidAreas,
      preferAreas: [],
      suggestedTypes: ['walking', 'breathing', 'gentle_mobility'],
      avoidTypes: ['intervals', 'tempo', 'heavy_strength', 'plyometrics'],
    };
  }

  // Active recovery
  if (systemicStress >= 30 || severeAreas.length >= 1) {
    const avoidTypes: string[] = ['intervals', 'plyometrics'];
    const suggestedTypes: string[] = ['zone1_cardio', 'zone2_cardio', 'light_strength', 'mobility'];

    // If musculoskeletal is top stressor with lower body, suggest upper body work
    if (mostStressed === 'musculoskeletal' && avoidAreas.some(a => LOWER_BODY_REGIONS.includes(a))) {
      suggestedTypes.push('upper_body_strength');
    }

    return {
      focus: 'active_recovery',
      rationale: (
        `${mostLabel} stress (${mostStressVal}) is your primary limiter. ` +
        `${leastLabel} (${leastStressVal}) is well-recovered. ` +
        `Recommendation: conditioning work on non-impacted areas.`
      ),
      avoidAreas,
      preferAreas,
      suggestedTypes,
      avoidTypes,
    };
  }

  // Fitness building
  return {
    focus: 'fitness_building',
    rationale: (
      `All systems show low stress. ${mostLabel} has the highest stress ` +
      `at ${mostStressVal} which is within normal range. ` +
      `You're cleared for fitness-building work across all modalities.`
    ),
    avoidAreas: [],
    preferAreas,
    suggestedTypes: ['zone2_cardio', 'intervals', 'tempo', 'strength', 'plyometrics', 'technique'],
    avoidTypes: [],
  };
}

// ---------------------------------------------------------------------------
// Main: Compute Load Capacity
// ---------------------------------------------------------------------------

export function computeLoadCapacity(inputs: LoadCapacityInputs): LoadCapacityResult {
  // Step 1: Per-subsystem stress
  const subsystemStress = computeSubsystemStress(inputs);

  // Step 2: Systemic stress
  const systemicStress = computeSystemicStress(subsystemStress);

  // Step 3: Rank
  const subsystemRanking = rankSubsystems(subsystemStress);

  // Stress level classification
  const stressLevel: StressLevel =
    systemicStress < 30 ? 'low' :
    systemicStress <= 55 ? 'moderate' : 'high';

  // Capacity (inverse)
  const systemicCapacity = 100 - systemicStress;
  const capacityBand =
    systemicCapacity >= 70 ? 'high' as const :
    systemicCapacity >= 45 ? 'moderate' as const :
    systemicCapacity >= 20 ? 'low' as const : 'depleted' as const;

  // Step 4: Status summary
  const statusSummary = generateStatusSummary(
    systemicStress,
    stressLevel,
    subsystemStress,
    subsystemRanking,
  );

  // Step 5: Area capacity
  const areaCapacity = computeAreaCapacity(inputs);

  // Step 6: Workout focus
  const {
    focus: workoutFocus,
    rationale: focusRationale,
    avoidAreas,
    preferAreas,
    suggestedTypes: suggestedWorkoutTypes,
    avoidTypes: avoidWorkoutTypes,
  } = determineWorkoutFocus(systemicStress, areaCapacity, subsystemRanking, subsystemStress);

  return {
    subsystemStress,
    subsystemRanking,
    systemicStress,
    stressLevel,
    systemicCapacity,
    capacityBand,
    statusSummary,
    areaCapacity,
    workoutFocus,
    focusRationale,
    avoidAreas,
    preferAreas,
    suggestedWorkoutTypes,
    avoidWorkoutTypes,
  };
}
