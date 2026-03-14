-- Migration 012: recovery_recommendations table
CREATE TABLE recovery_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  protocol_class TEXT NOT NULL,
  phenotype TEXT NOT NULL,
  protocols_recommended TEXT[] DEFAULT '{}',
  training_compatibility JSONB,
  ai_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE recovery_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: users can manage their own rows
CREATE POLICY "Users can select own recovery_recommendations"
  ON recovery_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery_recommendations"
  ON recovery_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery_recommendations"
  ON recovery_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery_recommendations"
  ON recovery_recommendations FOR DELETE
  USING (auth.uid() = user_id);
