-- Migration 013: trend_snapshots table
CREATE TABLE trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  period TEXT NOT NULL,
  iaci_trend REAL NOT NULL,
  subsystem_trends JSONB NOT NULL,
  training_load_avg REAL NOT NULL,
  acwr REAL NOT NULL,
  monotony REAL NOT NULL,
  strain_avg REAL NOT NULL,
  inflammation_trend REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own trend_snapshots"
  ON trend_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trend_snapshots"
  ON trend_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trend_snapshots"
  ON trend_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trend_snapshots"
  ON trend_snapshots FOR DELETE
  USING (auth.uid() = user_id);
