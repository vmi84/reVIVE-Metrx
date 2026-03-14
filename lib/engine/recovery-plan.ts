/**
 * Post-Workout Recovery Plan Generator
 *
 * Takes workout impact + current state → produces a structured recovery plan
 * with immediate, short-term, evening, and next-day recommendations.
 */

import { SubsystemKey } from '../types/iaci';
import {
  WorkoutImpactResult,
  LoadCapacityResult,
  RecoveryPlan,
  WorkoutFocus,
} from '../types/load-capacity';

// ---------------------------------------------------------------------------
// Modality lookup for area-targeted recovery
// ---------------------------------------------------------------------------

const AREA_MODALITIES: Record<string, { foam: string[]; stretch: string[] }> = {
  quads: {
    foam: ['foam-roll-quads'],
    stretch: ['static-quad-stretch', 'ais-quad-stretch'],
  },
  hamstrings: {
    foam: ['foam-roll-hamstrings'],
    stretch: ['static-hamstring-stretch', 'ais-hamstring-stretch'],
  },
  calves: {
    foam: ['foam-roll-calves'],
    stretch: ['static-calf-stretch'],
  },
  glutes: {
    foam: ['foam-roll-glutes'],
    stretch: ['static-glute-stretch', 'pigeon-stretch'],
  },
  hips: {
    foam: ['foam-roll-hip-flexors'],
    stretch: ['banded-hip-distraction', 'hip-circles'],
  },
  shoulders: {
    foam: ['foam-roll-lats'],
    stretch: ['banded-shoulder-distraction', 'static-shoulder-stretch'],
  },
  upper_back: {
    foam: ['foam-roll-thoracic'],
    stretch: ['cat-cow-breathing', 'thoracic-rotation'],
  },
  lower_back: {
    foam: ['foam-roll-lumbar'],
    stretch: ['static-lower-back-stretch'],
  },
  core: {
    foam: [],
    stretch: ['static-stretching-full-body'],
  },
  chest: {
    foam: [],
    stretch: ['static-pec-stretch'],
  },
};

// Immediate (0-30min) modalities by overall intensity
const IMMEDIATE_MODALITIES: Record<string, string[]> = {
  high: ['contrast-shower', 'walking-recovery', 'gentle-cycling'],
  moderate: ['walking-recovery', 'gentle-cycling'],
  low: ['walking-recovery'],
};

// Sleep protocol modalities
const SLEEP_MODALITIES = [
  'extended-exhale-breathing',
  'legs-on-wall',
  'body-scan-meditation',
  'progressive-muscle-relaxation',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function generateRecoveryPlan(
  workoutDate: string,
  workoutType: string,
  impact: WorkoutImpactResult,
  preLoadCapacity: LoadCapacityResult,
): RecoveryPlan {
  const totalImpact = Math.abs(
    Object.values(impact.estimatedSubsystemImpact).reduce((a, b) => a + b, 0),
  );
  const intensityLevel = totalImpact > 40 ? 'high' : totalImpact > 20 ? 'moderate' : 'low';

  // --- Immediate (0-30 min) ---
  const immediateActions: string[] = [
    'Hydrate 500ml water',
    'Protein 25-30g within 30 minutes',
  ];
  if (intensityLevel === 'high') {
    immediateActions.push('Electrolyte supplementation');
    immediateActions.push('Cool down with 5-min easy walk');
  }

  const immediateModalities = IMMEDIATE_MODALITIES[intensityLevel];
  const immediateDuration = intensityLevel === 'high' ? 20 : intensityLevel === 'moderate' ? 15 : 10;

  // --- Short-Term (2-6 hours) ---
  const shortTermModalities: string[] = [];
  const areaFocus: Record<string, string[]> = {};

  // Target the most impacted areas
  const sortedAreas = Object.entries(impact.impactedAreas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4); // Top 4 most impacted

  for (const [area, soreness] of sortedAreas) {
    const areaMods = AREA_MODALITIES[area];
    if (!areaMods) continue;

    const modsForArea: string[] = [];
    if (soreness >= 2 && areaMods.foam.length > 0) {
      modsForArea.push(...areaMods.foam);
      shortTermModalities.push(...areaMods.foam);
    }
    if (areaMods.stretch.length > 0) {
      modsForArea.push(areaMods.stretch[0]);
      shortTermModalities.push(areaMods.stretch[0]);
    }
    if (modsForArea.length > 0) {
      areaFocus[area] = modsForArea;
    }
  }

  // Deduplicate
  const uniqueShortTerm = [...new Set(shortTermModalities)];

  // --- Evening ---
  const avoidances: string[] = ['No caffeine after 2pm'];
  if (intensityLevel === 'high') {
    avoidances.push('Avoid screens 1hr before bed');
    avoidances.push('Light dinner — avoid heavy meals late');
  }

  const targetSleepHours = intensityLevel === 'high' ? 8.5 :
    intensityLevel === 'moderate' ? 8.0 : 7.5;

  // --- Next Day ---
  const expectedFocus: WorkoutFocus =
    impact.estimatedPostIACI >= 70 ? 'fitness_building' :
    impact.estimatedPostIACI >= 45 ? 'active_recovery' : 'recovery_only';

  const criticalAreas = sortedAreas
    .filter(([, s]) => s >= 3)
    .map(([area]) => area);

  const nextDayModalities: string[] = [];
  for (const area of criticalAreas) {
    const areaMods = AREA_MODALITIES[area];
    if (areaMods?.stretch[0]) {
      nextDayModalities.push(areaMods.stretch[0]);
    }
  }
  nextDayModalities.push('dynamic-warmup-flow');

  return {
    workoutDate,
    workoutType,
    immediate: {
      actions: immediateActions,
      modalities: immediateModalities,
      durationMin: immediateDuration,
    },
    shortTerm: {
      modalities: uniqueShortTerm,
      areaFocus,
      timing: 'Within 2-6 hours post-workout',
    },
    evening: {
      sleepProtocol: SLEEP_MODALITIES.slice(0, intensityLevel === 'high' ? 3 : 2),
      avoidances,
      targetSleepHours,
    },
    nextDay: {
      expectedFocus,
      criticalAreas,
      preWorkoutModalities: nextDayModalities,
    },
  };
}
