import { create } from 'zustand';
import { Workout } from '../lib/types/exercises';

interface WorkoutState {
  activeWorkout: Workout | null;
  recentWorkouts: Workout[];

  startWorkout: (workout: Partial<Workout>) => void;
  endWorkout: () => void;
  setRecentWorkouts: (workouts: Workout[]) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeWorkout: null,
  recentWorkouts: [],

  startWorkout: (workout) =>
    set({
      activeWorkout: {
        id: '',
        userId: '',
        date: new Date().toISOString().split('T')[0],
        exerciseId: null,
        workoutType: 'general',
        startTime: new Date().toISOString(),
        endTime: null,
        durationMs: null,
        avgHeartRate: null,
        maxHeartRate: null,
        strainScore: null,
        caloriesBurned: null,
        hrZones: null,
        rpe: null,
        notes: null,
        bodySystemsStressed: [],
        preIaciScore: null,
        postWorkoutSubsystemImpact: null,
        source: 'manual',
        createdAt: new Date().toISOString(),
        ...workout,
      },
    }),

  endWorkout: () => set({ activeWorkout: null }),
  setRecentWorkouts: (workouts) => set({ recentWorkouts: workouts }),
}));
