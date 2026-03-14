/**
 * Phenotype Classifier (Level 4)
 *
 * Rule-based classifier assigns one of 7 condition phenotypes based on
 * subsystem score patterns and penalty states.
 */

import {
  SubsystemScores,
  PenaltyResult,
  Phenotype,
  PhenotypeKey,
} from '../types/iaci';

const PHENOTYPE_DEFS: Record<PhenotypeKey, { label: string; descriptionTemplate: string }> = {
  fully_recovered: {
    label: 'Fully Recovered / High Readiness',
    descriptionTemplate: 'All major systems recovered. Supports high-intensity or high-force work.',
  },
  locally_fatigued: {
    label: 'Systemically Ready, Locally Fatigued',
    descriptionTemplate: 'Autonomic recovery good but musculoskeletal system reduced. Aerobic or split-adjusted work recommended.',
  },
  centrally_suppressed: {
    label: 'Muscularly Ready, Centrally Suppressed',
    descriptionTemplate: 'Soreness minimal but HRV depressed, RHR elevated, or poor sleep. Easy movement only.',
  },
  sleep_driven_suppression: {
    label: 'Sleep-Driven Suppression',
    descriptionTemplate: 'Sleep/circadian restoration critically low driving overall suppression. Lower complexity and moderate load limits.',
  },
  accumulated_fatigue: {
    label: 'Accumulated Training Fatigue',
    descriptionTemplate: 'High strain over recent days with HRV lagging and moderate soreness. Reduced tolerance for intensity.',
  },
  under_fueled: {
    label: 'Under-Fueled / Under-Hydrated',
    descriptionTemplate: 'Metabolic support insufficient — subjective flatness, poor fueling, elevated effort for output. Nutritional recovery priority.',
  },
  illness_risk: {
    label: 'Illness Risk / Abnormal Physiology',
    descriptionTemplate: 'Elevated RHR, depressed HRV, elevated respiratory rate, high fatigue, poor motivation. Recovery-only guidance with symptom screening.',
  },
};

export function classifyPhenotype(
  scores: SubsystemScores,
  penalties: PenaltyResult[],
): Phenotype {
  const a = scores.autonomic.score;
  const b = scores.musculoskeletal.score;
  const c = scores.cardiometabolic.score;
  const d = scores.sleep.score;
  const e = scores.metabolic.score;
  const f = scores.psychological.score;

  const hasPenalty = (name: string) => penalties.some(p => p.name === name);
  const allLimiters = [
    ...scores.autonomic.limitingFactors,
    ...scores.musculoskeletal.limitingFactors,
    ...scores.cardiometabolic.limitingFactors,
    ...scores.sleep.limitingFactors,
    ...scores.metabolic.limitingFactors,
    ...scores.psychological.limitingFactors,
  ];

  // Phenotype 7: Illness Risk (check first — highest priority)
  if (
    (a < 35 && c < 40 && f < 45) ||
    hasPenalty('illness_caution')
  ) {
    return buildPhenotype('illness_risk', allLimiters, scores);
  }

  // Phenotype 4: Sleep-Driven Suppression
  if (d < 40 && a < 60 && b > 50) {
    return buildPhenotype('sleep_driven_suppression', allLimiters, scores);
  }

  // Phenotype 6: Under-Fueled / Under-Hydrated
  if (e < 45 && a > 50 && b > 50) {
    return buildPhenotype('under_fueled', allLimiters, scores);
  }

  // Phenotype 3: Centrally Suppressed
  if (a < 50 && b > 65 && d < 55) {
    return buildPhenotype('centrally_suppressed', allLimiters, scores);
  }

  // Phenotype 2: Locally Fatigued
  if (a > 65 && b < 55) {
    return buildPhenotype('locally_fatigued', allLimiters, scores);
  }

  // Phenotype 5: Accumulated Training Fatigue
  if (a < 60 && b < 60 && c < 65) {
    return buildPhenotype('accumulated_fatigue', allLimiters, scores);
  }

  // Phenotype 1: Fully Recovered
  if (a >= 70 && b >= 70 && c >= 65 && d >= 60 && e >= 55 && f >= 55) {
    return buildPhenotype('fully_recovered', allLimiters, scores);
  }

  // Default to accumulated fatigue if no clear pattern
  return buildPhenotype('accumulated_fatigue', allLimiters, scores);
}

function buildPhenotype(
  key: PhenotypeKey,
  allLimiters: string[],
  scores: SubsystemScores,
): Phenotype {
  const def = PHENOTYPE_DEFS[key];
  const primaryLimiters = findPrimaryLimiters(scores);

  const description = primaryLimiters.length > 0
    ? `${def.descriptionTemplate} Primary limiters: ${primaryLimiters.join(', ')}.`
    : def.descriptionTemplate;

  return {
    key,
    label: def.label,
    description,
    primaryLimiters,
  };
}

function findPrimaryLimiters(scores: SubsystemScores): string[] {
  const all: string[] = [];
  for (const subsystem of Object.values(scores)) {
    if (subsystem.score < 55) {
      all.push(...subsystem.limitingFactors);
    }
  }
  return all.slice(0, 5); // Top 5 limiters
}
