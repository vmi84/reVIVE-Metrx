-- Migration 006: workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_id UUID REFERENCES exercises(id),
  workout_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_ms BIGINT,
  avg_heart_rate REAL,
  max_heart_rate REAL,
  strain_score REAL,
  calories_burned REAL,
  hr_zones JSONB,
  rpe REAL,
  notes TEXT,
  body_systems_stressed TEXT[] DEFAULT '{}',
  pre_iaci_score REAL,
  post_workout_subsystem_impact JSONB,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient querying by user and date
CREATE INDEX idx_workouts_user_date ON workouts (user_id, date);
