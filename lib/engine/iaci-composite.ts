/**
 * IACI Composite Index (Level 3)
 *
 * CRI_base = weighted sum of 6 subsystem scores
 * Final Index = CRI_base - penalties + positive_modifiers
 */

import {
  SubsystemScores,
  SubsystemWeights,
  DEFAULT_WEIGHTS,
  IACIResult,
  getReadinessTier,
  getProtocolClass,
} from '../types/iaci';
import { computePenalties, totalPenaltyPoints } from './penalty-logic';
import { classifyPhenotype } from './phenotype-classifier';
import { prescribeProtocol } from './protocol-engine';
import { clamp } from '../utils/math';

export function computeIACI(
  date: string,
  subsystemScores: SubsystemScores,
  weights: SubsystemWeights = DEFAULT_WEIGHTS,
  dataCompleteness: number = 1.0,
  sportKeys?: string | string[] | null,
): IACIResult {
  // Level 3: Weighted composite
  const baseScore = Math.round(
    subsystemScores.autonomic.score * weights.autonomic +
    subsystemScores.musculoskeletal.score * weights.musculoskeletal +
    subsystemScores.cardiometabolic.score * weights.cardiometabolic +
    subsystemScores.sleep.score * weights.sleep +
    subsystemScores.metabolic.score * weights.metabolic +
    subsystemScores.psychological.score * weights.psychological,
  );

  // Level 3.5: Penalties
  const penalties = computePenalties(subsystemScores);
  const penaltyTotal = totalPenaltyPoints(penalties);
  const finalScore = clamp(baseScore - penaltyTotal, 0, 100);

  // Level 4: Phenotype classification
  const phenotype = classifyPhenotype(subsystemScores, penalties);

  // Level 5: Protocol prescription
  const readinessTier = getReadinessTier(finalScore);
  const protocolClass = getProtocolClass(finalScore);
  const protocol = prescribeProtocol(finalScore, phenotype, subsystemScores, sportKeys);

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
  };
}
