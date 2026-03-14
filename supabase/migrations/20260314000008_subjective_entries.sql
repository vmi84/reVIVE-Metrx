-- Migration 008: subjective_entries table
CREATE TABLE subjective_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'morning',
  subjective_stress REAL,
  perceived_fatigue REAL,
  soreness JSONB,
  stiffness REAL,
  heavy_legs BOOLEAN,
  pain_locations TEXT[],
  subjective_breathlessness REAL,
  perceived_exertion_mismatch BOOLEAN,
  subjective_sleep_quality REAL,
  late_caffeine BOOLEAN,
  late_alcohol BOOLEAN,
  late_heavy_meal BOOLEAN,
  hydration_glasses REAL,
  electrolytes_taken BOOLEAN,
  protein_adequate BOOLEAN,
  gi_disruption REAL,
  fasting BOOLEAN,
  motivation REAL,
  mood REAL,
  mental_fatigue REAL,
  willingness_to_train REAL,
  concentration REAL,
  is_traveling BOOLEAN,
  timezone_change REAL,
  illness_symptoms TEXT[],
  overall_energy REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subjective_entries ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own subjective_entries"
  ON subjective_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjective_entries"
  ON subjective_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjective_entries"
  ON subjective_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjective_entries"
  ON subjective_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient querying by user and date
CREATE INDEX idx_subjective_entries_user_date ON subjective_entries (user_id, date);
