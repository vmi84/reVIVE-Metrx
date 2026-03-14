/**
 * Progress tracking, stall detection, and trend analysis types.
 */

export type StallType =
  | 'vo2max_plateau'
  | 'pace_stagnation'
  | 'hrv_stagnation'
  | 'training_monotony'
  | 'overreaching'
  | 'recovery_deficit'
  | 'none';

export interface TrendSnapshot {
  id: string;
  userId: string;
  date: string;
  period: '7d' | '21d' | '28d' | '90d';
  iaciTrend: number;
  subsystemTrends: Record<string, number>;
  trainingLoadAvg: number;
  acwr: number; // Acute:Chronic Workload Ratio
  monotony: number;
  strainAvg: number;
  inflammationTrend: number | null;
  createdAt: string;
}

export interface ProgressAssessment {
  id: string;
  userId: string;
  date: string;
  vo2maxTrend: number | null;
  thresholdPaceTrend: number | null;
  thresholdPowerTrend: number | null;
  hrvBaselineTrend: number;
  acwr: number;
  stallType: StallType;
  stallDurationDays: number | null;
  alternativeApproaches: string[];
  notes: string | null;
  createdAt: string;
}

export interface AthleteHistory {
  id: string;
  userId: string;
  date: string;
  periodType: 'monthly' | 'quarterly';
  vo2max: number | null;
  lactateThresholdHr: number | null;
  lactateThresholdPace: string | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  raceResults: RaceResult[];
  fitnessTests: FitnessTest[];
  notes: string | null;
  createdAt: string;
}

export interface RaceResult {
  eventName: string;
  distance: string;
  time: string;
  date: string;
  avgHr: number | null;
  notes: string | null;
}

export interface FitnessTest {
  testType: string;
  result: number;
  unit: string;
  date: string;
  notes: string | null;
}

export interface ACWR {
  acute: number; // 7-day rolling avg
  chronic: number; // 28-day rolling avg
  ratio: number;
  zone: 'undertraining' | 'sweet_spot' | 'danger' | 'overreaching';
}
