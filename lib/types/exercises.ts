/**
 * Exercise types for endurance-focused training.
 */

export type ExerciseCategory =
  | 'run'
  | 'cycle'
  | 'swim'
  | 'row'
  | 'ski_erg'
  | 'elliptical'
  | 'hike'
  | 'walk'
  | 'strength'
  | 'mobility'
  | 'technique'
  | 'cross_train';

export type EnergySystem = 'aerobic' | 'anaerobic' | 'mixed' | 'recovery';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  energySystem: EnergySystem;
  environment: string[];
  equipment: string[];
  hrZoneTarget: string | null;
  strainEstimate: number; // 1-21 scale
  recoveryCost: number; // 1-10
  travelFriendly: boolean;
  bodySystemsStressed: string[];
  description: string | null;
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  exerciseId: string | null;
  workoutType: string;
  startTime: string;
  endTime: string | null;
  durationMs: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  strainScore: number | null;
  caloriesBurned: number | null;
  hrZones: Record<string, number> | null;
  rpe: number | null; // 1-10
  notes: string | null;
  bodySystemsStressed: string[];
  preIaciScore: number | null;
  postWorkoutSubsystemImpact: Record<string, number> | null;
  source: string; // 'manual' | 'whoop' | etc.
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationMs: number | null;
  distance: number | null;
  heartRate: number | null;
  rpe: number | null;
  notes: string | null;
}
