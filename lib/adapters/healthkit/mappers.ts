/**
 * HealthKit Mappers — convert raw HealthKit query results to CanonicalPhysiologyRecords.
 *
 * Handles:
 * - Sleep staging (iOS 16+ deep/REM/core/awake, iOS 15 asleep-only fallback)
 * - SpO2 fraction → percentage conversion
 * - Daily aggregation (multiple samples per day → single canonical record)
 * - Workout HR zone calculation from heart rate samples
 * - Body temperature baseline deviation
 */

import {
  CanonicalPhysiologyRecord,
  SleepMetrics,
  CardiovascularMetrics,
  RecoveryMetrics,
  WorkoutMetrics,
  HrZoneDistribution,
} from '../../types/canonical';
import type { HKSample, HKSleepSample, HKWorkoutSample } from './queries';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract YYYY-MM-DD from an ISO date string. */
function dateKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/** Group samples by date. */
function groupByDate<T extends { startDate?: string; start?: string }>(
  samples: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const s of samples) {
    const date = dateKey((s.startDate ?? s.start) as string);
    const existing = map.get(date) ?? [];
    existing.push(s);
    map.set(date, existing);
  }
  return map;
}

/** Average of numbers, ignoring nulls. */
function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Get most recent value for a date from samples. */
function latestValueForDate(samples: HKSample[], date: string): number | null {
  const daySamples = samples.filter(s => dateKey(s.startDate) === date);
  if (daySamples.length === 0) return null;
  // Sort by date descending, take the most recent
  daySamples.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  return daySamples[0].value;
}

/** Average value for a date from samples. */
function avgValueForDate(samples: HKSample[], date: string): number | null {
  const values = samples
    .filter(s => dateKey(s.startDate) === date)
    .map(s => s.value);
  return avg(values);
}

// ─── Sleep Mapping ───────────────────────────────────────────────────────────

/**
 * Map HealthKit sleep analysis samples to SleepMetrics for a given date.
 *
 * Sleep sessions are attributed to the date they END on (wake date).
 * iOS 16+ provides staged sleep (CORE, DEEP, REM, AWAKE).
 * iOS 15 only provides ASLEEP/INBED/AWAKE.
 */
export function mapSleepSamples(
  sleepSamples: HKSleepSample[],
  date: string,
): SleepMetrics {
  const empty: SleepMetrics = {
    totalSleepMs: null,
    sleepPerformancePct: null,
    sleepConsistencyPct: null,
    remSleepMs: null,
    deepSleepMs: null,
    lightSleepMs: null,
    awakeDuringMs: null,
    sleepLatencyMs: null,
    sleepOnsetTime: null,
    wakeTime: null,
    awakenings: null,
    respiratoryRate: null,
    spo2Pct: null,
    skinTempDeviation: null,
  };

  // Filter sleep samples for this night.
  // Sleep is attributed to the date you wake up on.
  // Include samples that: end on this date OR start on the previous evening.
  const prevDate = daysAgoStr(date, 1);
  const relevant = sleepSamples.filter(s => {
    const sEnd = dateKey(s.endDate);
    const sStart = dateKey(s.startDate);
    return sEnd === date || sStart === prevDate;
  });

  if (relevant.length === 0) return empty;

  let coreSleepMs = 0;
  let deepSleepMs = 0;
  let remSleepMs = 0;
  let awakeDuringMs = 0;
  let asleepMs = 0; // iOS 15 fallback
  let inBedMs = 0;
  let awakenings = 0;
  let hasStaging = false;

  let earliestInBed: Date | null = null;
  let earliestAsleep: Date | null = null;
  let latestWake: Date | null = null;

  for (const sample of relevant) {
    const start = new Date(sample.startDate);
    const end = new Date(sample.endDate);
    const durationMs = end.getTime() - start.getTime();
    const val = sample.value.toUpperCase();

    switch (val) {
      case 'CORE':
        coreSleepMs += durationMs;
        hasStaging = true;
        if (!earliestAsleep || start < earliestAsleep) earliestAsleep = start;
        if (!latestWake || end > latestWake) latestWake = end;
        break;
      case 'DEEP':
        deepSleepMs += durationMs;
        hasStaging = true;
        if (!earliestAsleep || start < earliestAsleep) earliestAsleep = start;
        if (!latestWake || end > latestWake) latestWake = end;
        break;
      case 'REM':
        remSleepMs += durationMs;
        hasStaging = true;
        if (!earliestAsleep || start < earliestAsleep) earliestAsleep = start;
        if (!latestWake || end > latestWake) latestWake = end;
        break;
      case 'AWAKE':
        awakeDuringMs += durationMs;
        awakenings++;
        break;
      case 'ASLEEP':
        asleepMs += durationMs;
        if (!earliestAsleep || start < earliestAsleep) earliestAsleep = start;
        if (!latestWake || end > latestWake) latestWake = end;
        break;
      case 'INBED':
        inBedMs += durationMs;
        if (!earliestInBed || start < earliestInBed) earliestInBed = start;
        if (!latestWake || end > latestWake) latestWake = end;
        break;
    }
  }

  // Compute total sleep
  let totalSleepMs: number;
  if (hasStaging) {
    totalSleepMs = coreSleepMs + deepSleepMs + remSleepMs;
  } else if (asleepMs > 0) {
    totalSleepMs = asleepMs;
  } else {
    return empty;
  }

  // Sleep latency: time from first InBed to first Asleep
  let sleepLatencyMs: number | null = null;
  if (earliestInBed && earliestAsleep) {
    const latency = earliestAsleep.getTime() - earliestInBed.getTime();
    if (latency > 0) sleepLatencyMs = latency;
  }

  return {
    totalSleepMs,
    sleepPerformancePct: null, // HealthKit doesn't provide
    sleepConsistencyPct: null, // HealthKit doesn't provide
    remSleepMs: hasStaging ? remSleepMs : null,
    deepSleepMs: hasStaging ? deepSleepMs : null,
    lightSleepMs: hasStaging ? coreSleepMs : null, // Apple "Core" = light sleep
    awakeDuringMs: awakeDuringMs > 0 ? awakeDuringMs : null,
    sleepLatencyMs,
    sleepOnsetTime: (earliestInBed ?? earliestAsleep)?.toISOString() ?? null,
    wakeTime: latestWake?.toISOString() ?? null,
    awakenings: awakenings > 0 ? awakenings : null,
    respiratoryRate: null, // Filled separately
    spo2Pct: null,         // Filled separately
    skinTempDeviation: null, // Filled separately
  };
}

