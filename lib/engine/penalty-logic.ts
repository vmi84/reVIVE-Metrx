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
/**
 * @param scores - Subsystem scores
 * @param penaltyScaling - Multiplier for penalty points (1.0 = full, 0.6 = competitive reduction)
 * @param illnessReported - Whether the user reported illness symptoms in check-in
 * @param illnessSymptomCount - Number of illness symptoms reported (0-14)
 * @param illnessSeverityScore - Weighted severity (severe=3, moderate=2, mild=1 per symptom)
 */
export function computePenalties(
  scores: SubsystemScores,
  penaltyScaling: number = 1.0,
  illnessReported: boolean = false,
  illnessSymptomCount: number = 0,
  illnessSeverityScore: number = 0,
  heatIllnessReported: boolean = false,
  heatSymptomCount: number = 0,
  heatHasEmergency: boolean = false,
  crampingReported: boolean = false,
  concussionProtocolActive: boolean = false,
): PenaltyResult[] {
  const penalties: PenaltyResult[] = [];

  const a = scores.autonomic.score;
  const b = scores.musculoskeletal.score;
  const c = scores.cardiometabolic.score;
  const d = scores.sleep.score;
  const e = scores.metabolic.score;
  const f = scores.psychological.score;
  const g = scores.neurological.score;

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
  const allScores = [a, b, c, d, e, f, g];
  const allKeys: (keyof SubsystemScores)[] = ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological', 'neurological'];
  const impaired = allScores.filter(s => s < 40).length;
  if (impaired >= 2) {
    penalties.push({
      name: 'multi_system_impairment',
      points: PENALTIES.multi_system_impairment,
      reason: `${impaired} subsystems simultaneously impaired — compound recovery deficit`,
      triggeredBy: allKeys.filter((_, i) => allScores[i] < 40) as any,
    });
  }

  // User-reported illness — applies regardless of subsystem scores
  // Uses weighted severity: severe symptoms (fever, body aches) = 3, moderate = 2, mild = 1
  if (illnessReported && illnessSymptomCount > 0) {
    const severity = illnessSeverityScore > 0 ? illnessSeverityScore : illnessSymptomCount;
    // Severe symptoms (score ≥ 6, e.g., fever + body aches) = full penalty
    // Moderate (score 3-5) = ~75% penalty
    // Mild (score 1-2) = ~50% penalty
    const ratio = Math.min(severity / 8, 1); // normalize to 0-1
    const illnessPoints = Math.max(Math.round(PENALTIES.illness_caution * (0.5 + ratio * 0.5)), 4);

    const hasSevere = severity >= 6;
    const reason = hasSevere
      ? `Severe illness symptoms reported — do NOT train. Focus on rest, hydration, and recovery.`
      : `User reports illness (${illnessSymptomCount} symptom${illnessSymptomCount > 1 ? 's' : ''}) — reduce training load, prioritize recovery.`;

    // Only add if we haven't already triggered illness_caution from cardiometabolic
    if (!penalties.some(p => p.name === 'illness_caution')) {
      penalties.push({
        name: 'illness_caution',
        points: illnessPoints,
        reason,
        triggeredBy: ['cardiometabolic', 'autonomic'],
      });
    }
  }

  // Heat-related illness — cross-cuts autonomic, cardiometabolic, metabolic, psychological
  // Heat stroke (emergency) = maximum penalty, NO scaling (even competitive athletes must stop)
  // Heat exhaustion = significant penalty
  if (heatIllnessReported && heatSymptomCount > 0) {
    if (heatHasEmergency) {
      penalties.push({
        name: 'heat_injury',
        points: PENALTIES.heat_injury, // NOT scaled — this is life-threatening
        reason: 'EMERGENCY: Heat stroke symptoms detected (stopped sweating, confusion, or hot/dry skin). Do NOT train. Seek immediate medical attention.',
        triggeredBy: ['autonomic', 'cardiometabolic', 'metabolic', 'psychological'],
      });
    } else {
      const ratio = Math.min(heatSymptomCount / 5, 1);
      const points = Math.max(Math.round(PENALTIES.heat_injury * (0.5 + ratio * 0.5)), 6);
      penalties.push({
        name: 'heat_injury',
        points,
        reason: `Heat exhaustion symptoms (${heatSymptomCount}) — stop training, cool down, rehydrate aggressively. Resume only when fully recovered.`,
        triggeredBy: ['autonomic', 'cardiometabolic', 'metabolic'],
      });
    }
  }

  // Cramping — signals electrolyte/hydration failure, neuromuscular stress
  if (crampingReported) {
    penalties.push({
      name: 'cramping_dehydration',
      points: PENALTIES.cramping_dehydration,
      reason: 'Muscle cramping reported — indicates electrolyte imbalance or dehydration. Hydrate and supplement before training.',
      triggeredBy: ['musculoskeletal', 'metabolic'],
    });
  }

  // Concussion protocol — life-threatening, NEVER scaled (like heat_injury emergency)
  if (concussionProtocolActive) {
    penalties.push({
      name: 'concussion_protocol',
      points: PENALTIES.concussion_protocol,
      reason: 'CONCUSSION PROTOCOL: Recent head impact with active symptoms. Do NOT train. Consult a healthcare provider before returning to activity.',
      triggeredBy: ['neurological'],
    });
  }

  // Neurological impairment — significant CNS issues without concussion
  if (g < 35 && !concussionProtocolActive) {
    penalties.push({
      name: 'neurological_impairment',
      points: PENALTIES.neurological_impairment,
      reason: 'Significant neurological impairment detected — cognitive fog, coordination issues, or sensory disturbance. Restrict to low-risk, low-complexity activities.',
      triggeredBy: ['neurological'],
    });
  }

  // Apply scaling (competitive athletes get reduced penalties)
  // EXCEPTION: heat_injury emergency and concussion_protocol are NEVER scaled
  if (penaltyScaling !== 1.0) {
    for (const p of penalties) {
      // Heat stroke emergency and concussion protocol are NEVER reduced — life-threatening
      if (p.name === 'heat_injury' && heatHasEmergency) continue;
      if (p.name === 'concussion_protocol') continue;
      p.points = Math.round(p.points * penaltyScaling);
    }
  }

  return penalties;
}

export function totalPenaltyPoints(penalties: PenaltyResult[]): number {
  return penalties.reduce((sum, p) => sum + p.points, 0);
}
