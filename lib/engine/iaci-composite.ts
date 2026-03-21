/**
 * IACI Composite Index (Level 3)
 *
 * CRI_base = weighted sum of 7 subsystem scores
 * Final Index = CRI_base - penalties + positive_modifiers
 */

import {
  SubsystemScores,
  SubsystemWeights,
  SubsystemKey,
  DEFAULT_WEIGHTS,
  IACIResult,
  TrendContext,
  getReadinessTier,
  getProtocolClass,
} from '../types/iaci';
import { computePenalties, totalPenaltyPoints } from './penalty-logic';
import { classifyPhenotype } from './phenotype-classifier';
import { prescribeProtocol } from './protocol-engine';
import { identifyDrivers } from './driver-analysis';
import { clamp } from '../utils/math';
import type { AthleteModeConfig } from '../types/athlete-mode';

// ---------------------------------------------------------------------------
// Confidence Scoring
// ---------------------------------------------------------------------------

export function computeConfidence(
  dataCompleteness: number,
  subsystemScores: SubsystemScores,
  baselineAvailable: boolean,
  trendData: TrendContext | null,
): { confidence: number; level: 'high' | 'medium' | 'low'; factors: string[] } {
  let confidence = dataCompleteness;
  const factors: string[] = [];

  // Baseline bonus
  if (baselineAvailable) {
    confidence += 0.10;
    factors.push('21-day baseline available');
  } else {
    factors.push('Missing: personal baseline (need 21+ days)');
  }

  // Trend data bonus
  if (trendData && trendData.daysOfData >= 7) {
    confidence += 0.05;
    factors.push('7-day trend data available');
  } else {
    factors.push('Missing: 7-day trend history');
  }

  // Null-input penalty: count subsystems with all-null inputs
  const keys: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological', 'neurological',
  ];
  const nullSubsystems = keys.filter(k => {
    const inputs = subsystemScores[k].inputs;
    return Object.values(inputs).every(v => v === null || v === undefined);
  });
  if (nullSubsystems.length > 3) {
    confidence -= 0.15;
    factors.push(`${nullSubsystems.length} subsystems using defaults (no input data)`);
  }

  // Check for objective data (wearable-sourced inputs typically populate autonomic/sleep)
  const hasObjective = subsystemScores.autonomic.inputs.hrv != null ||
    subsystemScores.sleep.inputs.sleepDuration != null;
  if (hasObjective) {
    factors.push('Wearable data synced');
  } else {
    confidence -= 0.10;
    factors.push('Missing: wearable data (subjective only)');
  }

  confidence = Math.max(0, Math.min(1, confidence));
  const level = confidence >= 0.75 ? 'high' : confidence >= 0.50 ? 'medium' : 'low';

  return { confidence: Math.round(confidence * 100) / 100, level, factors };
}

/**
 * @param athleteMode - Optional config for competitive athlete threshold/penalty adjustments
 */
/**
 * @param illnessReported - Whether the user reported illness symptoms
 * @param illnessSymptomCount - Number of illness symptoms (0-8)
 */
export function computeIACI(
  date: string,
  subsystemScores: SubsystemScores,
  weights: SubsystemWeights = DEFAULT_WEIGHTS,
  dataCompleteness: number = 1.0,
  sportKeys?: string | string[] | null,
  athleteMode?: AthleteModeConfig | null,
  illnessReported: boolean = false,
  illnessSymptomCount: number = 0,
  illnessSeverityScore: number = 0,
  userEnvironment?: string[],
  preferredActivities?: string[],
  heatIllnessReported: boolean = false,
  heatSymptomCount: number = 0,
  heatHasEmergency: boolean = false,
  crampingReported: boolean = false,
  concussionProtocolActive: boolean = false,
  trendContext?: TrendContext | null,
  baselineAvailable: boolean = false,
): IACIResult {
  // Level 3: Weighted composite
  const baseScore = Math.round(
    subsystemScores.autonomic.score * weights.autonomic +
    subsystemScores.musculoskeletal.score * weights.musculoskeletal +
    subsystemScores.cardiometabolic.score * weights.cardiometabolic +
    subsystemScores.sleep.score * weights.sleep +
    subsystemScores.metabolic.score * weights.metabolic +
    subsystemScores.psychological.score * weights.psychological +
    subsystemScores.neurological.score * weights.neurological,
  );

  // Level 3.5: Penalties (scaled for competitive athletes)
  const penaltyScaling = athleteMode?.penaltyScaling ?? 1.0;
  const penalties = computePenalties(
    subsystemScores, penaltyScaling,
    illnessReported, illnessSymptomCount, illnessSeverityScore,
    heatIllnessReported, heatSymptomCount, heatHasEmergency,
    crampingReported, concussionProtocolActive,
  );
  const penaltyTotal = totalPenaltyPoints(penalties);
  const finalScore = clamp(baseScore - penaltyTotal, 0, 100);

  // Level 4: Phenotype classification
  const phenotype = classifyPhenotype(subsystemScores, penalties);

  // Level 4.5: Confidence scoring + driver analysis
  const trend = trendContext ?? null;
  const { confidence, level: confidenceLevel, factors: confidenceFactors } =
    computeConfidence(dataCompleteness, subsystemScores, baselineAvailable, trend);
  const driverAnalysis = identifyDrivers(subsystemScores, penalties, phenotype);

  // Level 5: Protocol prescription (with trend + confidence + driver permutations)
  const readinessTier = getReadinessTier(finalScore);
  const protocolClass = getProtocolClass(finalScore);
  const protocol = prescribeProtocol(
    finalScore, phenotype, subsystemScores, sportKeys, athleteMode,
    userEnvironment, preferredActivities, trend, confidence, driverAnalysis,
  );

  return {
    date,
    score: finalScore,
    readinessTier,
    subsystemScores,
    penalties,
    phenotype,
    protocol,
    baseScore,
    dataCompleteness,
    confidence,
    confidenceLevel,
    confidenceFactors,
    trendContext: trend,
    driverAnalysis,
  };
}