// ─── Workout Mapping ─────────────────────────────────────────────────────────

/** Map HealthKit workout activity ID to human-readable name. */
const ACTIVITY_MAP: Record<number, string> = {
  37: 'Running',
  13: 'Cycling',
  46: 'Swimming',
  20: 'Functional Training',
  25: 'HIIT',
  50: 'Walking',
  52: 'Yoga',
  35: 'Rowing',
  16: 'Elliptical',
  24: 'Hiking',
  33: 'Pilates',
  56: 'Stair Climbing',
  63: 'Strength Training',
  1:  'Mixed Cardio',
  3000: 'Other',
};

/**
 * Map HealthKit workouts to WorkoutMetrics for a given date.
 * Heart rate samples are used to compute avg/max HR and zone distribution.
 */
export function mapWorkouts(
  workouts: HKWorkoutSample[],
  hrSamples: HKSample[],
  date: string,
  maxHR?: number,
): WorkoutMetrics[] {
  const dayWorkouts = workouts.filter(w => dateKey(w.start) === date);
  if (dayWorkouts.length === 0) return [];

  return dayWorkouts.map((w, idx) => {
    const startMs = new Date(w.start).getTime();
    const endMs = new Date(w.end).getTime();
    const durationMs = endMs - startMs;

    // Filter HR samples within this workout window
    const workoutHR = hrSamples.filter(hr => {
      const hrTime = new Date(hr.startDate).getTime();
      return hrTime >= startMs && hrTime <= endMs;
    });

    const hrValues = workoutHR.map(h => h.value);
    const avgHR = hrValues.length > 0
      ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
      : null;
    const maxHRValue = hrValues.length > 0
      ? Math.max(...hrValues)
      : null;

    // Compute HR zones if we have max HR and HR samples
    let hrZones: HrZoneDistribution | null = null;
    if (maxHR && workoutHR.length > 0) {
      hrZones = computeHRZones(workoutHR, maxHR);
    }

    return {
      workoutId: `hk-${date}-${idx}`,
      workoutType: w.activityName || ACTIVITY_MAP[w.activityId] || 'Workout',
      startTime: w.start,
      endTime: w.end,
      durationMs,
      avgHeartRate: avgHR,
      maxHeartRate: maxHRValue ? Math.round(maxHRValue) : null,
      strainScore: null, // HealthKit doesn't compute strain
      caloriesBurned: w.calories ? Math.round(w.calories) : null,
      hrZones,
    };
  });
}

/**
 * Compute 5-zone HR distribution from heart rate samples.
 * Uses standard percentage-of-max zones.
 */
