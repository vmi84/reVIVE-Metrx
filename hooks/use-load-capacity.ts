/**
 * Load Capacity Hook
 *
 * Computes systemic load stress capacity after IACI is available.
 * When workoutFocus === 'recovery_only', auto-generates a recovery day plan.
 */

import { useCallback, useEffect } from 'react';
import { useDailyStore } from '../store/daily-store';
import { useFeedStore } from '../store/feed-store';
import { useAuthStore } from '../store/auth-store';
import { computeLoadCapacity } from '../lib/engine/load-capacity';
import { generateRecoveryDayPlan } from '../lib/engine/recovery-day-plan';
import { LoadCapacityInputs } from '../lib/types/load-capacity';
import { today } from '../lib/utils/date';

export function useLoadCapacity() {
  const { iaci } = useDailyStore();
  const { profile } = useAuthStore();
  const { days, updateDayLoadCapacity, updateDayRecoveryDayPlan } = useFeedStore();

  const compute = useCallback(() => {
    if (!iaci) return null;

    const todayDay = days.find(d => d.date === today());
    const phys = todayDay?.physiology;
    const subj = todayDay?.subjective;

    // Build inputs from available data
    const inputs: LoadCapacityInputs = {
      iaciScore: iaci.score,
      readinessTier: iaci.readinessTier,
      subsystemScores: iaci.subsystemScores,
      phenotype: iaci.phenotype,

      whoopRecoveryScore: phys?.recovery_score ?? null,
      whoopSleepScore: phys?.sleep_performance_pct ?? null,
      whoopStrain: phys?.day_strain ?? null,

      strainHistory7d: [], // TODO: fetch from history
      cumulativeStrain7d: 0,
      peakStrainLast3d: 0,
      acwr: null,

      sorenessMap: (subj?.soreness as Record<string, number>) ?? {},
      stiffness: subj?.stiffness ?? 2,
      heavyLegs: subj?.heavy_legs ?? false,
      painLocations: subj?.pain_locations ?? [],
    };

    // Compute load capacity
    const result = computeLoadCapacity(inputs);
    const todayStr = today();
    updateDayLoadCapacity(todayStr, result);

    // Auto-generate recovery day plan if recovery_only
    if (result.workoutFocus === 'recovery_only') {
      const plan = generateRecoveryDayPlan(
        todayStr,
        result,
        iaci.subsystemScores,
        inputs.sorenessMap,
        profile?.weight_kg ?? null,
      );
      updateDayRecoveryDayPlan(todayStr, plan);
    }

    return result;
  }, [iaci, days, profile]);

  // Auto-compute when IACI becomes available
  useEffect(() => {
    if (iaci) {
      compute();
    }
  }, [iaci]);

  const todayDay = days.find(d => d.date === today());
  return {
    loadCapacity: todayDay?.loadCapacity ?? null,
    recoveryDayPlan: todayDay?.recoveryDayPlan ?? null,
    compute,
  };
}
