/**
 * Athlete Mode Types
 *
 * Defines the competitive vs recreational athlete distinction
 * that flows through the entire scoring and recommendation pipeline.
 */

/** Whether the athlete self-directs training or follows an external coach. */
export type AthleteMode = 'recreational' | 'competitive';

/** Single session per day or two-a-day training. */
export type TrainingSchedule = 'single' | 'double';

/** Training periodization phase. */
export type TrainingPhase = 'base' | 'build' | 'peak' | 'taper' | 'offseason';

/** Athlete experience level — affects threshold tolerance. */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

/**
 * Resolved configuration for the athlete mode.
 * Produced by `getAthleteModeConfig()` and consumed by the engine.
 */
export interface AthleteModeConfig {
  mode: AthleteMode;
  trainingSchedule: TrainingSchedule;

  /** IACI tier thresholds (shifted down for competitive athletes). */
  tierThresholds: {
    perform: number;
    train: number;
    maintain: number;
    recover: number;
    protect: number;
  };

  /** ACWR threshold above which stress modifier is applied. */
  acwrDangerMin: number;

  /** Penalty scaling factor (1.0 = full, 0.6 = competitive reduction). */
  penaltyScaling: number;

  /** Whether to upgrade 'caution' → 'allowed' for performance modalities. */
  upgradePerformancePermissions: boolean;
}
