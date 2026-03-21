/**
 * Multi-Systemic Recovery Day Plan Generator
 *
 * When workoutFocus === 'recovery_only', generates a full-day structured
 * recovery protocol targeting every limiting subsystem with specific
 * modalities, timing, and sequencing.
 */

import { SubsystemKey, SubsystemScores } from '../types/iaci';
import {
  LoadCapacityResult,
  RecoveryDayPlan,
  RecoveryBlock,
  RecoveryAction,
} from '../types/load-capacity';

// ---------------------------------------------------------------------------
// Per-Subsystem Recovery Modality Maps
// ---------------------------------------------------------------------------

interface SubsystemRecovery {
  morning: RecoveryAction[];
  midMorning: RecoveryAction[];
  afternoon: RecoveryAction[];
  evening: RecoveryAction[];
}

function getAutonomicRecovery(stressFactor: number): SubsystemRecovery {
  const target: SubsystemKey = 'autonomic';
  const actions: SubsystemRecovery = {
    morning: [
      {
        protocolSlug: 'coherent-breathing',
        name: 'Coherent Breathing',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: '5.5 breaths/min (5.5s inhale, 5.5s exhale) for parasympathetic activation',
      },
    ],
    midMorning: [],
    afternoon: [
      {
        protocolSlug: 'gentle-walking',
        name: 'Gentle Walk',
        durationMin: 15,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: 'Easy pace walk outdoors. Nasal breathing. Conversational effort only.',
      },
    ],
    evening: [
      {
        protocolSlug: 'extended-exhale-breathing',
        name: 'Extended Exhale Breathing',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: '4-count inhale, 6-8 count exhale. Activates vagal tone for recovery.',
      },
    ],
  };

  if (stressFactor > 70) {
    actions.morning.push({
      protocolSlug: 'cold-water-face-splash',
      name: 'Cold Water Face Splash',
      durationMin: 2,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: 'Splash cold water on face for 30-60s to activate dive reflex and vagal tone.',
    });
    actions.evening.push({
      protocolSlug: 'legs-on-wall',
      name: 'Legs on Wall',
      durationMin: 10,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: 'Lie with legs elevated against wall. Deep slow breathing. 10 minutes.',
    });
  }

  return actions;
}

