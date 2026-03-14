/**
 * Recovery Plan Hook
 *
 * Generates a post-workout recovery plan after a workout is logged.
 */

import { useCallback } from 'react';
import { useDailyStore } from '../store/daily-store';
import { useFeedStore } from '../store/feed-store';
import { computeWorkoutImpact } from '../lib/engine/workout-impact';
import { generateRecoveryPlan } from '../lib/engine/recovery-plan';
import { WorkoutImpactResult, RecoveryPlan } from '../lib/types/load-capacity';
import { today } from '../lib/utils/date';

interface WorkoutData {
  type: string;
  durationMin: number;
  strain: number | null;
  rpe: number | null;
  bodyAreasLoaded: string[];
  hrZones: Record<string, number>;
}

export function useRecoveryPlan() {
  const { iaci } = useDailyStore();
  const { days, updateDayRecoveryPlan } = useFeedStore();

  const generatePlan = useCallback((workout: WorkoutData): {
    impact: WorkoutImpactResult;
    plan: RecoveryPlan;
  } | null => {
    const todayDay = days.find(d => d.date === today());
    if (!iaci || !todayDay?.loadCapacity) return null;

    // Compute workout impact
    const impact = computeWorkoutImpact({
      preIACI: {
        score: iaci.score,
        subsystemScores: iaci.subsystemScores,
      },
      preLoadCapacity: todayDay.loadCapacity,
      workout,
    });

    // Generate recovery plan
    const plan = generateRecoveryPlan(
      today(),
      workout.type,
      impact,
      todayDay.loadCapacity,
    );

    // Store in feed
    updateDayRecoveryPlan(today(), plan);

    return { impact, plan };
  }, [iaci, days]);

  const todayDay = days.find(d => d.date === today());
  return {
    recoveryPlan: todayDay?.recoveryPlan ?? null,
    generatePlan,
  };
}
