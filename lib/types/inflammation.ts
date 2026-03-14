/**
 * Inflammation marker types — lab-based, wearable-derived, and self-reported.
 */

export type MarkerCategory = 'lab' | 'wearable_proxy' | 'self_reported';

export interface InflammationMarkerDef {
  id: string;
  name: string;
  abbreviation: string;
  category: MarkerCategory;
  unit: string;
  normalLow: number | null;
  normalHigh: number | null;
  optimalLow: number | null;
  optimalHigh: number | null;
  description: string;
}

export interface InflammationEntry {
  id: string;
  userId: string;
  markerId: string;
  value: number;
  date: string;
  source: string;
  notes: string | null;
  createdAt: string;
}

export interface InflammationScore {
  score: number; // 0-100 (higher = more inflamed)
  level: 'low' | 'moderate' | 'elevated' | 'high';
  flags: string[];
  contributingFactors: string[];
}
