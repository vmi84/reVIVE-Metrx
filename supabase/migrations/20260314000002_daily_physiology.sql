-- Migration 002: daily_physiology table
CREATE TABLE daily_physiology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hrv_rmssd REAL,
  resting_heart_rate REAL,
  respiratory_rate REAL,
  spo2_pct REAL,
  skin_temp_deviation REAL,
  sleep_duration_ms BIGINT,
  sleep_performance_pct REAL,
  sleep_consistency_pct REAL,
  rem_sleep_ms BIGINT,
  deep_sleep_ms BIGINT,
  light_sleep_ms BIGINT,
  awake_during_ms BIGINT,
  sleep_latency_ms BIGINT,
  sleep_onset_time TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  awakenings INTEGER,
  recovery_score REAL,
  day_strain REAL,
  iaci_score REAL,
  readiness_tier TEXT,
  subsystem_scores JSONB,
  phenotype TEXT,
  phenotype_detail TEXT,
  penalties_applied JSONB,
  inflammation_score REAL,
  inflammation_flags TEXT[],
  sources TEXT[] DEFAULT '{}',
  data_completeness REAL DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE daily_physiology ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own daily_physiology"
  ON daily_physiology FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_physiology"
  ON daily_physiology FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_physiology"
  ON daily_physiology FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily_physiology"
  ON daily_physiology FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient querying by user and date
CREATE INDEX idx_daily_physiology_user_date ON daily_physiology (user_id, date);
