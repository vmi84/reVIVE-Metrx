/**
 * Plan-Aware Recovery Engine
 *
 * Given the athlete's planned sessions for today and tomorrow, plus their
 * current IACI state, produces targeted recovery recommendations that
 * COMPLEMENT the training plan rather than replace it.
 *
 * Recovery strategies:
 *   - Hard → Hard: aggressive recovery (cold, compression, sleep, nutrition)
 *   - Hard → Easy/Rest: standard recovery
 *   - Rest/Easy → Hard: preparation (mobility, activation, hydration)
 *   - AM done → PM upcoming: inter-session recovery (shortest, highest-impact)
 */

import type { PlannedSession, SessionIntensity } from '../types/training-plan';
import { classifySessionIntensity } from '../types/training-plan';
import type { IACIResult, SubsystemKey } from '../types/iaci';
import type { AthleteModeConfig } from '../types/athlete-mode';
import { TRAINING_RECOVERY_MAP, type TrainingRecoveryProfile, type TrainingModalityKey } from '../../data/training-recovery-map';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecoveryRecommendation {
  /** Modality key from TRAINING_RECOVERY_MAP. */
  modalityKey: string;
  /** Display label. */
  label: string;
  /** Why this is recommended now. */
  rationale: string;
  /** Suggested duration in minutes. */
  durationMin: number;
  /** Priority rank (lower = more important). */
  priority: number;
  /** Recovery strategy category. */
  strategy: 'aggressive' | 'preparation' | 'inter_session' | 'standard';
}

type RecoveryStrategy = 'aggressive' | 'preparation' | 'inter_session' | 'standard';

// ---------------------------------------------------------------------------
// Strategy classification
// ---------------------------------------------------------------------------

function determineStrategy(
  todaySessions: PlannedSession[],
  tomorrowSessions: PlannedSession[],
  isInterSession: boolean,
): RecoveryStrategy {
  if (isInterSession) return 'inter_session';

  const todayIntensities = todaySessions.map((s) =>
    classifySessionIntensity(s.type, s.intensityZone),
  );
  const tomorrowIntensities = tomorrowSessions.map((s) =>
    classifySessionIntensity(s.type, s.intensityZone),
  );

  const todayHard = todayIntensities.some((i) => i === 'key' || i === 'hard');
  const tomorrowHard = tomorrowIntensities.some((i) => i === 'key' || i === 'hard');
  const todayEasyOrRest = todayIntensities.every((i) => i === 'easy' || i === 'rest');

  if (todayHard && tomorrowHard) return 'aggressive';
  if (todayEasyOrRest && tomorrowHard) return 'preparation';
  return 'standard';
}

// ---------------------------------------------------------------------------
// Modality pools by strategy
// ---------------------------------------------------------------------------

const AGGRESSIVE_MODALITIES = [
  'coldExposure', 'massage', 'sauna', 'breathworkActive', 'meditation',
  'yoga', 'aquaticRecovery', 'walkingRecovery',
];

const PREPARATION_MODALITIES = [
  'mobilityFlow', 'correctiveExercise', 'breathworkActive', 'walkingRecovery',
  'easyCycling', 'eccentricRecovery', 'yoga',
];

const INTER_SESSION_MODALITIES = [
  'breathworkActive', 'mobilityFlow', 'walkingRecovery', 'meditation',
  'coldExposure',
];

const STANDARD_MODALITIES = [
  'walkingRecovery', 'yoga', 'mobilityFlow', 'breathworkActive',
  'massage', 'meditation', 'swimEasy', 'easyCycling', 'aquaticRecovery',
];

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Get plan-aware recovery recommendations.
 *
 * @param todaySessions - Planned sessions for today
 * @param tomorrowSessions - Planned sessions for tomorrow
 * @param currentIACI - Current IACI result (for subsystem targeting)
 * @param athleteMode - Athlete mode config
 * @param isInterSession - Whether this is between AM and PM sessions
 */
export function getRecoveryForPlan(
  todaySessions: PlannedSession[],
  tomorrowSessions: PlannedSession[],
  currentIACI: IACIResult | null,
  _athleteMode?: AthleteModeConfig | null,
  isInterSession: boolean = false,
): RecoveryRecommendation[] {
  const strategy = determineStrategy(todaySessions, tomorrowSessions, isInterSession);

  // Select modality pool based on strategy
  const pool = {
    aggressive: AGGRESSIVE_MODALITIES,
    preparation: PREPARATION_MODALITIES,
    inter_session: INTER_SESSION_MODALITIES,
    standard: STANDARD_MODALITIES,
  }[strategy];

  // Find the most stressed subsystems for targeting
  const stressedSystems = getStressedSubsystems(currentIACI);

  const recommendations: RecoveryRecommendation[] = [];

  for (let i = 0; i < pool.length && recommendations.length < 5; i++) {
    const key = pool[i] as TrainingModalityKey;
    const modality: TrainingRecoveryProfile | undefined = TRAINING_RECOVERY_MAP[key];
    if (!modality) continue;

    // Boost priority if modality targets a stressed subsystem
    const targetsStressed = modality.primarySubsystems.some((s: string) =>
      stressedSystems.includes(s as SubsystemKey),
    );

    const baseDuration = strategy === 'inter_session'
      ? Math.min(modality.durationRange.sweet, 15) // Cap at 15min for inter-session
      : modality.durationRange.sweet;

    recommendations.push({
      modalityKey: key,
      label: modality.label,
      rationale: getRationale(strategy, modality.label, tomorrowSessions),
      durationMin: baseDuration,
      priority: i + (targetsStressed ? -2 : 0),
      strategy,
    });
  }

  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  return recommendations;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStressedSubsystems(iaci: IACIResult | null): SubsystemKey[] {
  if (!iaci) return [];
  const keys: SubsystemKey[] = ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological'];
  return keys
    .filter((k) => iaci.subsystemScores[k].score < 55)
    .sort((a, b) => iaci.subsystemScores[a].score - iaci.subsystemScores[b].score);
}

function getRationale(
  strategy: RecoveryStrategy,
  modalityLabel: string,
  tomorrowSessions: PlannedSession[],
): string {
  const tomorrowDesc = tomorrowSessions.length > 0
    ? tomorrowSessions.map((s) => s.type).join(' + ')
    : 'tomorrow\'s session';

  switch (strategy) {
    case 'aggressive':
      return `Prioritize ${modalityLabel.toLowerCase()} tonight — hard session (${tomorrowDesc}) follows tomorrow.`;
    case 'preparation':
      return `${modalityLabel} to prepare for tomorrow's ${tomorrowDesc}.`;
    case 'inter_session':
      return `Quick ${modalityLabel.toLowerCase()} between sessions to restore readiness.`;
    case 'standard':
      return `${modalityLabel} supports general recovery.`;
  }
}
