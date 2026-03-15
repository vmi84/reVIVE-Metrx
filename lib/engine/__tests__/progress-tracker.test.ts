import { computeACWR, computeMonotony, detectStall } from '../progress-tracker';

describe('computeACWR', () => {
  it('handles short history (<28 days)', () => {
    const loads = [10, 12, 8, 15, 10, 12, 14]; // 7 days
    const result = computeACWR(loads);
    expect(result.acute).toBeGreaterThan(0);
    expect(result.chronic).toBeGreaterThan(0);
    expect(result.ratio).toBeGreaterThan(0);
  });

  it('computes ratio as acute/chronic', () => {
    const loads = Array.from({ length: 28 }, () => 10);
    const result = computeACWR(loads);
    expect(result.ratio).toBeCloseTo(1.0, 1);
    expect(result.zone).toBe('sweet_spot');
  });

  it('classifies undertraining for ratio < 0.8', () => {
    // Low recent, higher chronic
    const loads = Array.from({ length: 28 }, (_, i) => i < 21 ? 20 : 5);
    const result = computeACWR(loads);
    expect(result.zone).toBe('undertraining');
  });

  it('classifies sweet_spot for ratio 0.8-1.3', () => {
    const loads = Array.from({ length: 28 }, () => 10);
    const result = computeACWR(loads);
    expect(result.zone).toBe('sweet_spot');
  });

  it('classifies overreaching for high ratio', () => {
    // Very high recent, low chronic
    const loads = Array.from({ length: 28 }, (_, i) => i < 21 ? 5 : 25);
    const result = computeACWR(loads);
    expect(['danger', 'overreaching']).toContain(result.zone);
  });

  it('returns ratio=1.0 when chronic is 0', () => {
    const loads = [0, 0, 0, 0, 0, 0, 0];
    const result = computeACWR(loads);
    expect(result.ratio).toBe(1.0);
  });

  it('uses last 7 for acute, last 28 for chronic', () => {
    const loads = Array.from({ length: 28 }, (_, i) => i < 21 ? 10 : 20);
    const result = computeACWR(loads);
    expect(result.acute).toBeCloseTo(20, 0); // last 7 are all 20
    const expectedChronic = (21 * 10 + 7 * 20) / 28;
    expect(result.chronic).toBeCloseTo(expectedChronic, 0);
  });
});

describe('computeMonotony', () => {
  it('returns 0 for insufficient data', () => {
    expect(computeMonotony([10, 12, 8])).toBe(0);
  });

  it('returns 0 for zero SD (identical loads)', () => {
    expect(computeMonotony([10, 10, 10, 10, 10, 10, 10])).toBe(0);
  });

  it('returns high value for similar loads', () => {
    // mean≈10, SD will be small → high monotony
    const result = computeMonotony([10, 10.1, 10, 10.1, 10, 10.1, 10]);
    expect(result).toBeGreaterThan(50);
  });

  it('returns lower value for varied loads', () => {
    const result = computeMonotony([5, 15, 8, 20, 3, 18, 10]);
    expect(result).toBeLessThan(3);
  });

  it('uses only last 7 days', () => {
    const loads = [100, 100, 100, 5, 15, 8, 20, 3, 18, 10];
    const result = computeMonotony(loads);
    // Should use last 7: [5, 15, 8, 20, 3, 18, 10]
    const expectedFromLast7 = computeMonotony([5, 15, 8, 20, 3, 18, 10]);
    expect(result).toBeCloseTo(expectedFromLast7, 5);
  });
});

describe('detectStall', () => {
  const baseParams = {
    vo2maxHistory: [],
    paceHistory: [],
    hrvBaselineHistory: [],
    acwr: { acute: 10, chronic: 10, ratio: 1.0, zone: 'sweet_spot' as const },
    monotony: 1.0,
    daysSinceImprovement: 0,
  };

  it('returns none when no stall conditions met', () => {
    const result = detectStall(baseParams);
    expect(result.stallType).toBe('none');
    expect(result.alternativeApproaches).toHaveLength(0);
  });

  it('detects vo2max plateau', () => {
    const result = detectStall({
      ...baseParams,
      vo2maxHistory: [45, 45.1, 45, 44.9, 45, 45.1, 45, 45.2],
    });
    expect(result.stallType).toBe('vo2max_plateau');
    expect(result.alternativeApproaches.length).toBeGreaterThan(0);
  });

  it('does not detect vo2max plateau with improvement', () => {
    const result = detectStall({
      ...baseParams,
      vo2maxHistory: [45, 45.5, 46, 46.5, 47, 47.5, 48, 48.5],
    });
    expect(result.stallType).not.toBe('vo2max_plateau');
  });

  it('detects pace stagnation', () => {
    const result = detectStall({
      ...baseParams,
      paceHistory: [5.0, 5.1, 5.0, 5.1, 5.0, 5.1],
      daysSinceImprovement: 50,
    });
    expect(result.stallType).toBe('pace_stagnation');
  });

  it('detects training monotony', () => {
    const result = detectStall({
      ...baseParams,
      monotony: 2.5,
    });
    expect(result.stallType).toBe('training_monotony');
  });

  it('detects overreaching via ACWR zone', () => {
    const result = detectStall({
      ...baseParams,
      acwr: { acute: 20, chronic: 10, ratio: 2.0, zone: 'overreaching' },
    });
    expect(result.stallType).toBe('overreaching');
  });

  it('detects overreaching via danger zone', () => {
    const result = detectStall({
      ...baseParams,
      acwr: { acute: 15, chronic: 10, ratio: 1.4, zone: 'danger' },
    });
    expect(result.stallType).toBe('overreaching');
  });

  it('detects HRV stagnation', () => {
    const declining = Array.from({ length: 14 }, (_, i) => 65 - i * 0.3);
    const result = detectStall({
      ...baseParams,
      hrvBaselineHistory: declining,
    });
    expect(result.stallType).toBe('hrv_stagnation');
  });

  it('prioritizes vo2max plateau over other stalls', () => {
    const result = detectStall({
      ...baseParams,
      vo2maxHistory: [45, 45, 45, 45, 45, 45, 45, 45],
      monotony: 3.0,
    });
    expect(result.stallType).toBe('vo2max_plateau');
  });
});
