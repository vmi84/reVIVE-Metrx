import { assessQuality } from '../quality-scoring';
import { CanonicalPhysiologyRecord } from '../../types/canonical';

function makeEmptyRecord(): CanonicalPhysiologyRecord {
  return {
    date: '2024-01-15',
    source: 'whoop',
    dataQuality: 'low',
    sleep: {
      totalSleepMs: null, sleepPerformancePct: null, sleepConsistencyPct: null,
      remSleepMs: null, deepSleepMs: null, lightSleepMs: null,
      awakeDuringMs: null, sleepLatencyMs: null, sleepOnsetTime: null,
      wakeTime: null, awakenings: null, respiratoryRate: null,
      spo2Pct: null, skinTempDeviation: null,
    },
    cardiovascular: {
      hrvRmssd: null, restingHeartRate: null, respiratoryRate: null,
      spo2Pct: null, skinTempDeviation: null,
    },
    recovery: {
      recoveryScore: null, hrvRmssd: null, restingHeartRate: null,
      spo2Pct: null, skinTempDeviation: null, respiratoryRate: null,
    },
    workouts: [],
  };
}

function makeFullRecord(): CanonicalPhysiologyRecord {
  return {
    date: '2024-01-15',
    source: 'whoop',
    dataQuality: 'high',
    sleep: {
      totalSleepMs: 28800000, sleepPerformancePct: 85, sleepConsistencyPct: 90,
      remSleepMs: 7200000, deepSleepMs: 5400000, lightSleepMs: 14400000,
      awakeDuringMs: 1800000, sleepLatencyMs: 600000, sleepOnsetTime: '2024-01-14T22:00:00Z',
      wakeTime: '2024-01-15T06:00:00Z', awakenings: 2, respiratoryRate: 15,
      spo2Pct: 97, skinTempDeviation: 0.1,
    },
    cardiovascular: {
      hrvRmssd: 65, restingHeartRate: 55, respiratoryRate: 15,
      spo2Pct: 97, skinTempDeviation: 0.1,
    },
    recovery: {
      recoveryScore: 85, hrvRmssd: 65, restingHeartRate: 55,
      spo2Pct: 97, skinTempDeviation: 0.1, respiratoryRate: 15,
    },
    workouts: [],
  };
}

describe('assessQuality', () => {
  it('returns estimated for empty record', () => {
    const result = assessQuality(makeEmptyRecord());
    expect(result.tier).toBe('estimated');
    expect(result.metricsPresent).toHaveLength(0);
    expect(result.metricsMissing.length).toBeGreaterThan(0);
    expect(result.confidence).toBe(0);
  });

  it('returns high for complete record', () => {
    const result = assessQuality(makeFullRecord());
    expect(result.tier).toBe('high');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('confidence is between 0 and 1', () => {
    const result = assessQuality(makeFullRecord());
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('returns low when only some critical metrics present', () => {
    const record = makeEmptyRecord();
    record.recovery.hrvRmssd = 65;
    record.recovery.restingHeartRate = 55;
    const result = assessQuality(record);
    expect(result.tier).toBe('low');
  });

  it('returns medium with most critical and some important', () => {
    const record = makeEmptyRecord();
    // All critical
    record.recovery.hrvRmssd = 65;
    record.recovery.restingHeartRate = 55;
    record.sleep.totalSleepMs = 28800000;
    record.recovery.recoveryScore = 85;
    // Some important
    record.sleep.sleepPerformancePct = 85;
    record.sleep.remSleepMs = 7200000;
    record.sleep.deepSleepMs = 5400000;
    const result = assessQuality(record);
    expect(['medium', 'high']).toContain(result.tier);
  });

  it('lists present and missing metrics', () => {
    const record = makeEmptyRecord();
    record.recovery.hrvRmssd = 65;
    const result = assessQuality(record);
    expect(result.metricsPresent).toContain('recovery.hrvRmssd');
    expect(result.metricsMissing).toContain('recovery.restingHeartRate');
  });

  it('higher data completeness yields higher confidence', () => {
    const empty = assessQuality(makeEmptyRecord());
    const full = assessQuality(makeFullRecord());
    expect(full.confidence).toBeGreaterThan(empty.confidence);
  });

  it('partial record has intermediate confidence', () => {
    const record = makeEmptyRecord();
    record.recovery.hrvRmssd = 65;
    record.recovery.restingHeartRate = 55;
    record.sleep.totalSleepMs = 28800000;
    const result = assessQuality(record);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(1);
  });
});
