/**
 * Penalty Logic (Level 3.5)
 *
 * Detects mismatch states where averaged scores would produce false reassurance.
 * Each penalty subtracts points from the composite score.
 */

import { SubsystemScores, PenaltyResult } from '../types/iaci';
import { PENALTIES } from '../utils/constants';

/**
 * @param scores - Subsystem scores
 * @param penaltyScaling - Multiplier for penalty points (1.0 = full, 0.6 = competitive reduction)
 */
export function computePenalties(scores: SubsystemScores, penaltyScaling: number = 1.0): PenaltyResult[] {
  const penalties: PenaltyResult[] = [];

  const a = scores.autonomic.score;
  const b = scores.musculoskeletal.score;
  const c = scores.cardiometabolic.score;
  const d = scores.sleep.score;
  const e = scores.metabolic.score;
  const f = scores.psychological.score;

  // Autonomic < 40 AND musculoskeletal > 75 → systemic suppression penalty
  if (a < 40 && b > 75) {
    penalties.push({
      name: 'systemic_suppression',
      points: PENALTIES.systemic_suppression,
      reason: 'Autonomic system suppressed despite good musculoskeletal readiness — systemic recovery incomplete',
      triggeredBy: ['autonomic', 'musculoskeletal'],
    });
  }

  // Musculoskeletal < 35 despite okay HRV → tissue-risk penalty
  if (b < 35 && a > 55) {
    penalties.push({
      name: 'tissue_risk',
      points: PENALTIES.tissue_risk,
      reason: 'Musculoskeletal system significantly impaired despite adequate autonomic recovery — tissue risk elevated',
      triggeredBy: ['musculoskeletal', 'autonomic'],
    });
  }

  // Sleep/circadian < 40 for 2+ nights → restoration penalty
  // Note: In production, this checks multi-day history. For single-day, we flag if sleep is very low.
  if (d < 40) {
    penalties.push({
      name: 'restoration_deficit',
      points: PENALTIES.restoration_deficit,
      reason: 'Sleep/circadian restoration critically low — cognitive and recovery capacity significantly reduced',
      triggeredBy: ['sleep'],
    });
  }

  // Metabolic/hydration < 45 with high cardiometabolic demands
  if (e < 45 && c > 60) {
    penalties.push({
      name: 'fueling_risk',
      points: PENALTIES.fueling_risk,
      reason: 'Under-fueled or under-hydrated with planned intensity demands — performance and safety risk',
      triggeredBy: ['metabolic', 'cardiometabolic'],
    });
  }

  // Cardiometabolic < 40 AND respiratory rate elevated (illness/caution)
  if (c < 40) {
    penalties.push({
      name: 'illness_caution',
      points: PENALTIES.illness_caution,
      reason: 'Cardiometabolic readiness critically low — possible illness, overreaching, or abnormal physiology',
      triggeredBy: ['cardiometabolic'],
    });
  }

  // Any 2+ systems < 40 simultaneously → multi-system impairment
  const impaired = [a, b, c, d, e, f].filter(s => s < 40).length;
  if (impaired >= 2) {
    penalties.push({
      name: 'multi_system_impairment',
      points: PENALTIES.multi_system_impairment,
      reason: `${impaired} subsystems simultaneously impaired — compound recovery deficit`,
      triggeredBy: ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological']
        .filter((_, i) => [a, b, c, d, e, f][i] < 40) as any,
    });
  }

  // Apply scaling (competitive athletes get reduced penalties)
  if (penaltyScaling !== 1.0) {
    for (const p of penalties) {
      p.points = Math.round(p.points * penaltyScaling);
    }
  }

  return penalties;
}

export function totalPenaltyPoints(penalties: PenaltyResult[]): number {
  return penalties.reduce((sum, p) => sum + p.points, 0);
}
