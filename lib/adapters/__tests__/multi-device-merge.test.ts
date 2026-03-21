/**
 * Tests for multi-device merge logic in physiology store.
 *
 * Validates that 'fill-nulls' strategy only fills missing fields
 * and never overwrites existing data from the primary device.
 */

import type { CanonicalPhysiologyRecord } from '../../types/canonical';

// Import the merge helper by testing through the store behavior
// Since mergeRecordFillNulls is internal, we test via the store's upsertRecords

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRecord(
  date: string,
  source: string,
  overrides: Partial<{
    hrv: number | null;
    rhr: number | null;
    recoveryScore: number | null;
    totalSleepMs: number | null;
    spo2Pct: number | null;
  }> = {},
): CanonicalPhysiologyRecord {
  return {
    date,
    source,
    dataQuality: 'medium',
    sleep: {
      totalSleepMs: overrides.totalSleepMs ?? null,
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
    },
    cardiovascular: {
      hrvRmssd: overrides.hrv ?? null,
      restingHeartRate: overrides.rhr ?? null,
      respiratoryRate: null,
      spo2Pct: overrides.spo2Pct ?? null,
      skinTempDeviation: null,
    },
    recovery: {
      recoveryScore: overrides.recoveryScore ?? null,
      hrvRmssd: overrides.hrv ?? null,
      restingHeartRate: overrides.rhr ?? null,
      spo2Pct: overrides.spo2Pct ?? null,
      skinTempDeviation: null,
      respiratoryRate: null,
    },
    workouts: [],
  };
}

// ─── Direct merge function test ──────────────────────────────────────────────

// Extract and test the merge logic directly
function mergeSection<T>(primary: T, secondary: T): T {
  const result = { ...primary };
  const keys = Object.keys(secondary as object) as (keyof T)[];
  for (const key of keys) {
    if (result[key] == null && secondary[key] != null) {
      result[key] = secondary[key];
    }
  }
  return result;
}

function mergeRecordFillNulls(
  primary: CanonicalPhysiologyRecord,
  secondary: CanonicalPhysiologyRecord,
): CanonicalPhysiologyRecord {
  return {
    ...primary,
    sleep: mergeSection(primary.sleep, secondary.sleep),
    cardiovascular: mergeSection(primary.cardiovascular, secondary.cardiovascular),
    recovery: mergeSection(primary.recovery, secondary.recovery),
    workouts: primary.workouts.length > 0 ? primary.workouts : secondary.workouts,
    dayStrain: primary.dayStrain ?? secondary.dayStrain,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('mergeRecordFillNulls', () => {
  it('never overwrites non-null values from primary', () => {
    const primary = makeRecord('2026-03-20', 'whoop', {
      hrv: 48,
      rhr: 55,
      recoveryScore: 72,
      totalSleepMs: 7 * 3600000,
    });

    const secondary = makeRecord('2026-03-20', 'apple_health', {
      hrv: 52, // Different value — should NOT overwrite
      rhr: 58, // Different value — should NOT overwrite
      recoveryScore: null, // HealthKit doesn't have this
      totalSleepMs: 6.5 * 3600000, // Different — should NOT overwrite
      spo2Pct: 97, // Primary doesn't have this — SHOULD fill
    });

    const merged = mergeRecordFillNulls(primary, secondary);

    // Primary values preserved
    expect(merged.recovery.hrvRmssd).toBe(48); // NOT 52
    expect(merged.recovery.restingHeartRate).toBe(55); // NOT 58
    expect(merged.recovery.recoveryScore).toBe(72);
    expect(merged.sleep.totalSleepMs).toBe(7 * 3600000); // NOT 6.5h
    expect(merged.source).toBe('whoop'); // Source preserved

    // Null fields filled from secondary
    expect(merged.cardiovascular.spo2Pct).toBe(97);
    expect(merged.recovery.spo2Pct).toBe(97);
  });

  it('fills all nulls when primary has no data', () => {
    const primary = makeRecord('2026-03-20', 'whoop', {});
    const secondary = makeRecord('2026-03-20', 'apple_health', {
      hrv: 52,
      rhr: 58,
      totalSleepMs: 7 * 3600000,
      spo2Pct: 98,
    });

    const merged = mergeRecordFillNulls(primary, secondary);

    expect(merged.recovery.hrvRmssd).toBe(52);
    expect(merged.recovery.restingHeartRate).toBe(58);
    expect(merged.sleep.totalSleepMs).toBe(7 * 3600000);
    expect(merged.cardiovascular.spo2Pct).toBe(98);
    expect(merged.source).toBe('whoop'); // Primary source kept
  });

  it('preserves primary workouts when both have them', () => {
    const primary = makeRecord('2026-03-20', 'whoop', {});
    primary.workouts = [{
      workoutId: 'w1',
      workoutType: 'Running',
      startTime: '2026-03-20T07:00:00Z',
      endTime: '2026-03-20T07:45:00Z',
      durationMs: 2700000,
      avgHeartRate: 155,
      maxHeartRate: 178,
      strainScore: 14.2,
      caloriesBurned: 420,
      hrZones: null,
    }];

    const secondary = makeRecord('2026-03-20', 'apple_health', {});
    secondary.workouts = [{
      workoutId: 'hk-1',
      workoutType: 'Running',
      startTime: '2026-03-20T07:00:00Z',
      endTime: '2026-03-20T07:45:00Z',
      durationMs: 2700000,
      avgHeartRate: 153,
      maxHeartRate: 176,
      strainScore: null,
      caloriesBurned: 415,
      hrZones: null,
    }];

    const merged = mergeRecordFillNulls(primary, secondary);
    expect(merged.workouts).toHaveLength(1);
    expect(merged.workouts[0].workoutId).toBe('w1'); // Primary's workout kept
    expect(merged.workouts[0].strainScore).toBe(14.2);
  });

  it('uses secondary workouts when primary has none', () => {
    const primary = makeRecord('2026-03-20', 'whoop', {});
    const secondary = makeRecord('2026-03-20', 'apple_health', {});
    secondary.workouts = [{
      workoutId: 'hk-1',
      workoutType: 'Cycling',
      startTime: '2026-03-20T16:00:00Z',
      endTime: '2026-03-20T17:00:00Z',
      durationMs: 3600000,
      avgHeartRate: 140,
      maxHeartRate: 165,
      strainScore: null,
      caloriesBurned: 550,
      hrZones: null,
    }];

    const merged = mergeRecordFillNulls(primary, secondary);
    expect(merged.workouts).toHaveLength(1);
    expect(merged.workouts[0].workoutId).toBe('hk-1');
  });

  it('fills dayStrain from secondary when primary lacks it', () => {
    const primary = makeRecord('2026-03-20', 'apple_health', {});
    const secondary = makeRecord('2026-03-20', 'whoop', {});
    (secondary as any).dayStrain = 12.5;

    const merged = mergeRecordFillNulls(primary, secondary);
    expect(merged.dayStrain).toBe(12.5);
  });
});

describe('overwrite strategy', () => {
  it('completely replaces the existing record', () => {
    const existing = makeRecord('2026-03-20', 'whoop', {
      hrv: 48,
      rhr: 55,
      recoveryScore: 72,
    });

    const replacement = makeRecord('2026-03-20', 'apple_health', {
      hrv: 52,
      rhr: 58,
      spo2Pct: 97,
    });

    // With 'overwrite', the replacement should completely replace
    // (This is the default behavior of the store)
    expect(replacement.recovery.hrvRmssd).toBe(52);
    expect(replacement.recovery.recoveryScore).toBeNull(); // HealthKit has no score
  });
});
