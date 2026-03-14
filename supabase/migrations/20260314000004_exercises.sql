-- Migration 004: exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  energy_system TEXT NOT NULL,
  environment TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  hr_zone_target TEXT,
  strain_estimate REAL,
  recovery_cost REAL,
  travel_friendly BOOLEAN DEFAULT FALSE,
  body_systems_stressed TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
