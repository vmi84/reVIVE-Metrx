/**
 * IACI (Integrated Athlete Condition Index) type definitions.
 * Covers the full 5-level hierarchy: raw inputs → subsystem scores →
 * composite + penalties → phenotype → protocol prescription.
 */

// --- Level 2: Subsystem Scores ---

export type SubsystemKey =
  | 'autonomic'
  | 'musculoskeletal'
  | 'cardiometabolic'
  | 'sleep'
  | 'metabolic'
  | 'psychological';

export interface SubsystemScore {
  key: SubsystemKey;
  score: number; // 0-100
  band: SubsystemBand;
  inputs: Record<string, number | boolean | null>;
  limitingFactors: string[];
}

export type SubsystemBand =
  | 'highly_recovered'   // 85-100
  | 'trainable'          // 70-84
  | 'limited'            // 55-69
  | 'compromised'        // 40-54
  | 'impaired';          // <40

export type SubsystemScores = Record<SubsystemKey, SubsystemScore>;

// --- Level 3: Composite Index ---

export interface SubsystemWeights {
  autonomic: number;
  musculoskeletal: number;
  cardiometabolic: number;
  sleep: number;
  metabolic: number;
  psychological: number;
}

export const DEFAULT_WEIGHTS: SubsystemWeights = {
  autonomic: 0.25,
  musculoskeletal: 0.20,
  cardiometabolic: 0.15,
  sleep: 0.15,
  metabolic: 0.15,
  psychological: 0.10,
};

export const ENDURANCE_WEIGHTS: SubsystemWeights = {
  autonomic: 0.22,
  musculoskeletal: 0.15,
  cardiometabolic: 0.22,
  sleep: 0.16,
  metabolic: 0.15,
  psychological: 0.10,
};

export const POWER_WEIGHTS: SubsystemWeights = {
  autonomic: 0.22,
  musculoskeletal: 0.25,
  cardiometabolic: 0.12,
  sleep: 0.15,
  metabolic: 0.16,
  psychological: 0.10,
};

export const OLDER_ATHLETE_WEIGHTS: SubsystemWeights = {
  autonomic: 0.28,
  musculoskeletal: 0.17,
  cardiometabolic: 0.13,
  sleep: 0.18,
  metabolic: 0.14,
  psychological: 0.10,
};

// --- Level 3.5: Penalties ---

export interface PenaltyResult {
  name: string;
  points: number;
  reason: string;
  triggeredBy: SubsystemKey[];
}

// --- Level 4: Condition Phenotype ---

export type PhenotypeKey =
  | 'fully_recovered'
  | 'locally_fatigued'
  | 'centrally_suppressed'
  | 'sleep_driven_suppression'
  | 'accumulated_fatigue'
  | 'under_fueled'
  | 'illness_risk';

export interface Phenotype {
  key: PhenotypeKey;
  label: string;
  description: string;
  primaryLimiters: string[];
}

// --- Level 5: Protocol Prescription ---

export type ProtocolClass = 'A' | 'B' | 'C' | 'D' | 'E';

export type ReadinessTier = 'perform' | 'train' | 'maintain' | 'recover' | 'protect';

export interface ProtocolPrescription {
  protocolClass: ProtocolClass;
  readinessTier: ReadinessTier;
  recommendedModalities: string[];
  trainingCompatibility: TrainingCompatibility;
  explanation: string;
}

export interface TrainingCompatibility {
  zone1: TrainingPermission;
  zone2: TrainingPermission;
  intervals: TrainingPermission;
  tempo: TrainingPermission;
  strengthHeavy: TrainingPermission;
  strengthLight: TrainingPermission;
  techniqueDrill: TrainingPermission;
  plyometrics: TrainingPermission;
}

export type TrainingPermission = 'recommended' | 'allowed' | 'caution' | 'avoid';

// --- Full IACI Result ---

export interface IACIResult {
  date: string;
  score: number; // 0-100
  readinessTier: ReadinessTier;
  subsystemScores: SubsystemScores;
  penalties: PenaltyResult[];
  phenotype: Phenotype;
  protocol: ProtocolPrescription;
  baseScore: number; // Before penalties
  dataCompleteness: number; // 0-1
}

// --- Baselines ---

export interface BaselineData {
  metric: string;
  rollingMean: number;
  rollingSd: number;
  sampleCount: number;
  trendSlope: number;
  lastUpdated: string;
}

// --- Helpers ---

export function getSubsystemBand(score: number): SubsystemBand {
  if (score >= 85) return 'highly_recovered';
  if (score >= 70) return 'trainable';
  if (score >= 55) return 'limited';
  if (score >= 40) return 'compromised';
  return 'impaired';
}

export function getReadinessTier(score: number): ReadinessTier {
  if (score >= 85) return 'perform';
  if (score >= 70) return 'train';
  if (score >= 55) return 'maintain';
  if (score >= 35) return 'recover';
  return 'protect';
}

export function getProtocolClass(score: number): ProtocolClass {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'E';
}

export function getTierColor(tier: ReadinessTier): string {
  switch (tier) {
    case 'perform': return '#00C853';
    case 'train': return '#2196F3';
    case 'maintain': return '#FFC107';
    case 'recover': return '#FF9800';
    case 'protect': return '#F44336';
  }
}

export function getTierLabel(tier: ReadinessTier): string {
  switch (tier) {
    case 'perform': return 'Perform';
    case 'train': return 'Train';
    case 'maintain': return 'Maintain';
    case 'recover': return 'Recover';
    case 'protect': return 'Protect';
  }
}

// --- Recovery Bands (6-tier user-facing labels) ---

export type RecoveryBand = 'Optimum' | 'Strong' | 'Moderate' | 'Sufficient' | 'Insufficient' | 'Poor';

export function getRecoveryBand(score: number): RecoveryBand {
  if (score >= 81) return 'Optimum';
  if (score >= 61) return 'Strong';
  if (score >= 41) return 'Moderate';
  if (score >= 21) return 'Sufficient';
  if (score >= 1) return 'Insufficient';
  return 'Poor';
}

export function getRecoveryBandColor(band: RecoveryBand): string {
  switch (band) {
    case 'Optimum': return '#00C853';
    case 'Strong': return '#2196F3';
    case 'Moderate': return '#FFC107';
    case 'Sufficient': return '#FF9800';
    case 'Insufficient': return '#F44336';
    case 'Poor': return '#B71C1C';
  }
}
