/**
 * Driver Analysis — identifies the primary recovery driver (root cause)
 * from subsystem scores and active penalties.
 */

import {
  SubsystemScores,
  SubsystemKey,
  PenaltyResult,
  Phenotype,
  RecoveryDriver,
  DriverAnalysis,
} from '../types/iaci';

const SUBSYSTEM_TO_DRIVER: Record<SubsystemKey, RecoveryDriver> = {
  autonomic: 'stress',
  musculoskeletal: 'activity_overload',
  cardiometabolic: 'activity_overload',
  sleep: 'sleep',
  metabolic: 'metabolic',
  psychological: 'stress',
  neurological: 'neurological',
};

const DRIVER_INSIGHTS: Record<RecoveryDriver, string> = {
  sleep: 'Prioritize 8+ hours tonight. Avoid screens after 9pm. Morning bright light within 60 min of waking.',
  stress: 'Schedule a 10-min breathwork session. Reduce meeting density. Short walk outdoors.',
  activity_overload: 'Deload day — mobility and walking only. Protein timing every 3-4 hours. Foam roll affected areas.',
  neurological: 'Cognitive rest priority. Screen-free time. Gentle movement only. Red light therapy if available.',
  metabolic: 'Hydration and electrolyte protocol. Timed carbs around activity. Address fueling gaps before training.',
  illness: 'Full rest and symptom monitoring. Hydration focus. Sleep priority. Consider medical evaluation.',
  multi_system: 'Recovery day — no training load. Sleep, nutrition, and gentle movement. Address the weakest system first.',
};

const DRIVER_LABELS: Record<RecoveryDriver, string> = {
  sleep: 'Sleep',
  stress: 'Stress / Autonomic',
  activity_overload: 'Activity Overload',
  neurological: 'Neurological / CNS',
  metabolic: 'Metabolic / Nutrition',
  illness: 'Illness Risk',
  multi_system: 'Multi-System Fatigue',
};

export function identifyDrivers(
  scores: SubsystemScores,
  penalties: PenaltyResult[],
  _phenotype: Phenotype,
): DriverAnalysis {
  // Check for illness penalty override
  const hasIllness = penalties.some(p => p.name === 'illness_caution');
  if (hasIllness) {
    return {
      primaryDriver: 'illness',
      secondaryDriver: null,
      driverScore: 90,
      driverExplanation: 'Illness symptoms detected — recovery is the only priority.',
      actionableInsight: DRIVER_INSIGHTS.illness,
    };
  }

  // Rank subsystems by score (lowest = most limiting)
  const keys: SubsystemKey[] = [
    'autonomic', 'musculoskeletal', 'cardiometabolic',
    'sleep', 'metabolic', 'psychological', 'neurological',
  ];
  const ranked = keys
    .map(k => ({ key: k, score: scores[k].score }))
    .sort((a, b) => a.score - b.score);

  // Check for multi-system collapse (3+ subsystems below 50)
  const impaired = ranked.filter(r => r.score < 50);
  if (impaired.length >= 3) {
    const lowestScore = ranked[0].score;
    return {
      primaryDriver: 'multi_system',
      secondaryDriver: SUBSYSTEM_TO_DRIVER[ranked[0].key],
      driverScore: 100 - lowestScore,
      driverExplanation: `${impaired.length} subsystems below 50 — multi-system fatigue.`,
      actionableInsight: DRIVER_INSIGHTS.multi_system,
    };
  }

  // Primary driver = lowest subsystem mapped to driver category
  const primary = SUBSYSTEM_TO_DRIVER[ranked[0].key];
  const primaryScore = ranked[0].score;

  // Secondary driver = next lowest IF different driver category AND score < 55
  let secondary: RecoveryDriver | null = null;
  for (let i = 1; i < ranked.length; i++) {
    const candidateDriver = SUBSYSTEM_TO_DRIVER[ranked[i].key];
    if (candidateDriver !== primary && ranked[i].score < 55) {
      secondary = candidateDriver;
      break;
    }
  }

  return {
    primaryDriver: primary,
    secondaryDriver: secondary,
    driverScore: 100 - primaryScore,
    driverExplanation: `${DRIVER_LABELS[primary]} is your #1 limiter today (${ranked[0].key}: ${primaryScore}/100).`,
    actionableInsight: DRIVER_INSIGHTS[primary],
  };
}
