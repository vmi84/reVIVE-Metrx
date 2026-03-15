import { computeBaseline, computeAllBaselines, HistoricalDataPoint } from '../baseline-tracker';

function makeHistory(values: number[], startDate = '2024-01-01'): HistoricalDataPoint[] {
  return values.map((value, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    value,
  }));
}

describe('computeBaseline', () => {
  it('returns null when below min samples', () => {
    const history = makeHistory([60, 65, 70]);
    expect(computeBaseline(history, 21, 7)).toBeNull();
  });

  it('returns baseline when at min samples', () => {
    const history = makeHistory([60, 62, 64, 66, 68, 70, 72]);
    const result = computeBaseline(history, 21, 7);
    expect(result).not.toBeNull();
    expect(result!.sampleCount).toBe(7);
  });

  it('computes correct rolling mean', () => {
    const values = [60, 62, 64, 66, 68, 70, 72];
    const result = computeBaseline(makeHistory(values), 21, 7);
    expect(result!.rollingMean).toBeCloseTo(66, 0);
  });

  it('enforces SD floor of 0.01', () => {
    const sameValues = [50, 50, 50, 50, 50, 50, 50];
    const result = computeBaseline(makeHistory(sameValues), 21, 7);
    expect(result!.rollingSd).toBeGreaterThanOrEqual(0.01);
  });

  it('computes positive trend slope for ascending values', () => {
    const ascending = [60, 62, 64, 66, 68, 70, 72];
    const result = computeBaseline(makeHistory(ascending), 21, 7);
    expect(result!.trendSlope).toBeGreaterThan(0);
  });

  it('computes negative trend slope for descending values', () => {
    const descending = [72, 70, 68, 66, 64, 62, 60];
    const result = computeBaseline(makeHistory(descending), 21, 7);
    expect(result!.trendSlope).toBeLessThan(0);
  });

  it('takes most recent windowDays entries', () => {
    const history = makeHistory(Array.from({ length: 30 }, (_, i) => 50 + i));
    const result = computeBaseline(history, 21, 7);
    // Should use last 21 values (indices 9-29)
    expect(result!.sampleCount).toBe(21);
  });

  it('sets lastUpdated to most recent date', () => {
    const history = makeHistory([60, 62, 64, 66, 68, 70, 72]);
    const result = computeBaseline(history, 21, 7);
    expect(result!.lastUpdated).toBe('2024-01-07');
  });

  it('returns empty metric string', () => {
    const result = computeBaseline(makeHistory([1, 2, 3, 4, 5, 6, 7]), 21, 7);
    expect(result!.metric).toBe('');
  });

  it('uses default window of 21 days and min 7 samples', () => {
    const history = makeHistory(Array.from({ length: 7 }, () => 50));
    expect(computeBaseline(history)).not.toBeNull();
    expect(computeBaseline(history.slice(0, 6))).toBeNull();
  });
});

describe('computeAllBaselines', () => {
  function makePhysHistory(days: number) {
    return Array.from({ length: days }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      hrvRmssd: 60 + Math.random() * 10,
      restingHeartRate: 55 + Math.random() * 5,
      respiratoryRate: 15 + Math.random(),
      sleepDurationMs: 7 * 3600000 + Math.random() * 3600000,
      dayStrain: 10 + Math.random() * 5,
    }));
  }

  it('returns all null for insufficient data', () => {
    const result = computeAllBaselines(makePhysHistory(3));
    expect(result.hrv).toBeNull();
    expect(result.rhr).toBeNull();
    expect(result.respiratoryRate).toBeNull();
    expect(result.sleepDuration).toBeNull();
    expect(result.strain).toBeNull();
  });

  it('returns baselines for sufficient data', () => {
    const result = computeAllBaselines(makePhysHistory(21));
    expect(result.hrv).not.toBeNull();
    expect(result.rhr).not.toBeNull();
    expect(result.respiratoryRate).not.toBeNull();
    expect(result.sleepDuration).not.toBeNull();
    expect(result.strain).not.toBeNull();
  });

  it('sets correct metric names', () => {
    const result = computeAllBaselines(makePhysHistory(21));
    expect(result.hrv!.metric).toBe('hrv_rmssd');
    expect(result.rhr!.metric).toBe('resting_heart_rate');
    expect(result.respiratoryRate!.metric).toBe('respiratory_rate');
    expect(result.sleepDuration!.metric).toBe('sleep_duration_ms');
    expect(result.strain!.metric).toBe('day_strain');
  });

  it('filters null values from individual metrics', () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      hrvRmssd: i < 7 ? 60 : null, // only 7 valid
      restingHeartRate: null, // all null
      respiratoryRate: 15,
      sleepDurationMs: 7 * 3600000,
      dayStrain: 10,
    }));
    const result = computeAllBaselines(history);
    expect(result.hrv).not.toBeNull();
    expect(result.rhr).toBeNull(); // all null → insufficient
  });
});
