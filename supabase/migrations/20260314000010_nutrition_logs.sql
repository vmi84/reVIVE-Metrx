-- Migration 010: nutrition_logs table
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT,
  description TEXT,
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  anti_inflammatory_score REAL,
  supplements TEXT[],
  hydration_ml REAL,
  electrolytes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own nutrition_logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition_logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition_logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition_logs"
  ON nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);
