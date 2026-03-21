/**
 * HealthKit Queries — low-level data access functions.
 *
 * Each function queries a specific HealthKit data type for a date range
 * and returns raw results. Mappers convert these to canonical records.
 *
 * Note: react-native-health callback types don't always match our interfaces
 * exactly, so we use type assertions where needed.
 */

import AppleHealthKit from 'react-native-health';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HKSample {
  value: number;
  startDate: string;
  endDate: string;
  sourceId?: string;
  sourceName?: string;
}

export interface HKSleepSample {
  value: string; // 'INBED' | 'ASLEEP' | 'AWAKE' | 'CORE' | 'DEEP' | 'REM'
  startDate: string;
  endDate: string;
  sourceId?: string;
  sourceName?: string;
}

export interface HKWorkoutSample {
  activityId: number;
  activityName: string;
  start: string;
  end: string;
  duration: number; // minutes
  distance?: number; // meters
  calories?: number; // kcal
  sourceId?: string;
  sourceName?: string;
}

// ─── Query Options ───────────────────────────────────────────────────────────

function dateOptions(startDate: string, endDate: string) {
  return {
    startDate: new Date(startDate + 'T00:00:00').toISOString(),
    endDate: new Date(endDate + 'T23:59:59').toISOString(),
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Query HRV (SDNN) samples. */
export function queryHRV(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      { ...dateOptions(startDate, endDate), ascending: false },
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] HRV query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}

/** Query resting heart rate samples. */
export function queryRestingHeartRate(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getRestingHeartRateSamples(
      dateOptions(startDate, endDate),
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] RHR query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}

/** Query blood oxygen (SpO2) samples. */
export function queryOxygenSaturation(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getOxygenSaturationSamples(
      dateOptions(startDate, endDate),
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] SpO2 query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}

/** Query respiratory rate samples. */
export function queryRespiratoryRate(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getRespiratoryRateSamples(
      dateOptions(startDate, endDate),
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] RespiratoryRate query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}

/** Query heart rate samples (for workout HR zone calculation). */
export function queryHeartRate(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateSamples(
      { ...dateOptions(startDate, endDate), ascending: true },
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] HeartRate query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}

/** Query sleep analysis samples (includes staging on iOS 16+). */
export function querySleepAnalysis(startDate: string, endDate: string): Promise<HKSleepSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(
      dateOptions(startDate, endDate),
      (err: string, results: any[]) => {
        if (err) { reject(new Error(`[HealthKit] Sleep query failed: ${err}`)); return; }
        // Map HealthValue results to our HKSleepSample shape
        const samples: HKSleepSample[] = (results ?? []).map((r: any) => ({
          value: String(r.value ?? 'ASLEEP'),
          startDate: r.startDate,
          endDate: r.endDate,
          sourceId: r.sourceId,
          sourceName: r.sourceName,
        }));
        resolve(samples);
      },
    );
  });
}

/** Query workout samples. */
export function queryWorkouts(startDate: string, endDate: string): Promise<HKWorkoutSample[]> {
  return new Promise((resolve, reject) => {
    // Use getWorkoutSamples for proper workout data
    (AppleHealthKit as any).getSamples(
      {
        ...dateOptions(startDate, endDate),
        type: 'Workout' as any,
      },
      (err: string, results: any[]) => {
        if (err) { reject(new Error(`[HealthKit] Workout query failed: ${err}`)); return; }
        const samples: HKWorkoutSample[] = (results ?? []).map((r: any) => ({
          activityId: r.activityId ?? 0,
          activityName: r.activityName ?? 'Workout',
          start: r.start ?? r.startDate,
          end: r.end ?? r.endDate,
          duration: r.duration ?? 0,
          distance: r.distance,
          calories: r.calories,
          sourceId: r.sourceId,
          sourceName: r.sourceName,
        }));
        resolve(samples);
      },
    );
  });
}

/** Query body temperature samples. */
export function queryBodyTemperature(startDate: string, endDate: string): Promise<HKSample[]> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getBodyTemperatureSamples(
      dateOptions(startDate, endDate),
      (err: string, results: HKSample[]) => {
        if (err) { reject(new Error(`[HealthKit] Temperature query failed: ${err}`)); return; }
        resolve(results ?? []);
      },
    );
  });
}
