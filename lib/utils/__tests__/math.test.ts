import {
  clamp,
  rollingMean,
  rollingSd,
  normalizeToBaseline,
  zScoreToPercent,
  invertedZScoreToPercent,
  weightedAverage,
  linearTrend,
  exponentialMovingAverage,
} from '../math';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when min equals max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('rollingMean', () => {
  it('returns 0 for empty array', () => {
    expect(rollingMean([])).toBe(0);
  });

  it('returns single value for array of one', () => {
    expect(rollingMean([42])).toBe(42);
  });

  it('computes correct mean', () => {
    expect(rollingMean([1, 2, 3, 4, 5])).toBe(3);
  });

  it('handles negative values', () => {
    expect(rollingMean([-10, 10])).toBe(0);
  });
});

describe('rollingSd', () => {
  it('returns 0 for empty array', () => {
    expect(rollingSd([])).toBe(0);
  });

  it('returns 0 for single element', () => {
    expect(rollingSd([5])).toBe(0);
  });

  it('computes sample standard deviation', () => {
    // [2, 4, 4, 4, 5, 5, 7, 9] → mean=5, variance=4, sd=2
    const sd = rollingSd([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(sd).toBeCloseTo(2.138, 2);
  });

  it('returns 0 for identical values', () => {
    expect(rollingSd([5, 5, 5, 5])).toBe(0);
  });
});

describe('normalizeToBaseline', () => {
  it('returns 0 when sd is 0', () => {
    expect(normalizeToBaseline(10, 5, 0)).toBe(0);
  });

  it('returns positive z-score when above baseline', () => {
    expect(normalizeToBaseline(70, 60, 10)).toBe(1);
  });

  it('returns negative z-score when below baseline', () => {
    expect(normalizeToBaseline(50, 60, 10)).toBe(-1);
  });

  it('returns 0 when at baseline', () => {
    expect(normalizeToBaseline(60, 60, 10)).toBe(0);
  });
});

describe('zScoreToPercent', () => {
  it('maps z=0 to 50', () => {
    expect(zScoreToPercent(0)).toBe(50);
  });

  it('maps positive z to above 50', () => {
    expect(zScoreToPercent(1)).toBe(65);
    expect(zScoreToPercent(2)).toBe(80);
  });

  it('maps negative z to below 50', () => {
    expect(zScoreToPercent(-1)).toBe(35);
  });

  it('clamps at 0', () => {
    expect(zScoreToPercent(-10)).toBe(0);
  });

  it('clamps at 100', () => {
    expect(zScoreToPercent(10)).toBe(100);
  });
});

describe('invertedZScoreToPercent', () => {
  it('maps z=0 to 50', () => {
    expect(invertedZScoreToPercent(0)).toBe(50);
  });

  it('maps positive z to below 50 (lower is better)', () => {
    expect(invertedZScoreToPercent(1)).toBe(35);
  });

  it('maps negative z to above 50', () => {
    expect(invertedZScoreToPercent(-1)).toBe(65);
  });

  it('clamps at 0', () => {
    expect(invertedZScoreToPercent(10)).toBe(0);
  });

  it('clamps at 100', () => {
    expect(invertedZScoreToPercent(-10)).toBe(100);
  });
});

describe('weightedAverage', () => {
  it('returns 0 for empty arrays', () => {
    expect(weightedAverage([], [])).toBe(0);
  });

  it('returns 0 for mismatched lengths', () => {
    expect(weightedAverage([1, 2], [1])).toBe(0);
  });

  it('computes correct weighted average', () => {
    expect(weightedAverage([80, 60], [0.7, 0.3])).toBeCloseTo(74, 5);
  });

  it('returns 0 when all weights are 0', () => {
    expect(weightedAverage([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  it('handles equal weights same as regular mean', () => {
    expect(weightedAverage([10, 20, 30], [1, 1, 1])).toBe(20);
  });
});

describe('linearTrend', () => {
  it('returns 0 for empty array', () => {
    expect(linearTrend([])).toBe(0);
  });

  it('returns 0 for single value', () => {
    expect(linearTrend([5])).toBe(0);
  });

  it('returns positive slope for ascending values', () => {
    expect(linearTrend([1, 2, 3, 4, 5])).toBeCloseTo(1, 5);
  });

  it('returns negative slope for descending values', () => {
    expect(linearTrend([5, 4, 3, 2, 1])).toBeCloseTo(-1, 5);
  });

  it('returns 0 for constant values', () => {
    expect(linearTrend([5, 5, 5, 5])).toBeCloseTo(0, 5);
  });
});

describe('exponentialMovingAverage', () => {
  it('returns 0 for empty array', () => {
    expect(exponentialMovingAverage([])).toBe(0);
  });

  it('returns single value for array of one', () => {
    expect(exponentialMovingAverage([42])).toBe(42);
  });

  it('gives more weight to recent values', () => {
    const ema = exponentialMovingAverage([10, 10, 10, 10, 100], 0.5);
    // Recent 100 pulls EMA up significantly
    expect(ema).toBeGreaterThan(50);
  });

  it('with alpha=1 returns last value', () => {
    expect(exponentialMovingAverage([1, 2, 3, 4, 5], 1)).toBe(5);
  });

  it('with alpha=0 returns first value', () => {
    expect(exponentialMovingAverage([1, 2, 3, 4, 5], 0)).toBe(1);
  });

  it('uses default alpha=0.2', () => {
    const ema = exponentialMovingAverage([10, 20]);
    // ema = 0.2 * 20 + 0.8 * 10 = 12
    expect(ema).toBe(12);
  });
});
