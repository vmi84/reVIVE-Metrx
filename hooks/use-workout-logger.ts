import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useWorkoutStore } from '../store/workout-store';

export function useWorkoutLogger() {
  const { user } = useAuthStore();
  const { activeWorkout, startWorkout, endWorkout, setRecentWorkouts } = useWorkoutStore();

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
    if (!user?.id) return;

    const now = new Date();
    const { data, error } = await supabase.from('workouts').insert({
      user_id: user.id,
      date: now.toISOString().split('T')[0],
      exercise_id: workout.exerciseId ?? null,
      workout_type: workout.workoutType,
      start_time: new Date(now.getTime() - workout.durationMs).toISOString(),
      end_time: now.toISOString(),
      duration_ms: workout.durationMs,
      avg_heart_rate: workout.avgHeartRate ?? null,
      max_heart_rate: workout.maxHeartRate ?? null,
      strain_score: workout.strainScore ?? null,
      rpe: workout.rpe ?? null,
      notes: workout.notes ?? null,
      body_systems_stressed: workout.bodySystemsStressed ?? [],
      source: 'manual',
    }).select().single();

    if (error) throw error;
    return data;
  }, [user?.id]);

  const fetchRecentWorkouts = useCallback(async () => {
    if (!user?.id) return;

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
