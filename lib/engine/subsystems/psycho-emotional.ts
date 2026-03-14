/**
 * Subsystem F: Psycho-Emotional / Cognitive Readiness
 * "Is the athlete psychologically ready to absorb training and follow protocol?"
 *
 * Inputs: Motivation, perceived readiness, life stress, mood, mental fatigue,
 * willingness to train, concentration/clarity.
 */

import { SubsystemScore, getSubsystemBand } from '../../types/iaci';
import { clamp, weightedAverage } from '../../utils/math';

export interface PsychoEmotionalInputs {
  motivation: number | null;         // 1-5
  mood: number | null;               // 1-5
  mentalFatigue: number | null;      // 1-5
  willingnessToTrain: number | null; // 1-5
  concentration: number | null;      // 1-5
  subjectiveStress: number | null;   // 1-5 (shared with autonomic)
  overallEnergy: number | null;      // 1-5
}

function scale1to5(value: number): number {
  return clamp(value * 20, 0, 100);
}

function invertScale1to5(value: number): number {
  return clamp((6 - value) * 20, 0, 100);
}

export function scorePsychoEmotional(
  inputs: PsychoEmotionalInputs,
): SubsystemScore {
  const components: number[] = [];
  const weights: number[] = [];
  const limitingFactors: string[] = [];

  // Motivation
  if (inputs.motivation != null) {
    components.push(scale1to5(inputs.motivation));
    weights.push(0.20);
    if (inputs.motivation <= 2) limitingFactors.push('Low motivation');
  }

  // Willingness to train
  if (inputs.willingnessToTrain != null) {
    components.push(scale1to5(inputs.willingnessToTrain));
    weights.push(0.20);
    if (inputs.willingnessToTrain <= 2) limitingFactors.push('Low willingness to train');
  }

  // Mood
  if (inputs.mood != null) {
    components.push(scale1to5(inputs.mood));
    weights.push(0.15);
    if (inputs.mood <= 2) limitingFactors.push('Low mood');
  }

  // Mental fatigue (inverted)
  if (inputs.mentalFatigue != null) {
    components.push(invertScale1to5(inputs.mentalFatigue));
    weights.push(0.15);
    if (inputs.mentalFatigue >= 4) limitingFactors.push('High mental fatigue');
  }

  // Concentration
  if (inputs.concentration != null) {
    components.push(scale1to5(inputs.concentration));
    weights.push(0.10);
    if (inputs.concentration <= 2) limitingFactors.push('Poor concentration');
  }

  // Stress (inverted)
  if (inputs.subjectiveStress != null) {
    components.push(invertScale1to5(inputs.subjectiveStress));
    weights.push(0.10);
    if (inputs.subjectiveStress >= 4) limitingFactors.push('High life stress');
  }

  // Overall energy
  if (inputs.overallEnergy != null) {
    components.push(scale1to5(inputs.overallEnergy));
    weights.push(0.10);
    if (inputs.overallEnergy <= 2) limitingFactors.push('Very low energy');
  }

  const finalScore = components.length > 0
    ? clamp(Math.round(weightedAverage(components, weights)), 0, 100)
    : 50;

  return {
    key: 'psychological',
    score: finalScore,
    band: getSubsystemBand(finalScore),
    inputs: {
      motivation: inputs.motivation,
      mood: inputs.mood,
      mentalFatigue: inputs.mentalFatigue,
      willingnessToTrain: inputs.willingnessToTrain,
      concentration: inputs.concentration,
      subjectiveStress: inputs.subjectiveStress,
      overallEnergy: inputs.overallEnergy,
    },
    limitingFactors,
  };
}