function computeHRZones(
  hrSamples: HKSample[],
  maxHR: number,
): HrZoneDistribution {
  const zones = { zone1Ms: 0, zone2Ms: 0, zone3Ms: 0, zone4Ms: 0, zone5Ms: 0 };

  // Estimate time per sample (assume 5-second intervals between samples)
  const sampleDurationMs = 5000;

  for (const sample of hrSamples) {
    const pct = sample.value / maxHR;
    if (pct < 0.6) zones.zone1Ms += sampleDurationMs;
    else if (pct < 0.7) zones.zone2Ms += sampleDurationMs;
    else if (pct < 0.8) zones.zone3Ms += sampleDurationMs;
    else if (pct < 0.9) zones.zone4Ms += sampleDurationMs;
    else zones.zone5Ms += sampleDurationMs;
  }

  return zones;
}

// ─── Recovery/Cardiovascular Mapping ─────────────────────────────────────────

/**
 * Build cardiovascular and recovery metrics for a date from individual queries.
 */
export function mapCardiovascularMetrics(
  hrvSamples: HKSample[],
  rhrSamples: HKSample[],
  spo2Samples: HKSample[],
  respRateSamples: HKSample[],
  tempSamples: HKSample[],
  date: string,
): { cardiovascular: CardiovascularMetrics; recovery: RecoveryMetrics } {
  // HRV: latest value (Apple Watch reports SDNN)
  const hrv = latestValueForDate(hrvSamples, date);

  // RHR: latest value
  const rhr = latestValueForDate(rhrSamples, date);

  // SpO2: Apple reports as fraction (0-1), convert to percentage
  const spo2Raw = latestValueForDate(spo2Samples, date);
  const spo2 = spo2Raw != null ? Math.round(spo2Raw * 100) : null;

  // Respiratory rate: average
  const respRate = avgValueForDate(respRateSamples, date);

  // Temperature: compute deviation from 7-day baseline
  const skinTempDev = computeTempDeviation(tempSamples, date);

  const cardiovascular: CardiovascularMetrics = {
    hrvRmssd: hrv, // SDNN stored in hrvRmssd field (see plan notes)
    restingHeartRate: rhr,
    respiratoryRate: respRate ? Math.round(respRate * 10) / 10 : null,
    spo2Pct: spo2,
    skinTempDeviation: skinTempDev,
  };

  const recovery: RecoveryMetrics = {
    recoveryScore: null, // IACI is the recovery score
    hrvRmssd: hrv,
    restingHeartRate: rhr,
    spo2Pct: spo2,
    skinTempDeviation: skinTempDev,
    respiratoryRate: respRate ? Math.round(respRate * 10) / 10 : null,
  };

  return { cardiovascular, recovery };
}

/**
 * Compute temperature deviation from a 7-day rolling baseline.
 */
function computeTempDeviation(
  tempSamples: HKSample[],
  date: string,
): number | null {
  if (tempSamples.length === 0) return null;

  const todayTemp = latestValueForDate(tempSamples, date);
  if (todayTemp == null) return null;

  // Get last 7 days of readings for baseline
  const baselineReadings: number[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = daysAgoStr(date, i);
    const val = latestValueForDate(tempSamples, d);
    if (val != null) baselineReadings.push(val);
  }

  if (baselineReadings.length < 3) return null; // Need at least 3 days for a meaningful baseline

  const baseline = baselineReadings.reduce((a, b) => a + b, 0) / baselineReadings.length;
  return Math.round((todayTemp - baseline) * 100) / 100;
}

// ─── Full Day Assembly ───────────────────────────────────────────────────────

/**
 * Assemble a complete CanonicalPhysiologyRecord for one date from all query results.
 */
export function assembleRecord(
  date: string,
  sleepSamples: HKSleepSample[],
  hrvSamples: HKSample[],
  rhrSamples: HKSample[],
  spo2Samples: HKSample[],
  respRateSamples: HKSample[],
  tempSamples: HKSample[],
  workouts: HKWorkoutSample[],
  hrSamples: HKSample[],
  maxHR?: number,
): CanonicalPhysiologyRecord {
  const sleep = mapSleepSamples(sleepSamples, date);
  const { cardiovascular, recovery } = mapCardiovascularMetrics(
    hrvSamples, rhrSamples, spo2Samples, respRateSamples, tempSamples, date,
  );
  const workoutMetrics = mapWorkouts(workouts, hrSamples, date, maxHR);

  // Merge respiratory rate into sleep if available
  if (cardiovascular.respiratoryRate != null) {
    sleep.respiratoryRate = cardiovascular.respiratoryRate;
  }
  if (cardiovascular.spo2Pct != null) {
    sleep.spo2Pct = cardiovascular.spo2Pct;
  }
  if (cardiovascular.skinTempDeviation != null) {
    sleep.skinTempDeviation = cardiovascular.skinTempDeviation;
  }

  return {
    date,
    source: 'apple_health',
    dataQuality: 'low', // Will be reassessed by quality-scoring.ts
    sleep,
    cardiovascular,
    recovery,
    workouts: workoutMetrics,
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Get YYYY-MM-DD string for N days before the given date string. */
function daysAgoStr(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}
