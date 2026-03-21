/**
 * Subsystem G: Neurological / CNS Recovery
 * "Is the athlete's central nervous system functioning normally?"
 *
 * Monitors cognitive clarity, reaction time, coordination, headache/pressure,
 * dizziness, sensory disturbances, and concussion risk. All inputs are
 * subjective (morning check-in) — future sensor integration (EEG, reaction
 * time devices) will be additive.
 *
 * Concussion override: If recent head impact with active red flag symptoms,
 * score is capped at 25 regardless of other inputs.
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { clamp, weightedAverage } from '../../utils/math';

export interface NeurologicalInputs {
  cognitiveClarity: number | null;       // 1-5 (1=foggy, 5=sharp)
  reactionTimeSharpness: number | null;  // 1-5 (1=sluggish, 5=sharp)
  coordinationBalance: number | null;    // 1-5 (1=unsteady, 5=solid)
  headachePressure: boolean | null;      // any head pressure?
  headacheSeverity: number | null;       // 1-5 if headache present
  dizzinessVertigo: boolean | null;
  numbnessTingling: boolean | null;
  numbnessTinglingLocation: string | null;
  lightNoiseSensitivity: boolean | null;
  recentHeadImpact: boolean | null;      // "Hit your head recently?"
  daysSinceHeadImpact: number | null;    // 0-30
  visualDisturbance: boolean | null;     // blurred/double vision
}

const DEFAULT_SCORE = 65; // Mild baseline CNS fatigue assumed
const CONCUSSION_CAP = 25;

/**
 * Check if concussion protocol should be active.
 * Triggers when: recent head impact AND (within 7 days OR any red flag symptom).
 */
export function isConcussionActive(inputs: NeurologicalInputs): boolean {
  if (!inputs.recentHeadImpact) return false;

  const withinWindow = inputs.daysSinceHeadImpact != null && inputs.daysSinceHeadImpact < 7;
  const hasRedFlag =
    inputs.dizzinessVertigo === true ||
    inputs.visualDisturbance === true ||
    (inputs.headachePressure === true && inputs.headacheSeverity != null && inputs.headacheSeverity >= 3);

  return withinWindow || hasRedFlag;
}

export function scoreNeurological(inputs: NeurologicalInputs): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Cognitive clarity (most important — direct CNS function measure)
  if (inputs.cognitiveClarity != null) {
    const score = clamp(inputs.cognitiveClarity * 20, 0, 100);
    components.push(score);
    weights.push(0.25);
    if (score < 50) limitingFactors.push('Cognitive fog or reduced clarity');
  }

  // Reaction time sharpness
  if (inputs.reactionTimeSharpness != null) {
    const score = clamp(inputs.reactionTimeSharpness * 20, 0, 100);
    components.push(score);
    weights.push(0.20);
    if (score < 50) limitingFactors.push('Sluggish reaction time');
  }

  // Coordination / balance
  if (inputs.coordinationBalance != null) {
    const score = clamp(inputs.coordinationBalance * 20, 0, 100);
    components.push(score);
    weights.push(0.15);
    if (score < 50) limitingFactors.push('Poor coordination or balance');
  }

  // Headache / pressure
  if (inputs.headachePressure != null) {
    let score: number;
    if (!inputs.headachePressure) {
      score = 90;
    } else {
      const severity = inputs.headacheSeverity ?? 2;
      // severity 1→70, 2→55, 3→40, 4→25, 5→10
      score = clamp(85 - severity * 15, 10, 70);
    }
    components.push(score);
    weights.push(0.15);
    if (score < 50) limitingFactors.push('Headache or head pressure');
  }

  // Dizziness / vertigo
  if (inputs.dizzinessVertigo != null) {
    const score = inputs.dizzinessVertigo ? 25 : 90;
    components.push(score);
    weights.push(0.10);
    if (inputs.dizzinessVertigo) limitingFactors.push('Dizziness or vertigo');
  }

  // Light / noise sensitivity
  if (inputs.lightNoiseSensitivity != null) {
    const score = inputs.lightNoiseSensitivity ? 30 : 85;
    components.push(score);
    weights.push(0.05);
    if (inputs.lightNoiseSensitivity) limitingFactors.push('Light or noise sensitivity');
  }

  // Numbness / tingling
  if (inputs.numbnessTingling != null) {
    const score = inputs.numbnessTingling ? 35 : 90;
    components.push(score);
    weights.push(0.05);
    if (inputs.numbnessTingling) limitingFactors.push('Numbness or tingling');
  }

  // Visual disturbance
  if (inputs.visualDisturbance != null) {
    const score = inputs.visualDisturbance ? 15 : 90;
    components.push(score);
    weights.push(0.05);
    if (inputs.visualDisturbance) limitingFactors.push('Visual disturbance');
  }

  let finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : DEFAULT_SCORE;

  // Concussion override — cap score at 25 if concussion protocol active
  if (isConcussionActive(inputs)) {
    finalScore = Math.min(finalScore, CONCUSSION_CAP);
    if (!limitingFactors.includes('Recent head impact — concussion protocol')) {
      limitingFactors.unshift('Recent head impact — concussion protocol');
    }
  }

  return {
    key: 'neurological',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      cognitiveClarity: inputs.cognitiveClarity,
      reactionTimeSharpness: inputs.reactionTimeSharpness,
      coordinationBalance: inputs.coordinationBalance,
      headachePressure: inputs.headachePressure,
      headacheSeverity: inputs.headacheSeverity,
      dizzinessVertigo: inputs.dizzinessVertigo,
      numbnessTingling: inputs.numbnessTingling,
      lightNoiseSensitivity: inputs.lightNoiseSensitivity,
      recentHeadImpact: inputs.recentHeadImpact,
      daysSinceHeadImpact: inputs.daysSinceHeadImpact,
      visualDisturbance: inputs.visualDisturbance,
    },
    limitingFactors,
  };
}
