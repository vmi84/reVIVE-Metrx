import {
  TIER_THRESHOLDS,
  PROTOCOL_THRESHOLDS,
  BAND_THRESHOLDS,
  ACWR_ZONES,
  PENALTIES,
  BASELINE_WINDOW_DAYS,
  BASELINE_MIN_SAMPLES,
  BODY_REGIONS,
  SORENESS_LABELS,
} from '../constants';

describe('TIER_THRESHOLDS', () => {
  it('has descending thresholds', () => {
    const values = [
      TIER_THRESHOLDS.perform,
      TIER_THRESHOLDS.train,
      TIER_THRESHOLDS.maintain,
      TIER_THRESHOLDS.recover,
      TIER_THRESHOLDS.protect,
    ];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });

  it('starts at 85 and ends at 0', () => {
    expect(TIER_THRESHOLDS.perform).toBe(85);
    expect(TIER_THRESHOLDS.protect).toBe(0);
  });
});

describe('PROTOCOL_THRESHOLDS', () => {
  it('has descending thresholds', () => {
    const values = [
      PROTOCOL_THRESHOLDS.A,
      PROTOCOL_THRESHOLDS.B,
      PROTOCOL_THRESHOLDS.C,
      PROTOCOL_THRESHOLDS.D,
      PROTOCOL_THRESHOLDS.E,
    ];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });
});

describe('BAND_THRESHOLDS', () => {
  it('has descending thresholds', () => {
    const values = [
      BAND_THRESHOLDS.highly_recovered,
      BAND_THRESHOLDS.trainable,
      BAND_THRESHOLDS.limited,
      BAND_THRESHOLDS.compromised,
      BAND_THRESHOLDS.impaired,
    ];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });
});

describe('ACWR_ZONES', () => {
  it('has contiguous zones', () => {
    expect(ACWR_ZONES.undertraining.max).toBe(ACWR_ZONES.sweet_spot.min);
    expect(ACWR_ZONES.sweet_spot.max).toBe(ACWR_ZONES.danger.min);
    expect(ACWR_ZONES.danger.max).toBe(ACWR_ZONES.overreaching.min);
  });

  it('starts at 0 and extends to infinity', () => {
    expect(ACWR_ZONES.undertraining.min).toBe(0);
    expect(ACWR_ZONES.overreaching.max).toBe(Infinity);
  });
});

describe('PENALTIES', () => {
  it('all penalties are positive', () => {
    Object.values(PENALTIES).forEach(penalty => {
      expect(penalty).toBeGreaterThan(0);
    });
  });

  it('illness_caution is the highest penalty', () => {
    const max = Math.max(...Object.values(PENALTIES));
    expect(PENALTIES.illness_caution).toBe(max);
  });
});

describe('BASELINE constants', () => {
  it('window is 21 days', () => {
    expect(BASELINE_WINDOW_DAYS).toBe(21);
  });

  it('min samples is 7', () => {
    expect(BASELINE_MIN_SAMPLES).toBe(7);
  });
});

describe('BODY_REGIONS', () => {
  it('has 13 regions', () => {
    expect(BODY_REGIONS).toHaveLength(13);
  });

  it('contains expected regions', () => {
    expect(BODY_REGIONS).toContain('quads');
    expect(BODY_REGIONS).toContain('lower_back');
    expect(BODY_REGIONS).toContain('neck');
  });
});

describe('SORENESS_LABELS', () => {
  it('has 5 labels from None to Severe', () => {
    expect(SORENESS_LABELS).toHaveLength(5);
    expect(SORENESS_LABELS[0]).toBe('None');
    expect(SORENESS_LABELS[4]).toBe('Severe');
  });
});
