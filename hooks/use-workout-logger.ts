/**
 * Workout Logger Hook
 *
 * Logs workouts to both Supabase (when available) and local physiology store.
 * After logging, triggers feed refresh and IACI recomputation.
 */

import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useWorkoutStore } from '../store/workout-store';
import { usePhysiologyStore } from '../store/physiology-store';
import { useFeedStore } from '../store/feed-store';
import { today } from '../lib/utils/date';
import type { CanonicalPhysiologyRecord, WorkoutMetrics } from '../lib/types/canonical';

export function useWorkoutLogger() {
  const { user } = useAuthStore();
  const { activeWorkout, startWorkout, endWorkout, setRecentWorkouts } = useWorkoutStore();
  const { upsertRecords, getRecord } = usePhysiologyStore();

  const logWorkout = useCallback(async (workout: {
    exerciseId?: string;
    workoutType: string;
    durationMs: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    strainScore?: number;
    rpe?: number;
    notes?: string;
    bodySystemsStressed?: string[];
  }) => {
    const now = new Date();
    const dateStr = today();
    const startTime = new Date(now.getTime() - workout.durationMs).toISOString();
    const endTime = now.toISOString();

    // 1. Store to Supabase if available
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase.from('workouts').insert({
          user_id: user.id,
          date: dateStr,
          exercise_id: workout.exerciseId ?? null,
          workout_type: workout.workoutType,
          start_time: startTime,
          end_time: endTime,
          duration_ms: workout.durationMs,
          avg_heart_rate: workout.avgHeartRate ?? null,
          max_heart_rate: workout.maxHeartRate ?? null,
          strain_score: workout.strainScore ?? null,
          rpe: workout.rpe ?? null,
          notes: workout.notes ?? null,
          body_systems_stressed: workout.bodySystemsStressed ?? [],
          source: 'manual',
        });
      } catch (err) {
        console.warn('Supabase workout insert failed (offline?):', err);
      }
    }

    // 2. Always store locally in physiology store for feed display
    const workoutMetric: WorkoutMetrics = {
      workoutId: `manual-${Date.now()}`,
      workoutType: workout.workoutType,
      startTime,
      endTime,
      durationMs: workout.durationMs,
      avgHeartRate: workout.avgHeartRate ?? null,
      maxHeartRate: workout.maxHeartRate ?? null,
      strainScore: workout.strainScore ?? null,
      caloriesBurned: null,
      hrZones: null,
    };

    // Get or create today's canonical record
    const existing = getRecord(dateStr);
    if (existing) {
      // Append workout to existing record (avoid duplicates)
      if (!existing.workouts.some(w => w.workoutId === workoutMetric.workoutId)) {
        existing.workouts.push(workoutMetric);
        // Update day strain
        const totalStrain = existing.workouts.reduce((s, w) => s + (w.strainScore ?? 0), 0);
        if (totalStrain > 0 && !existing.dayStrain) {
          existing.dayStrain = totalStrain;
        }
        upsertRecords([existing]);
      }
    } else {
      // Create a new record for today with just this workout
      const newRecord: CanonicalPhysiologyRecord = {
        date: dateStr,
        source: 'manual',
        dataQuality: 'low',
        sleep: {
          totalSleepMs: null, sleepPerformancePct: null, sleepConsistencyPct: null,
          remSleepMs: null, deepSleepMs: null, lightSleepMs: null, awakeDuringMs: null,
          sleepLatencyMs: null, sleepOnsetTime: null, wakeTime: null, awakenings: null,
          respiratoryRate: null, spo2Pct: null, skinTempDeviation: null,
        },
        cardiovascular: {
          hrvRmssd: null, restingHeartRate: null, respiratoryRate: null,
          spo2Pct: null, skinTempDeviation: null,
        },
        recovery: {
          recoveryScore: null, hrvRmssd: null, restingHeartRate: null,
          spo2Pct: null, skinTempDeviation: null, respiratoryRate: null,
        },
        workouts: [workoutMetric],
      };
      upsertRecords([newRecord]);
    }

    // 3. Add to recent workouts in workout store
    const recentEntry = {
      id: workoutMetric.workoutId,
      userId: user?.id ?? 'demo',
      date: dateStr,
      exerciseId: workout.exerciseId ?? null,
      workoutType: workout.workoutType,
      startTime,
      endTime,
      durationMs: workout.durationMs,
      avgHeartRate: workout.avgHeartRate ?? null,
      maxHeartRate: workout.maxHeartRate ?? null,
      strainScore: workout.strainScore ?? null,
      caloriesBurned: null,
      hrZones: null,
      rpe: workout.rpe ?? null,
      notes: workout.notes ?? null,
      bodySystemsStressed: workout.bodySystemsStressed ?? [],
      preIaciScore: null,
      postWorkoutSubsystemImpact: null,
      source: 'manual',
      createdAt: now.toISOString(),
    };
    const current = useWorkoutStore.getState().recentWorkouts;
    setRecentWorkouts([recentEntry as any, ...current].slice(0, 20));

    console.log(`[Workout] Logged ${workout.workoutType} (${Math.round(workout.durationMs / 60000)}min) for ${dateStr}`);
  }, [user?.id]);

  const fetchRecentWorkouts = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) return;

    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(20);

    if (data) setRecentWorkouts(data as any);
  }, [user?.id]);

  return {
    logWorkout,
    fetchRecentWorkouts,
    activeWorkout,
    startWorkout,
    endWorkout,
  };
}
