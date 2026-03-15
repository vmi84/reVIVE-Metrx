import { analyzeTrends, computeRollingAverages, DailyMetric } from '../trend-analyzer';

function makeDailyMetrics(count: number, iaciBase = 70, ascending = false): DailyMetric[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    iaciScore: ascending ? iaciBase + i : iaciBase,
    subsystemScores: { autonomic: 75, musculoskeletal: 70 },
    strain: 10 + (i % 3),
    inflammationScore: i % 2 === 0 ? 30 : null,
  }));
}

describe('analyzeTrends', () => {
  it('returns zeros for empty history', () => {
    const result = analyzeTrends([], '7d');
    expect(result.iaciTrend).toBe(0);
    expect(result.trainingLoadAvg).toBe(0);
    expect(result.strainAvg).toBe(0);
    expect(result.inflammationTrend).toBeNull();
    expect(result.period).toBe('7d');
  });

  it('slices to correct period length', () => {
    const history = makeDailyMetrics(30);
    const result7 = analyzeTrends(history, '7d');
    const result28 = analyzeTrends(history, '28d');
    expect(result7.period).toBe('7d');
    expect(result28.period).toBe('28d');
  });

  it('computes positive IACI trend for ascending scores', () => {
    const history = makeDailyMetrics(7, 60, true);
    const result = analyzeTrends(history, '7d');
    expect(result.iaciTrend).toBeGreaterThan(0);
  });

  it('computes near-zero trend for flat scores', () => {
    const history = makeDailyMetrics(7);
    const result = analyzeTrends(history, '7d');
    expect(Math.abs(result.iaciTrend)).toBeLessThan(0.1);
  });

  it('computes subsystem trends', () => {
    const history = makeDailyMetrics(7);
    const result = analyzeTrends(history, '7d');
    expect(result.subsystemTrends).toHaveProperty('autonomic');
    expect(result.subsystemTrends).toHaveProperty('musculoskeletal');
  });

  it('computes strain average', () => {
    const history = makeDailyMetrics(7);
    const result = analyzeTrends(history, '7d');
    expect(result.strainAvg).toBeGreaterThan(0);
  });

  it('returns null inflammation trend with <3 samples', () => {
    const history: DailyMetric[] = [
      { date: '2024-01-01', iaciScore: 70, subsystemScores: {}, strain: 10, inflammationScore: 30 },
      { date: '2024-01-02', iaciScore: 72, subsystemScores: {}, strain: 11, inflammationScore: null },
    ];
    const result = analyzeTrends(history, '7d');
    expect(result.inflammationTrend).toBeNull();
  });

  it('computes inflammation trend with >=3 samples', () => {
    const history: DailyMetric[] = Array.from({ length: 5 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      iaciScore: 70,
      subsystemScores: {},
      strain: 10,
      inflammationScore: 20 + i * 5,
    }));
    const result = analyzeTrends(history, '7d');
    expect(result.inflammationTrend).not.toBeNull();
    expect(result.inflammationTrend!).toBeGreaterThan(0);
  });

  it('handles different period sizes', () => {
    const history = makeDailyMetrics(100);
    const r7 = analyzeTrends(history, '7d');
    const r90 = analyzeTrends(history, '90d');
    expect(r7.period).toBe('7d');
    expect(r90.period).toBe('90d');
  });
});

describe('computeRollingAverages', () => {
  it('returns EMA and SMA values', () => {
    const values = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
    const result = computeRollingAverages(values);
    expect(result.ema7).toBeGreaterThan(0);
    expect(result.ema21).toBeGreaterThan(0);
    expect(result.sma28).toBeGreaterThan(0);
  });

  it('EMA7 responds more to recent values than EMA21', () => {
    const values = Array.from({ length: 30 }, (_, i) => i < 25 ? 10 : 50);
    const result = computeRollingAverages(values);
    // EMA7 (alpha=0.3 on last 7) should be higher than EMA21 (alpha=0.1 on last 21)
    expect(result.ema7).toBeGreaterThan(result.ema21);
  });

  it('SMA28 is simple mean of last 28', () => {
    const values = Array.from({ length: 28 }, () => 10);
    const result = computeRollingAverages(values);
    expect(result.sma28).toBeCloseTo(10, 5);
  });
});
