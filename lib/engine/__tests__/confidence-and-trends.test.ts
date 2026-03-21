import { computeConfidence } from '../iaci-composite';
import { deriveTrendContext, analyzeTrends, TrendResult } from '../trend-analyzer';
import { makeSubsystemScores } from './_test-helpers';
import { TrendContext } from '../../types/iaci';

describe('computeConfidence', () => {
  it('returns high confidence with full data + baseline + trend', () => {
    const scores = makeSubsystemScores();
    const trend: TrendContext = { direction: 'stable', iaciSlope: 0, subsystemTrends: {}, daysOfData: 7 };
    const result = computeConfidence(0.85, scores, true, trend);
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    expect(result.level).toBe('high');
    expect(result.factors).toContain('21-day baseline available');
    expect(result.factors).toContain('7-day trend data available');
  });

  it('returns low confidence with minimal data', () => {
    // Scores with all-null inputs to simulate default-only
    const scores = makeSubsystemScores();
    // Override inputs to be all null for 4+ subsystems
    for (const key of ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep'] as const) {
      scores[key] = { ...scores[key], inputs: { dummy: null } };
    }
    const result = computeConfidence(0.3, scores, false, null);
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.level).toBe('low');
  });

  it('baseline bonus increases confidence', () => {
    const scores = makeSubsystemScores();
    const without = computeConfidence(0.6, scores, false, null);
    const withBaseline = computeConfidence(0.6, scores, true, null);
    expect(withBaseline.confidence).toBeGreaterThan(without.confidence);
  });

  it('confidence clamped to 0-1', () => {
    const scores = makeSubsystemScores();
    const result = computeConfidence(1.0, scores, true, { direction: 'stable', iaciSlope: 0, subsystemTrends: {}, daysOfData: 7 });
    expect(result.confidence).toBeLessThanOrEqual(1.0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it('factors include wearable status', () => {
    const scores = makeSubsystemScores();
    // Default makeSubsystemScores has inputs:{} which means no hrv/sleepDuration
    const result = computeConfidence(0.7, scores, false, null);
    expect(result.factors.some(f => f.includes('wearable') || f.includes('subjective'))).toBe(true);
  });
});

describe('deriveTrendContext', () => {
  it('returns stable for null input', () => {
    const ctx = deriveTrendContext(null);
    expect(ctx.direction).toBe('stable');
    expect(ctx.iaciSlope).toBe(0);
    expect(ctx.daysOfData).toBe(0);
  });

  it('returns improving for positive slope > 0.5', () => {
    const trend: TrendResult = {
      period: '7d', iaciTrend: 1.2, subsystemTrends: { sleep: 0.8 },
      trainingLoadAvg: 50, strainAvg: 50, inflammationTrend: null,
    };
    const ctx = deriveTrendContext(trend);
    expect(ctx.direction).toBe('improving');
    expect(ctx.subsystemTrends.sleep).toBe('improving');
  });

  it('returns declining for negative slope < -0.5', () => {
    const trend: TrendResult = {
      period: '7d', iaciTrend: -1.5, subsystemTrends: { autonomic: -0.8 },
      trainingLoadAvg: 50, strainAvg: 50, inflammationTrend: null,
    };
    const ctx = deriveTrendContext(trend);
    expect(ctx.direction).toBe('declining');
    expect(ctx.subsystemTrends.autonomic).toBe('declining');
  });

  it('returns stable for slope within threshold', () => {
    const trend: TrendResult = {
      period: '7d', iaciTrend: 0.3, subsystemTrends: { sleep: -0.2 },
      trainingLoadAvg: 50, strainAvg: 50, inflammationTrend: null,
    };
    const ctx = deriveTrendContext(trend);
    expect(ctx.direction).toBe('stable');
    expect(ctx.subsystemTrends.sleep).toBe('stable');
  });

  it('sets daysOfData to 7', () => {
    const trend: TrendResult = {
      period: '7d', iaciTrend: 0, subsystemTrends: {},
      trainingLoadAvg: 0, strainAvg: 0, inflammationTrend: null,
    };
    expect(deriveTrendContext(trend).daysOfData).toBe(7);
  });
});
