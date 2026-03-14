-- Migration 011: recovery_logs table
CREATE TABLE recovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES recovery_protocols(id),
  date DATE NOT NULL,
  duration_minutes REAL NOT NULL,
  subjective_effectiveness REAL,
  next_day_iaci_change REAL,
  next_day_subsystem_changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own recovery_logs"
  ON recovery_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery_logs"
  ON recovery_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery_logs"
  ON recovery_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery_logs"
  ON recovery_logs FOR DELETE
  USING (auth.uid() = user_id);
