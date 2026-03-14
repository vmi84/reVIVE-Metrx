-- Migration 003: device_imports table
CREATE TABLE device_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  rows_imported INTEGER DEFAULT 0,
  rows_skipped INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE device_imports ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own device_imports"
  ON device_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device_imports"
  ON device_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device_imports"
  ON device_imports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device_imports"
  ON device_imports FOR DELETE
  USING (auth.uid() = user_id);
