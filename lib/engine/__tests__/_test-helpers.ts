/**
 * Shared test helpers for engine tests.
 */
import { SubsystemScores, SubsystemKey, SubsystemBand } from '../../types/iaci';
import { LoadCapacityResult, SubsystemStressFactor } from '../../types/load-capacity';

export function makeSubsystemScore(key: SubsystemKey, score: number, limitingFactors: string[] = []) {
  const band: SubsystemBand =
    score >= 85 ? 'highly_recovered' :
    score >= 70 ? 'trainable' :
    score >= 55 ? 'limited' :
    score >= 40 ? 'compromised' : 'impaired';

  return { key, score, band, inputs: {}, limitingFactors };
}

export function makeSubsystemScores(overrides: Partial<Record<SubsystemKey, number>> = {}): SubsystemScores {
  const defaults: Record<SubsystemKey, number> = {
    autonomic: 75,
    musculoskeletal: 75,
    cardiometabolic: 75,
    sleep: 75,
    metabolic: 75,
    psychological: 75,
  };
  const merged = { ...defaults, ...overrides };
  return Object.fromEntries(
    Object.entries(merged).map(([k, v]) => [k, makeSubsystemScore(k as SubsystemKey, v)])
  ) as SubsystemScores;
}

export function makeLoadCapacityInputs(overrides: Record<string, any> = {}) {
  return {
    iaciScore: 75,
    readinessTier: 'train' as const,
    subsystemScores: makeSubsystemScores(),
    phenotype: { key: 'fully_recovered' as const, label: 'Fully Recovered', description: '', primaryLimiters: [] },
    whoopRecoveryScore: null,
    whoopSleepScore: null,
    whoopStrain: null,
    strainHistory7d: [10, 10, 10, 10, 10, 10, 10],
    cumulativeStrain7d: 70,
    peakStrainLast3d: 12,
    acwr: null,
    sorenessMap: {},
    stiffness: 1,
    heavyLegs: false,
    painLocations: [],
    ...overrides,
  };
}

export function makeStressFactor(subsystem: SubsystemKey, totalStress: number): SubsystemStressFactor {
  return {
    subsystem,
    baseStress: totalStress,
    modifiers: 0,
    totalStress,
    keyDrivers: [],
  };
}

export function makeMockLoadCapacity(overrides: Partial<LoadCapacityResult> = {}): LoadCapacityResult {
  const subsystemStress = {
    autonomic: makeStressFactor('autonomic', 25),
    musculoskeletal: makeStressFactor('musculoskeletal', 25),
    cardiometabolic: makeStressFactor('cardiometabolic', 25),
    sleep: makeStressFactor('sleep', 25),
    metabolic: makeStressFactor('metabolic', 25),
    psychological: makeStressFactor('psychological', 25),
  };

  return {
    subsystemStress,
    subsystemRanking: ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological'],
    systemicStress: 25,
    stressLevel: 'low',
    systemicCapacity: 75,
    capacityBand: 'high',
    statusSummary: {
      stressLevel: 'low',
      headline: 'Low Systemic Stress',
      description: '',
      limitingFactors: [],
      subsystemHighlights: [],
    },
    areaCapacity: {
      quads: { region: 'quads', soreness: 0, loadable: true, maxIntensity: 'full', rationale: '' },
      hamstrings: { region: 'hamstrings', soreness: 0, loadable: true, maxIntensity: 'full', rationale: '' },
    },
    workoutFocus: 'fitness_building',
    focusRationale: '',
    avoidAreas: [],
    preferAreas: ['quads', 'hamstrings'],
    suggestedWorkoutTypes: [],
    avoidWorkoutTypes: [],
    ...overrides,
  };
}
