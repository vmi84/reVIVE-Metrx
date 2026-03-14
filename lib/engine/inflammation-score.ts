/**
 * Inflammation Score
 *
 * Combines wearable-derived proxies, self-reported indicators, and lab results
 * into a composite inflammation estimate (0-100, higher = more inflamed).
 */

import { InflammationScore } from '../types/inflammation';
import { clamp, weightedAverage } from '../utils/math';

export interface InflammationInputs {
  // Wearable proxies
  hrvSuppression: boolean;      // HRV significantly below baseline
  rhrElevation: boolean;        // RHR significantly above baseline
  respiratoryRateElevated: boolean;
  skinTempElevated: boolean;
  sleepDisrupted: boolean;

  // Self-reported
  generalSoreness: number | null; // avg soreness 0-4
  perceivedFatigue: number | null; // 1-5
  giDisruption: number | null;    // 1-5
  illnessSymptoms: string[];

  // Lab results (if available)
  hsCrp: number | null;         // mg/L
  ferritin: number | null;      // ng/mL
  vitaminD: number | null;      // ng/mL
  ck: number | null;            // U/L
}

export function computeInflammationScore(
  inputs: InflammationInputs,
): InflammationScore {
  const components: number[] = [];
  const weights: number[] = [];
  const flags: string[] = [];
  const contributingFactors: string[] = [];

  // Wearable proxy signals
  const proxyCount = [
    inputs.hrvSuppression,
    inputs.rhrElevation,
    inputs.respiratoryRateElevated,
    inputs.skinTempElevated,
    inputs.sleepDisrupted,
  ].filter(Boolean).length;

  const proxyScore = proxyCount * 18; // Each adds ~18 points
  components.push(clamp(proxyScore, 0, 100));
  weights.push(0.35);

  if (inputs.hrvSuppression) { flags.push('HRV suppressed'); contributingFactors.push('Autonomic stress'); }
  if (inputs.rhrElevation) { flags.push('RHR elevated'); contributingFactors.push('Cardiovascular stress'); }
  if (inputs.respiratoryRateElevated) { flags.push('Respiratory rate elevated'); contributingFactors.push('Respiratory stress'); }
  if (inputs.skinTempElevated) { flags.push('Skin temperature elevated'); contributingFactors.push('Thermoregulatory response'); }

  // Self-reported indicators
  if (inputs.generalSoreness != null) {
    components.push(clamp(inputs.generalSoreness * 25, 0, 100));
    weights.push(0.15);
    if (inputs.generalSoreness >= 3) contributingFactors.push('High muscular soreness');
  }

  if (inputs.perceivedFatigue != null) {
    components.push(clamp((inputs.perceivedFatigue - 1) * 25, 0, 100));
    weights.push(0.10);
  }

  if (inputs.giDisruption != null && inputs.giDisruption >= 3) {
    components.push(clamp(inputs.giDisruption * 20, 0, 100));
    weights.push(0.05);
    flags.push('GI disruption');
    contributingFactors.push('Gastrointestinal stress');
  }

  if (inputs.illnessSymptoms.length > 0) {
    components.push(clamp(40 + inputs.illnessSymptoms.length * 15, 0, 100));
    weights.push(0.10);
    flags.push(`Illness symptoms: ${inputs.illnessSymptoms.join(', ')}`);
    contributingFactors.push('Immune activation');
  }

  // Lab markers (if available, these are highest quality)
  if (inputs.hsCrp != null) {
    let labScore: number;
    if (inputs.hsCrp < 1.0) labScore = 10;
    else if (inputs.hsCrp < 3.0) labScore = 40;
    else if (inputs.hsCrp < 10.0) labScore = 70;
    else labScore = 95;
    components.push(labScore);
    weights.push(0.15);
    if (inputs.hsCrp >= 3.0) { flags.push(`hs-CRP elevated (${inputs.hsCrp} mg/L)`); contributingFactors.push('Systemic inflammation marker'); }
  }

  if (inputs.ck != null) {
    let ckScore: number;
    if (inputs.ck < 200) ckScore = 10;
    else if (inputs.ck < 500) ckScore = 35;
    else if (inputs.ck < 1000) ckScore = 60;
    else ckScore = 90;
    components.push(ckScore);
    weights.push(0.05);
    if (inputs.ck >= 500) { flags.push(`CK elevated (${inputs.ck} U/L)`); contributingFactors.push('Muscle damage marker'); }
  }

  if (inputs.vitaminD != null && inputs.vitaminD < 30) {
    components.push(60);
    weights.push(0.05);
    flags.push(`Low Vitamin D (${inputs.vitaminD} ng/mL)`);
    contributingFactors.push('Vitamin D deficiency');
  }

  const score = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 20; // Default low inflammation

  let level: InflammationScore['level'];
  if (score < 25) level = 'low';
  else if (score < 50) level = 'moderate';
  else if (score < 75) level = 'elevated';
  else level = 'high';

  return { score, level, flags, contributingFactors };
}
