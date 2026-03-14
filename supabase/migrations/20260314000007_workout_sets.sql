-- Migration 007: workout_sets table
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight REAL,
  duration_ms BIGINT,
  distance REAL,
  heart_rate REAL,
  rpe REAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