function getMusculoskeletalRecovery(
  stressFactor: number,
  sorenessMap: Record<string, number>,
): SubsystemRecovery {
  const target: SubsystemKey = 'musculoskeletal';
  const actions: SubsystemRecovery = {
    morning: [],
    midMorning: [],
    afternoon: [],
    evening: [],
  };

  // Area-specific tissue work for sore regions (sorted by soreness)
  const soreRegions = Object.entries(sorenessMap)
    .filter(([, v]) => v >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const areaModalities: Record<string, { slug: string; name: string; instruction: string }> = {
    quads: { slug: 'foam-roll-quads', name: 'Foam Roll Quads', instruction: 'Slow rolls on quads, 60-90s per side. Pause on tender spots.' },
    hamstrings: { slug: 'foam-roll-hamstrings', name: 'Foam Roll Hamstrings', instruction: 'Roll hamstrings on foam roller, 60-90s per side.' },
    calves: { slug: 'foam-roll-calves', name: 'Foam Roll Calves', instruction: 'Roll calves, crossing one leg over the other for pressure.' },
    glutes: { slug: 'foam-roll-glutes', name: 'Foam Roll Glutes', instruction: 'Sit on foam roller, lean to one side. 60-90s per side.' },
    hips: { slug: 'banded-hip-distraction', name: 'Banded Hip Distraction', instruction: 'Band around hip crease, step back for distraction. 90s per side.' },
    shoulders: { slug: 'banded-shoulder-distraction', name: 'Banded Shoulder Distraction', instruction: 'Band around wrist, face away, let band distract shoulder. 60s per side.' },
    upper_back: { slug: 'foam-roll-thoracic', name: 'Foam Roll Thoracic', instruction: 'Roll upper back on foam roller. Extend over roller at each segment.' },
    lower_back: { slug: 'static-lower-back-stretch', name: 'Lower Back Stretch', instruction: 'Child\'s pose to cat-cow flow. 2 minutes gentle movement.' },
    core: { slug: 'cat-cow-breathing', name: 'Cat-Cow Breathing', instruction: 'Coordinated breathing with cat-cow movement. 10 cycles.' },
  };

  for (const [region, soreness] of soreRegions) {
    const mod = areaModalities[region];
    if (!mod) continue;
    actions.midMorning.push({
      protocolSlug: mod.slug,
      name: mod.name,
      durationMin: 3,
      targetSubsystem: target,
      targetAreas: [region],
      evidenceLevel: 'moderate',
      instruction: mod.instruction,
    });
  }

  // Global circulation if high stress
  if (stressFactor > 50) {
    actions.afternoon.push({
      protocolSlug: 'walking-recovery',
      name: 'Walking Recovery',
      durationMin: 20,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'strong',
      instruction: 'Easy-pace walk for global circulation. 20 minutes.',
    });
  }

  if (stressFactor > 70) {
    actions.midMorning.push({
      protocolSlug: 'contrast-shower',
      name: 'Contrast Shower',
      durationMin: 8,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: '2 min hot / 30s cold, repeat 3 cycles. End on cold.',
    });
  }

  return actions;
}

function getCardiometabolicRecovery(stressFactor: number): SubsystemRecovery {
  const target: SubsystemKey = 'cardiometabolic';
  return {
    morning: [],
    midMorning: [],
    afternoon: [
      {
        protocolSlug: 'gentle-walking',
        name: 'Aerobic Flush Walk',
        durationMin: stressFactor > 60 ? 25 : 20,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: 'Conversational-pace walk. Nasal breathing. Zone 1 only.',
      },
    ],
    evening: [
      {
        protocolSlug: 'box-breathing',
        name: 'Box Breathing',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'moderate',
        instruction: '4-count inhale, 4-count hold, 4-count exhale, 4-count hold. 5 minutes.',
      },
    ],
  };
}

function getSleepRecovery(stressFactor: number): SubsystemRecovery {
  const target: SubsystemKey = 'sleep';
  const actions: SubsystemRecovery = {
    morning: [
      {
        protocolSlug: 'sunlight-exposure',
        name: 'Morning Sunlight',
        durationMin: 10,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: 'Get outside within 1hr of waking. 10 min natural light. No sunglasses.',
      },
    ],
    midMorning: [],
    afternoon: [],
    evening: [
      {
        protocolSlug: '4-5-6-breathing',
        name: '4-5-6 Breathing',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: '4-count inhale, 5-count hold, 6-count exhale. Progressive relaxation.',
      },
      {
        protocolSlug: 'body-scan-meditation',
        name: 'Body Scan Meditation',
        durationMin: 10,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'moderate',
        instruction: 'Systematically relax each body region from toes to head. 10 minutes.',
      },
    ],
  };

  if (stressFactor > 70) {
    actions.evening.push({
      protocolSlug: 'humming-bee-breath',
      name: 'Humming Bee Breath',
      durationMin: 3,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'emerging',
      instruction: 'Plug ears, close eyes, hum on exhale. 6-8 cycles. Activates parasympathetic.',
    });
  }

  return actions;
}

function getMetabolicRecovery(stressFactor: number): SubsystemRecovery {
  // Metabolic recovery is primarily nutrition-based, handled separately
  return {
    morning: [],
    midMorning: [],
    afternoon: [],
    evening: [],
  };
}

function getPsychologicalRecovery(stressFactor: number): SubsystemRecovery {
  const target: SubsystemKey = 'psychological';
  const actions: SubsystemRecovery = {
    morning: [],
    midMorning: [],
    afternoon: [],
    evening: [],
  };

  if (stressFactor > 50) {
    actions.afternoon.push({
      protocolSlug: 'gentle-walking',
      name: 'Mindful Walking',
      durationMin: 15,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: 'Walk outdoors. Focus on sensory awareness. No headphones. 15 minutes.',
    });
  }

  if (stressFactor > 60) {
    actions.evening.push({
      protocolSlug: 'body-scan-meditation',
      name: 'Stress Release Meditation',
      durationMin: 10,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: 'Guided body scan focusing on releasing held tension. 10 minutes.',
    });
  }

  return actions;
}

function getNeurologicalRecovery(stressFactor: number): SubsystemRecovery {
  const target: SubsystemKey = 'neurological';
  const actions: SubsystemRecovery = {
    morning: [
      {
        protocolSlug: 'cognitive-rest-protocol',
        name: 'Cognitive Rest',
        durationMin: 20,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: 'Screen-free quiet time. Dim lighting. No complex thinking. Minimum 20 minutes.',
      },
      {
        protocolSlug: 'cervical-mobility-flow',
        name: 'Gentle Cervical Mobility',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: ['neck'],
        evidenceLevel: 'moderate',
        instruction: 'Gentle chin tucks, rotation, and lateral tilts. Stay within pain-free range.',
      },
    ],
    midMorning: [],
    afternoon: [
      {
        protocolSlug: 'gentle-walking',
        name: 'Gentle Walk (Nature)',
        durationMin: 15,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: 'Easy walk in nature. No headphones. Focus on sensory awareness. Nasal breathing.',
      },
    ],
    evening: [
      {
        protocolSlug: 'body-scan-meditation',
        name: 'Meditation',
        durationMin: 10,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'moderate',
        instruction: 'Body scan or guided meditation. Focus on releasing tension. 10 minutes.',
      },
      {
        protocolSlug: 'extended-exhale-breathing',
        name: 'Extended Exhale Breathing',
        durationMin: 5,
        targetSubsystem: target,
        targetAreas: [],
        evidenceLevel: 'strong',
        instruction: '4-count inhale, 6-8 count exhale for parasympathetic activation.',
      },
    ],
  };

  if (stressFactor > 50) {
    actions.midMorning.push({
      protocolSlug: 'vestibular-balance-drills',
      name: 'Vestibular Balance Drills',
      durationMin: 10,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'strong',
      instruction: 'VOR head turns, gaze stabilization, tandem stance. Stop if dizziness increases.',
    });
    actions.midMorning.push({
      protocolSlug: 'eye-tracking-exercises',
      name: 'Oculomotor Exercises',
      durationMin: 5,
      targetSubsystem: target,
      targetAreas: [],
      evidenceLevel: 'moderate',
      instruction: 'Smooth pursuit tracking, saccadic jumps, near-far focus. Keep head still.',
    });
  }

  if (stressFactor > 40) {
    actions.afternoon.push({
      protocolSlug: 'red-light-therapy-head',
      name: 'Red Light Therapy (Head/Neck)',
      durationMin: 15,
      targetSubsystem: target,
      targetAreas: ['head', 'neck'],
      evidenceLevel: 'strong',
      instruction: '810nm panel, 6-12 inches from head/neck. Close eyes. 15 minutes.',
    });
  }

  return actions;
}

// ---------------------------------------------------------------------------
// Merge and Deduplicate
// ---------------------------------------------------------------------------

function mergeBlocks(blocks: RecoveryAction[][]): RecoveryAction[] {
  const seen = new Set<string>();
  const merged: RecoveryAction[] = [];
  for (const block of blocks) {
    for (const action of block) {
      if (!seen.has(action.protocolSlug)) {
        seen.add(action.protocolSlug);
        merged.push(action);
      }
    }
  }
  return merged;
}

function blockTotal(actions: RecoveryAction[]): number {
  return actions.reduce((sum, a) => sum + a.durationMin, 0);
}

// ---------------------------------------------------------------------------
// Nutrition Protocol
// ---------------------------------------------------------------------------

function generateNutritionProtocol(
  loadCapacity: LoadCapacityResult,
  weightKg: number | null,
): RecoveryDayPlan['nutritionProtocol'] {
  const hydrationTarget = weightKg != null ? Math.round(weightKg * 35) : 2500;
  const metabolicStress = loadCapacity.subsystemStress.metabolic.totalStress;

  const avoidances: string[] = ['No caffeine after noon'];
  if (metabolicStress > 50) {
    avoidances.push('Limit alcohol');
    avoidances.push('Avoid processed foods');
  }

  return {
    hydrationTargetMl: hydrationTarget,
    electrolytes: metabolicStress > 40,
    proteinTimings: ['Breakfast: 25g', 'Lunch: 30g', 'Afternoon snack: 20g', 'Dinner: 25g'],
    avoidances,
  };
}

// ---------------------------------------------------------------------------
// Sleep Protocol
// ---------------------------------------------------------------------------

function generateSleepProtocol(
  loadCapacity: LoadCapacityResult,
): RecoveryDayPlan['sleepProtocol'] {
  const sleepStress = loadCapacity.subsystemStress.sleep.totalStress;
  const targetHours = sleepStress > 60 ? 9.0 : sleepStress > 40 ? 8.5 : 8.0;

  const hygiene = [
    'Dark, cool room (65-68°F)',
    'No screens 1 hour before bed',
    'Consistent bedtime within 30min window',
  ];

  if (sleepStress > 50) {
    hygiene.push('No heavy meals within 3 hours of bed');
  }

  const preSleepMods = ['extended-exhale-breathing', 'legs-on-wall'];
  if (sleepStress > 60) {
    preSleepMods.push('body-scan-meditation');
  }

  return {
    targetHours,
    sleepHygiene: hygiene,
    preSleepModalities: preSleepMods,
  };
}

// ---------------------------------------------------------------------------
// Main: Generate Recovery Day Plan
// ---------------------------------------------------------------------------

export function generateRecoveryDayPlan(
  date: string,
  loadCapacity: LoadCapacityResult,
  subsystemScores: SubsystemScores,
  sorenessMap: Record<string, number>,
  weightKg: number | null,
): RecoveryDayPlan {
  const stressFactors = loadCapacity.subsystemStress;

  // Get recovery actions for each limiting subsystem
  const recoveryMaps: SubsystemRecovery[] = [];

  // Only target subsystems with stress > 35 (meaningful contribution)
  const limitingSubsystems = loadCapacity.subsystemRanking
    .filter(key => stressFactors[key].totalStress > 35);

  for (const key of limitingSubsystems) {
    const sf = stressFactors[key].totalStress;
    switch (key) {
      case 'autonomic':
        recoveryMaps.push(getAutonomicRecovery(sf));
        break;
      case 'musculoskeletal':
        recoveryMaps.push(getMusculoskeletalRecovery(sf, sorenessMap));
        break;
      case 'cardiometabolic':
        recoveryMaps.push(getCardiometabolicRecovery(sf));
        break;
      case 'sleep':
        recoveryMaps.push(getSleepRecovery(sf));
        break;
      case 'metabolic':
        recoveryMaps.push(getMetabolicRecovery(sf));
        break;
      case 'psychological':
        recoveryMaps.push(getPsychologicalRecovery(sf));
        break;
      case 'neurological':
        recoveryMaps.push(getNeurologicalRecovery(sf));
        break;
    }
  }

  // Merge per-timeblock, dedup
  const morningActions = mergeBlocks(recoveryMaps.map(m => m.morning));
  const midMorningActions = mergeBlocks(recoveryMaps.map(m => m.midMorning));
  const afternoonActions = mergeBlocks(recoveryMaps.map(m => m.afternoon));
  const eveningActions = mergeBlocks(recoveryMaps.map(m => m.evening));

  // Cap total time (~60-90 min across day)
  // Priority: morning breathing (cheap), midMorning tissue (targeted), afternoon movement, evening wind-down
  const morning: RecoveryBlock = {
    timeWindow: 'Morning (wake → 10am)',
    modalities: morningActions.slice(0, 3),
    totalMinutes: blockTotal(morningActions.slice(0, 3)),
  };

  const midMorning: RecoveryBlock = {
    timeWindow: 'Mid-morning (10am → noon)',
    modalities: midMorningActions.slice(0, 5),
    totalMinutes: blockTotal(midMorningActions.slice(0, 5)),
  };

  const afternoon: RecoveryBlock = {
    timeWindow: 'Afternoon (noon → 4pm)',
    modalities: afternoonActions.slice(0, 3),
    totalMinutes: blockTotal(afternoonActions.slice(0, 3)),
  };

  const evening: RecoveryBlock = {
    timeWindow: 'Evening (6pm → bedtime)',
    modalities: eveningActions.slice(0, 4),
    totalMinutes: blockTotal(eveningActions.slice(0, 4)),
  };

  const totalEstimatedMinutes = morning.totalMinutes + midMorning.totalMinutes +
    afternoon.totalMinutes + evening.totalMinutes;

  // Overall focus description
  const topSubsystems = limitingSubsystems.slice(0, 3);
  const LABELS: Record<SubsystemKey, string> = {
    autonomic: 'autonomic',
    musculoskeletal: 'musculoskeletal',
    cardiometabolic: 'cardiometabolic',
    sleep: 'sleep/circadian',
    metabolic: 'metabolic',
    psychological: 'psychological',
    neurological: 'neurological/CNS',
  };
  const overallFocus = `Multi-systemic recovery targeting ${topSubsystems.map(k => LABELS[k]).join(' + ')}`;

  return {
    date,
    overallFocus,
    limitingSubsystems: limitingSubsystems as SubsystemKey[],
    timeline: { morning, midMorning, afternoon, evening },
    nutritionProtocol: generateNutritionProtocol(loadCapacity, weightKg),
    sleepProtocol: generateSleepProtocol(loadCapacity),
    totalEstimatedMinutes,
  };
}

