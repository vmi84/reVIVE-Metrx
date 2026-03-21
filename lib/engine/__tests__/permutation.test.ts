import { prescribeProtocol } from '../protocol-engine';
import { computeIACI } from '../iaci-composite';
import { makeSubsystemScores } from './_test-helpers';
import { Phenotype, TrendContext, DriverAnalysis } from '../../types/iaci';

const phenotype: Phenotype = {
  key: 'fully_recovered', label: 'Fully Recovered',
  description: '', primaryLimiters: [],
};

describe('prescribeProtocol permutations', () => {
  it('declining trend adds risk note to explanation', () => {
    const scores = makeSubsystemScores();
    const trend: TrendContext = { direction: 'declining', iaciSlope: -1.0, subsystemTrends: {}, daysOfData: 7 };
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, trend);
    expect(result.explanation).toContain('declining');
    expect(result.trendModifier).toBe('declining');
  });

  it('improving trend adds positive note', () => {
    const scores = makeSubsystemScores();
    const trend: TrendContext = { direction: 'improving', iaciSlope: 1.0, subsystemTrends: {}, daysOfData: 7 };
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, trend);
    expect(result.explanation).toContain('improving');
    expect(result.trendModifier).toBe('improving');
  });

  it('no trend → trendModifier is null', () => {
    const scores = makeSubsystemScores();
    const result = prescribeProtocol(72, phenotype, scores);
    expect(result.trendModifier).toBeNull();
  });

  it('low confidence adds confidenceNote', () => {
    const scores = makeSubsystemScores();
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, null, 0.3);
    expect(result.confidenceNote).toContain('Low confidence');
  });

  it('high confidence → no confidenceNote', () => {
    const scores = makeSubsystemScores();
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, null, 0.85);
    expect(result.confidenceNote).toBeNull();
  });

  it('driver analysis adds actionable insight', () => {
    const scores = makeSubsystemScores();
    const driver: DriverAnalysis = {
      primaryDriver: 'sleep', secondaryDriver: null, driverScore: 70,
      driverExplanation: 'Sleep is #1 limiter', actionableInsight: 'Prioritize 8+ hours tonight.',
    };
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, null, 0.8, driver);
    expect(result.driverInsight).toContain('8+ hours');
    expect(result.explanation).toContain('sleep');
  });

  it('permutationKey has correct format', () => {
    const scores = makeSubsystemScores();
    const trend: TrendContext = { direction: 'declining', iaciSlope: -1.0, subsystemTrends: {}, daysOfData: 7 };
    const driver: DriverAnalysis = {
      primaryDriver: 'sleep', secondaryDriver: null, driverScore: 70,
      driverExplanation: '', actionableInsight: '',
    };
    const result = prescribeProtocol(72, phenotype, scores, null, null, undefined, undefined, trend, 0.8, driver);
    expect(result.permutationKey).toBe('band_B_declining_high_sleep');
  });

  it('backward compatible: calling without new params produces valid output', () => {
    const scores = makeSubsystemScores();
    const result = prescribeProtocol(72, phenotype, scores);
    expect(result.protocolClass).toBe('B');
    expect(result.readinessTier).toBe('train');
    expect(result.trendModifier).toBeNull();
    expect(result.confidenceNote).toBeNull();
    expect(result.driverInsight).toBeNull();
    expect(result.permutationKey).toContain('band_B');
  });
});

describe('computeIACI enhanced output', () => {
  it('includes confidence fields', () => {
    const scores = makeSubsystemScores();
    const result = computeIACI('2024-01-15', scores);
    expect(result.confidence).toBeDefined();
    expect(result.confidenceLevel).toBeDefined();
    expect(result.confidenceFactors).toBeDefined();
    expect(['high', 'medium', 'low']).toContain(result.confidenceLevel);
  });

  it('includes driverAnalysis', () => {
    const scores = makeSubsystemScores();
    const result = computeIACI('2024-01-15', scores);
    expect(result.driverAnalysis).toBeDefined();
    expect(result.driverAnalysis.primaryDriver).toBeDefined();
    expect(result.driverAnalysis.actionableInsight).toBeDefined();
  });

  it('includes trendContext when provided', () => {
    const scores = makeSubsystemScores();
    const trend: TrendContext = { direction: 'improving', iaciSlope: 0.8, subsystemTrends: {}, daysOfData: 7 };
    const result = computeIACI('2024-01-15', scores, undefined, 0.8, null, null,
      false, 0, 0, undefined, undefined, false, 0, false, false, false, trend);
    expect(result.trendContext).toEqual(trend);
    expect(result.protocol.trendModifier).toBe('improving');
  });

  it('trendContext is null when not provided', () => {
    const scores = makeSubsystemScores();
    const result = computeIACI('2024-01-15', scores);
    expect(result.trendContext).toBeNull();
  });

  it('protocol has permutationKey', () => {
    const scores = makeSubsystemScores();
    const result = computeIACI('2024-01-15', scores);
    expect(result.protocol.permutationKey).toMatch(/^band_[A-E]_/);
  });
});
