/**
 * Tests for HealthKit data mappers.
 *
 * Validates: sleep staging, SpO2 conversion, workout HR zones,
 * temperature deviation, null handling, and full record assembly.
 */

import {
  mapSleepSamples,
  mapWorkouts,
  mapCardiovascularMetrics,
  assembleRecord,
} from '../healthkit/mappers';
import type { HKSample, HKSleepSample, HKWorkoutSample } from '../healthkit/queries';

// ─── Sleep Mapping ───────────────────────────────────────────────────────────

describe('mapSleepSamples', () => {
  const date = '2026-03-20';

  it('returns empty metrics when no sleep samples exist', () => {
    const result = mapSleepSamples([], date);
    expect(result.totalSleepMs).toBeNull();
    expect(result.remSleepMs).toBeNull();
    expect(result.deepSleepMs).toBeNull();
  });

  it('maps iOS 16+ staged sleep correctly', () => {
    const samples: HKSleepSample[] = [
      { value: 'INBED', startDate: '2026-03-19T22:00:00Z', endDate: '2026-03-19T22:15:00Z' },
      { value: 'CORE', startDate: '2026-03-19T22:15:00Z', endDate: '2026-03-20T01:00:00Z' },
      { value: 'DEEP', startDate: '2026-03-20T01:00:00Z', endDate: '2026-03-20T02:30:00Z' },
      { value: 'REM', startDate: '2026-03-20T02:30:00Z', endDate: '2026-03-20T03:30:00Z' },
      { value: 'AWAKE', startDate: '2026-03-20T03:30:00Z', endDate: '2026-03-20T03:35:00Z' },
      { value: 'CORE', startDate: '2026-03-20T03:35:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];

    const result = mapSleepSamples(samples, date);

    // Core sleep: (01:00-22:15 = 2h45m) + (06:00-03:35 = 2h25m) = 5h10m
    expect(result.lightSleepMs).toBeGreaterThan(0); // Core maps to light
    expect(result.deepSleepMs).toBe(90 * 60 * 1000); // 1.5 hours
    expect(result.remSleepMs).toBe(60 * 60 * 1000); // 1 hour
    expect(result.awakeDuringMs).toBe(5 * 60 * 1000); // 5 minutes
    expect(result.awakenings).toBe(1);
    expect(result.totalSleepMs).toBeGreaterThan(0);

    // Sleep latency: 15 minutes from INBED to first CORE
    expect(result.sleepLatencyMs).toBe(15 * 60 * 1000);

    // Onset and wake times
    expect(result.sleepOnsetTime).toContain('2026-03-19T22:00');
    expect(result.wakeTime).toContain('2026-03-20T06:00');
  });

  it('maps iOS 15 non-staged sleep (ASLEEP only)', () => {
    const samples: HKSleepSample[] = [
      { value: 'INBED', startDate: '2026-03-19T23:00:00Z', endDate: '2026-03-19T23:20:00Z' },
      { value: 'ASLEEP', startDate: '2026-03-19T23:20:00Z', endDate: '2026-03-20T06:30:00Z' },
    ];

    const result = mapSleepSamples(samples, date);

    // Total sleep from ASLEEP: 7h10m
    const expectedMs = (7 * 60 + 10) * 60 * 1000;
    expect(result.totalSleepMs).toBe(expectedMs);

    // No staging on iOS 15
    expect(result.remSleepMs).toBeNull();
    expect(result.deepSleepMs).toBeNull();
    expect(result.lightSleepMs).toBeNull();

    // Sleep latency: 20 minutes
    expect(result.sleepLatencyMs).toBe(20 * 60 * 1000);
  });

  it('handles multiple awakenings', () => {
    const samples: HKSleepSample[] = [
      { value: 'CORE', startDate: '2026-03-19T23:00:00Z', endDate: '2026-03-20T02:00:00Z' },
      { value: 'AWAKE', startDate: '2026-03-20T02:00:00Z', endDate: '2026-03-20T02:10:00Z' },
      { value: 'DEEP', startDate: '2026-03-20T02:10:00Z', endDate: '2026-03-20T04:00:00Z' },
      { value: 'AWAKE', startDate: '2026-03-20T04:00:00Z', endDate: '2026-03-20T04:05:00Z' },
      { value: 'REM', startDate: '2026-03-20T04:05:00Z', endDate: '2026-03-20T05:30:00Z' },
    ];

    const result = mapSleepSamples(samples, date);
    expect(result.awakenings).toBe(2);
    expect(result.awakeDuringMs).toBe(15 * 60 * 1000); // 10 + 5 minutes
  });
});

// ─── Cardiovascular Mapping ──────────────────────────────────────────────────

describe('mapCardiovascularMetrics', () => {
  const date = '2026-03-20';

  it('maps HRV and RHR from latest sample', () => {
    const hrv: HKSample[] = [
      { value: 45, startDate: '2026-03-20T06:00:00Z', endDate: '2026-03-20T06:00:00Z' },
      { value: 52, startDate: '2026-03-20T07:00:00Z', endDate: '2026-03-20T07:00:00Z' },
    ];
    const rhr: HKSample[] = [
      { value: 58, startDate: '2026-03-20T06:00:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];

    const { cardiovascular, recovery } = mapCardiovascularMetrics(
      hrv, rhr, [], [], [], date,
    );

    expect(cardiovascular.hrvRmssd).toBe(52); // Latest sample
    expect(cardiovascular.restingHeartRate).toBe(58);
    expect(recovery.hrvRmssd).toBe(52);
    expect(recovery.restingHeartRate).toBe(58);
    expect(recovery.recoveryScore).toBeNull(); // IACI is the recovery score
  });

  it('converts SpO2 from fraction to percentage', () => {
    const spo2: HKSample[] = [
      { value: 0.97, startDate: '2026-03-20T06:00:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];

    const { cardiovascular } = mapCardiovascularMetrics(
      [], [], spo2, [], [], date,
    );

    expect(cardiovascular.spo2Pct).toBe(97); // 0.97 * 100
  });

  it('returns null for missing metrics', () => {
    const { cardiovascular, recovery } = mapCardiovascularMetrics(
      [], [], [], [], [], date,
    );

    expect(cardiovascular.hrvRmssd).toBeNull();
    expect(cardiovascular.restingHeartRate).toBeNull();
    expect(cardiovascular.spo2Pct).toBeNull();
    expect(cardiovascular.respiratoryRate).toBeNull();
    expect(cardiovascular.skinTempDeviation).toBeNull();
    expect(recovery.recoveryScore).toBeNull();
  });
});

// ─── Workout Mapping ─────────────────────────────────────────────────────────

describe('mapWorkouts', () => {
  const date = '2026-03-20';

  it('maps workout with HR data', () => {
    const workouts: HKWorkoutSample[] = [
      {
        activityId: 37,
        activityName: 'Running',
        start: '2026-03-20T07:00:00Z',
        end: '2026-03-20T07:45:00Z',
        duration: 45,
        calories: 420,
      },
    ];

    const hrSamples: HKSample[] = [
      { value: 130, startDate: '2026-03-20T07:05:00Z', endDate: '2026-03-20T07:05:00Z' },
      { value: 155, startDate: '2026-03-20T07:20:00Z', endDate: '2026-03-20T07:20:00Z' },
      { value: 170, startDate: '2026-03-20T07:35:00Z', endDate: '2026-03-20T07:35:00Z' },
    ];

    const result = mapWorkouts(workouts, hrSamples, date);

    expect(result).toHaveLength(1);
    expect(result[0].workoutType).toBe('Running');
    expect(result[0].durationMs).toBe(45 * 60 * 1000);
    expect(result[0].caloriesBurned).toBe(420);
    expect(result[0].avgHeartRate).toBe(152); // avg(130, 155, 170)
    expect(result[0].maxHeartRate).toBe(170);
    expect(result[0].strainScore).toBeNull(); // HealthKit doesn't compute strain
  });

  it('computes HR zones with maxHR', () => {
    const workouts: HKWorkoutSample[] = [
      {
        activityId: 37,
        activityName: 'Running',
        start: '2026-03-20T07:00:00Z',
        end: '2026-03-20T07:30:00Z',
        duration: 30,
        calories: 300,
      },
    ];

    // Simulate heart rate samples in zone 2 (60-70% of max HR 190)
    const hrSamples: HKSample[] = Array.from({ length: 10 }, (_, i) => ({
      value: 120 + i, // 120-129 BPM (~63-68% of 190)
      startDate: `2026-03-20T07:${String(i * 3).padStart(2, '0')}:00Z`,
      endDate: `2026-03-20T07:${String(i * 3).padStart(2, '0')}:00Z`,
    }));

    const result = mapWorkouts(workouts, hrSamples, date, 190);

    expect(result[0].hrZones).not.toBeNull();
    expect(result[0].hrZones!.zone2Ms).toBeGreaterThan(0); // Most time in zone 2
  });

  it('returns empty for date with no workouts', () => {
    const result = mapWorkouts([], [], date);
    expect(result).toHaveLength(0);
  });
});

// ─── Full Record Assembly ────────────────────────────────────────────────────

describe('assembleRecord', () => {
  const date = '2026-03-20';

  it('assembles a complete record from all data types', () => {
    const sleepSamples: HKSleepSample[] = [
      { value: 'ASLEEP', startDate: '2026-03-19T23:00:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];
    const hrvSamples: HKSample[] = [
      { value: 48, startDate: '2026-03-20T06:00:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];
    const rhrSamples: HKSample[] = [
      { value: 55, startDate: '2026-03-20T06:00:00Z', endDate: '2026-03-20T06:00:00Z' },
    ];

    const record = assembleRecord(
      date, sleepSamples, hrvSamples, rhrSamples, [], [], [], [], [],
    );

    expect(record.date).toBe(date);
    expect(record.source).toBe('apple_health');
    expect(record.recovery.hrvRmssd).toBe(48);
    expect(record.recovery.restingHeartRate).toBe(55);
    expect(record.recovery.recoveryScore).toBeNull();
    expect(record.sleep.totalSleepMs).toBe(7 * 60 * 60 * 1000);
    expect(record.cardiovascular.hrvRmssd).toBe(48);
  });

  it('returns record with nulls when no data is available', () => {
    const record = assembleRecord(date, [], [], [], [], [], [], [], []);

    expect(record.source).toBe('apple_health');
    expect(record.recovery.hrvRmssd).toBeNull();
    expect(record.sleep.totalSleepMs).toBeNull();
    expect(record.workouts).toHaveLength(0);
  });
});
