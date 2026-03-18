/**
 * Athlete Mode Config Resolver
 *
 * Produces an AthleteModeConfig based on the athlete's mode, schedule,
 * and sport category. This single config object threads through the
 * entire scoring pipeline.
 *
 * Recreational mode returns the existing default thresholds (zero behavioral change).
 * Competitive mode relaxes thresholds, reduces penalties, and widens ACWR zones.
 */

import type { AthleteModeConfig, AthleteMode, TrainingSchedule } from '../types/athlete-mode';
import type { SportCategory } from '../../data/sport-profiles';
import {
  TIER_THRESHOLDS,
  COMPETITIVE_TIER_THRESHOLDS,
  COMPETITIVE_PENALTY_SCALING,
  COMPETITIVE_ACWR_DANGER_MIN,
} from '../utils/constants';

/** Default config for recreational athletes — matches all existing behavior. */
const RECREATIONAL_CONFIG: AthleteModeConfig = {
  mode: 'recreational',
  trainingSchedule: 'single',
  tierThresholds: {
    perform: TIER_THRESHOLDS.perform,
    train: TIER_THRESHOLDS.train,
    maintain: TIER_THRESHOLDS.maintain,
    recover: TIER_THRESHOLDS.recover,
    protect: 0,
  },
  acwrDangerMin: 1.3,
  penaltyScaling: 1.0,
  upgradePerformancePermissions: false,
};

/**
 * Resolve the full athlete mode config from profile settings.
 *
 * @param mode - 'recreational' or 'competitive'
 * @param schedule - 'single' or 'double' (2-a-day)
 * @param sportCategory - optional sport category for fine-tuning
 */
export function getAthleteModeConfig(
  mode: AthleteMode = 'recreational',
  schedule: TrainingSchedule = 'single',
  _sportCategory?: SportCategory | null,
): AthleteModeConfig {
  if (mode === 'recreational') {
    return { ...RECREATIONAL_CONFIG, trainingSchedule: schedule };
  }

  // Competitive mode: relaxed thresholds, reduced penalties
  return {
    mode: 'competitive',
    trainingSchedule: schedule,
    tierThresholds: {
      perform: COMPETITIVE_TIER_THRESHOLDS.perform,
      train: COMPETITIVE_TIER_THRESHOLDS.train,
      maintain: COMPETITIVE_TIER_THRESHOLDS.maintain,
      recover: COMPETITIVE_TIER_THRESHOLDS.recover,
      protect: COMPETITIVE_TIER_THRESHOLDS.protect,
    },
    acwrDangerMin: COMPETITIVE_ACWR_DANGER_MIN,
    penaltyScaling: COMPETITIVE_PENALTY_SCALING,
    upgradePerformancePermissions: true,
  };
}

/** Check if a config represents competitive mode. */
export function isCompetitive(config?: AthleteModeConfig | null): boolean {
  return config?.mode === 'competitive';
}

/** Check if a config represents 2-a-day training. */
export function isTwoADay(config?: AthleteModeConfig | null): boolean {
  return config?.trainingSchedule === 'double';
}
