/**
 * Systemic Load Stress Capacity types.
 *
 * The systemic stress score is built bottom-up from each subsystem's
 * individual stress factor, then combined into an overall assessment
 * that drives workout focus recommendations and recovery planning.
 */

import { ReadinessTier, SubsystemKey, SubsystemScores, Phenotype } from './iaci';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface LoadCapacityInputs {
  // From IACI engine
  iaciScore: number;
  readinessTier: ReadinessTier;
  subsystemScores: SubsystemScores;
  phenotype: Phenotype;

  // From Whoop (direct integration)
  whoopRecoveryScore: number | null;
  whoopSleepScore: number | null;
  whoopStrain: number | null;

  // Load history
  strainHistory7d: number[];
  cumulativeStrain7d: number;
  peakStrainLast3d: number;
  acwr: number | null;

  // Area-specific DOMS (from subjective check-in)
  sorenessMap: Record<string, number>; // body region → 0-4
  stiffness: number;
  heavyLegs: boolean;
  painLocations: string[];
}

// ---------------------------------------------------------------------------
// Per-Subsystem Stress
// ---------------------------------------------------------------------------

export interface SubsystemStressFactor {
  subsystem: SubsystemKey;
  baseStress: number;       // 100 - subsystemScore
  modifiers: number;        // additional stress from Whoop/load modifiers
  totalStress: number;      // min(baseStress + modifiers, 100)
  keyDrivers: string[];     // human-readable drivers
}

// ---------------------------------------------------------------------------
// System Status Summary
// ---------------------------------------------------------------------------

export type StressLevel = 'low' | 'moderate' | 'high';

export interface SubsystemHighlight {
  subsystem: SubsystemKey;
  stressFactor: number;
  status: 'strong' | 'adequate' | 'limited' | 'compromised';
  oneLiner: string;
}

export interface SystemStatusSummary {
  stressLevel: StressLevel;
  headline: string;
  description: string;
  limitingFactors: string[];
  subsystemHighlights: SubsystemHighlight[];
}

// ---------------------------------------------------------------------------
// Area Capacity
// ---------------------------------------------------------------------------

export type AreaIntensity = 'full' | 'moderate' | 'light' | 'none';

export interface AreaCapacity {
  region: string;
  soreness: number;
  loadable: boolean;
  maxIntensity: AreaIntensity;
  rationale: string;
}

// ---------------------------------------------------------------------------
// Workout Focus
// ---------------------------------------------------------------------------

export type WorkoutFocus = 'fitness_building' | 'active_recovery' | 'recovery_only';

// ---------------------------------------------------------------------------
// Load Capacity Result (full output)
// ---------------------------------------------------------------------------

export interface LoadCapacityResult {
  // Per-subsystem stress factors
  subsystemStress: Record<SubsystemKey, SubsystemStressFactor>;
  subsystemRanking: SubsystemKey[];

  // Overall systemic stress (0-100, higher = more stressed)
  systemicStress: number;
  stressLevel: StressLevel;

  // Remaining absorptive capacity (100 - systemicStress)
  systemicCapacity: number;
  capacityBand: 'high' | 'moderate' | 'low' | 'depleted';

  // Athlete-facing status summary
  statusSummary: SystemStatusSummary;

  // Area-specific capacity
  areaCapacity: Record<string, AreaCapacity>;

  // Workout recommendation
  workoutFocus: WorkoutFocus;
  focusRationale: string;
  avoidAreas: string[];
  preferAreas: string[];
  suggestedWorkoutTypes: string[];
  avoidWorkoutTypes: string[];
}

// ---------------------------------------------------------------------------
// Post-Workout Impact
// ---------------------------------------------------------------------------

export interface WorkoutImpactInputs {
  preIACI: {
    score: number;
    subsystemScores: SubsystemScores;
  };
  preLoadCapacity: LoadCapacityResult;
  workout: {
    type: string;
    durationMin: number;
    strain: number | null;
    rpe: number | null;
    bodyAreasLoaded: string[];
    hrZones: Record<string, number>;
  };
}

export interface WorkoutImpactResult {
  estimatedSubsystemImpact: Record<SubsystemKey, number>;
  estimatedPostIACI: number;
  impactedAreas: Record<string, number>;
  recoveryTimeEstimate: {
    systemicHours: number;
    areaSpecific: Record<string, number>;
  };
}

// ---------------------------------------------------------------------------
// Recovery Plan (post-workout)
// ---------------------------------------------------------------------------

export interface RecoveryPlan {
  workoutDate: string;
  workoutType: string;

  immediate: {
    actions: string[];
    modalities: string[];
    durationMin: number;
  };

  shortTerm: {
    modalities: string[];
    areaFocus: Record<string, string[]>;
    timing: string;
  };

  evening: {
    sleepProtocol: string[];
    avoidances: string[];
    targetSleepHours: number;
  };

  nextDay: {
    expectedFocus: WorkoutFocus;
    criticalAreas: string[];
    preWorkoutModalities: string[];
  };
}

// ---------------------------------------------------------------------------
// Recovery Day Plan (full-day multi-systemic protocol for recovery-only days)
// ---------------------------------------------------------------------------

export interface RecoveryAction {
  protocolSlug: string;
  name: string;
  durationMin: number;
  targetSubsystem: SubsystemKey;
  targetAreas: string[];
  evidenceLevel: string;
  instruction: string;
}

export interface RecoveryBlock {
  timeWindow: string;
  modalities: RecoveryAction[];
  totalMinutes: number;
}

export interface RecoveryDayPlan {
  date: string;
  overallFocus: string;
  limitingSubsystems: SubsystemKey[];

  timeline: {
    morning: RecoveryBlock;
    midMorning: RecoveryBlock;
    afternoon: RecoveryBlock;
    evening: RecoveryBlock;
  };

  nutritionProtocol: {
    hydrationTargetMl: number;
    electrolytes: boolean;
    proteinTimings: string[];
    avoidances: string[];
  };

  sleepProtocol: {
    targetHours: number;
    sleepHygiene: string[];
    preSleepModalities: string[];
  };

  totalEstimatedMinutes: number;
}
