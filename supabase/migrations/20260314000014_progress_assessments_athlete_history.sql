-- Migration 014: progress_assessments and athlete_history tables
CREATE TABLE progress_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  vo2max_trend REAL,
  threshold_pace_trend REAL,
  threshold_power_trend REAL,
  hrv_baseline_trend REAL NOT NULL,
  acwr REAL NOT NULL,
  stall_type TEXT NOT NULL DEFAULT 'none',
  stall_duration_days INTEGER,
  alternative_approaches TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on progress_assessments
ALTER TABLE progress_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own progress_assessments"
  ON progress_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress_assessments"
  ON progress_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress_assessments"
  ON progress_assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress_assessments"
  ON progress_assessments FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE athlete_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'monthly',
  vo2max REAL,
  lactate_threshold_hr REAL,
  lactate_threshold_pace TEXT,
  weight_kg REAL,
  body_fat_pct REAL,
  race_results JSONB DEFAULT '[]',
  fitness_tests JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on athlete_history
ALTER TABLE athlete_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own athlete_history"
  ON athlete_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own athlete_history"
  ON athlete_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own athlete_history"
  ON athlete_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own athlete_history"
  ON athlete_history FOR DELETE
  USING (auth.uid() = user_id);
