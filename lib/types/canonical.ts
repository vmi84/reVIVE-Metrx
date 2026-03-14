/**
 * Canonical Physiology Record — the normalized data model all wearable adapters map to.
 * Device-agnostic; each adapter converts raw device data into this shape.
 */

export interface SleepMetrics {
  totalSleepMs: number | null;
  sleepPerformancePct: number | null;
  sleepConsistencyPct: number | null;
  remSleepMs: number | null;
  deepSleepMs: number | null;
  lightSleepMs: number | null;
  awakeDuringMs: number | null;
  sleepLatencyMs: number | null;
  sleepOnsetTime: string | null;
  wakeTime: string | null;
  awakenings: number | null;
  respiratoryRate: number | null;
  spo2Pct: number | null;
  skinTempDeviation: number | null;
}

export interface CardiovascularMetrics {
  hrvRmssd: number | null;
  restingHeartRate: number | null;
  respiratoryRate: number | null;
  spo2Pct: number | null;
  skinTempDeviation: number | null;
}

export interface WorkoutMetrics {
  workoutId: string;
  workoutType: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  strainScore: number | null;
  caloriesBurned: number | null;
  hrZones: HrZoneDistribution | null;
}

export interface HrZoneDistribution {
  zone1Ms: number;
  zone2Ms: number;
  zone3Ms: number;
  zone4Ms: number;
  zone5Ms: number;
}

export interface RecoveryMetrics {
  recoveryScore: number | null;
  hrvRmssd: number | null;
  restingHeartRate: number | null;
  spo2Pct: number | null;
  skinTempDeviation: number | null;
  respiratoryRate: number | null;
}

export interface CanonicalPhysiologyRecord {
  date: string; // YYYY-MM-DD
  source: string; // 'whoop' | 'garmin' | 'oura' | etc.
  dataQuality: DataQualityTier;

  sleep: SleepMetrics;
  cardiovascular: CardiovascularMetrics;
  recovery: RecoveryMetrics;
  workouts: WorkoutMetrics[];
}

export type DataQualityTier = 'high' | 'medium' | 'low' | 'estimated';

export interface DataQualityReport {
  tier: DataQualityTier;
  metricsPresent: string[];
  metricsMissing: string[];
  confidence: number; // 0-1
}
