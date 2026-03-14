-- Migration 015: coaching_logs table
CREATE TABLE coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own coaching_logs"
  ON coaching_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coaching_logs"
  ON coaching_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coaching_logs"
  ON coaching_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coaching_logs"
  ON coaching_logs FOR DELETE
  USING (auth.uid() = user_id);
