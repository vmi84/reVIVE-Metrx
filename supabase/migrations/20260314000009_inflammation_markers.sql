-- Migration 009: inflammation_marker_defs and inflammation_entries tables
CREATE TABLE inflammation_marker_defs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  normal_low REAL,
  normal_high REAL,
  optimal_low REAL,
  optimal_high REAL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inflammation_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marker_id UUID NOT NULL REFERENCES inflammation_marker_defs(id),
  value REAL NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on inflammation_entries
ALTER TABLE inflammation_entries ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own inflammation_entries"
  ON inflammation_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inflammation_entries"
  ON inflammation_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inflammation_entries"
  ON inflammation_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inflammation_entries"
  ON inflammation_entries FOR DELETE
  USING (auth.uid() = user_id);
