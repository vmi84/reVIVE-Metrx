import {
  getSubsystemBand,
  getReadinessTier,
  getProtocolClass,
  getTierColor,
  getTierLabel,
  getRecoveryBand,
  getRecoveryBandColor,
  DEFAULT_WEIGHTS,
  ENDURANCE_WEIGHTS,
  POWER_WEIGHTS,
  OLDER_ATHLETE_WEIGHTS,
  SubsystemWeights,
} from '../iaci';

describe('getSubsystemBand', () => {
  it('returns highly_recovered for 85+', () => {
    expect(getSubsystemBand(85)).toBe('highly_recovered');
    expect(getSubsystemBand(100)).toBe('highly_recovered');
  });

  it('returns trainable for 70-84', () => {
    expect(getSubsystemBand(70)).toBe('trainable');
    expect(getSubsystemBand(84)).toBe('trainable');
  });

  it('returns limited for 55-69', () => {
    expect(getSubsystemBand(55)).toBe('limited');
    expect(getSubsystemBand(69)).toBe('limited');
  });

  it('returns compromised for 40-54', () => {
    expect(getSubsystemBand(40)).toBe('compromised');
    expect(getSubsystemBand(54)).toBe('compromised');
  });

  it('returns impaired for <40', () => {
    expect(getSubsystemBand(39)).toBe('impaired');
    expect(getSubsystemBand(0)).toBe('impaired');
  });
});

describe('getReadinessTier', () => {
  it('returns perform for 85+', () => {
    expect(getReadinessTier(85)).toBe('perform');
    expect(getReadinessTier(100)).toBe('perform');
  });

  it('returns train for 70-84', () => {
    expect(getReadinessTier(70)).toBe('train');
    expect(getReadinessTier(84)).toBe('train');
  });

  it('returns maintain for 55-69', () => {
    expect(getReadinessTier(55)).toBe('maintain');
  });

  it('returns recover for 35-54', () => {
    expect(getReadinessTier(35)).toBe('recover');
    expect(getReadinessTier(54)).toBe('recover');
  });

  it('returns protect for <35', () => {
    expect(getReadinessTier(34)).toBe('protect');
    expect(getReadinessTier(0)).toBe('protect');
  });
});

describe('getProtocolClass', () => {
  it('returns A for 80+', () => {
    expect(getProtocolClass(80)).toBe('A');
    expect(getProtocolClass(100)).toBe('A');
  });

  it('returns B for 65-79', () => {
    expect(getProtocolClass(65)).toBe('B');
    expect(getProtocolClass(79)).toBe('B');
  });

  it('returns C for 50-64', () => {
    expect(getProtocolClass(50)).toBe('C');
  });

  it('returns D for 35-49', () => {
    expect(getProtocolClass(35)).toBe('D');
  });

  it('returns E for <35', () => {
    expect(getProtocolClass(34)).toBe('E');
    expect(getProtocolClass(0)).toBe('E');
  });
});

describe('getTierColor', () => {
  it('returns a hex color for each tier', () => {
    const tiers = ['perform', 'train', 'maintain', 'recover', 'protect'] as const;
    tiers.forEach(tier => {
      const color = getTierColor(tier);
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('returns unique colors for each tier', () => {
    const colors = new Set([
      getTierColor('perform'),
      getTierColor('train'),
      getTierColor('maintain'),
      getTierColor('recover'),
      getTierColor('protect'),
    ]);
    expect(colors.size).toBe(5);
  });
});

describe('getTierLabel', () => {
  it('returns capitalized label for each tier', () => {
    expect(getTierLabel('perform')).toBe('Perform');
    expect(getTierLabel('train')).toBe('Train');
    expect(getTierLabel('maintain')).toBe('Maintain');
    expect(getTierLabel('recover')).toBe('Recover');
    expect(getTierLabel('protect')).toBe('Protect');
  });
});

describe('getRecoveryBand', () => {
  it('returns Optimum for 81+', () => {
    expect(getRecoveryBand(81)).toBe('Optimum');
    expect(getRecoveryBand(100)).toBe('Optimum');
  });

  it('returns Strong for 61-80', () => {
    expect(getRecoveryBand(61)).toBe('Strong');
    expect(getRecoveryBand(80)).toBe('Strong');
  });

  it('returns Moderate for 41-60', () => {
    expect(getRecoveryBand(41)).toBe('Moderate');
    expect(getRecoveryBand(60)).toBe('Moderate');
  });

  it('returns Sufficient for 21-40', () => {
    expect(getRecoveryBand(21)).toBe('Sufficient');
    expect(getRecoveryBand(40)).toBe('Sufficient');
  });

  it('returns Insufficient for 1-20', () => {
    expect(getRecoveryBand(1)).toBe('Insufficient');
    expect(getRecoveryBand(20)).toBe('Insufficient');
  });

  it('returns Poor for 0', () => {
    expect(getRecoveryBand(0)).toBe('Poor');
  });
});

describe('getRecoveryBandColor', () => {
  it('returns a hex color for each band', () => {
    const bands = ['Optimum', 'Strong', 'Moderate', 'Sufficient', 'Insufficient', 'Poor'] as const;
    bands.forEach(band => {
      const color = getRecoveryBandColor(band);
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('Weight presets', () => {
  function sumWeights(w: SubsystemWeights): number {
    return Object.values(w).reduce((s, v) => s + v, 0);
  }

  it('DEFAULT_WEIGHTS sum to 1.0', () => {
    expect(sumWeights(DEFAULT_WEIGHTS)).toBeCloseTo(1.0, 5);
  });

  it('ENDURANCE_WEIGHTS sum to 1.0', () => {
    expect(sumWeights(ENDURANCE_WEIGHTS)).toBeCloseTo(1.0, 5);
  });

  it('POWER_WEIGHTS sum to 1.0', () => {
    expect(sumWeights(POWER_WEIGHTS)).toBeCloseTo(1.0, 5);
  });

  it('OLDER_ATHLETE_WEIGHTS sum to 1.0', () => {
    expect(sumWeights(OLDER_ATHLETE_WEIGHTS)).toBeCloseTo(1.0, 5);
  });

  it('all weights are positive', () => {
    [DEFAULT_WEIGHTS, ENDURANCE_WEIGHTS, POWER_WEIGHTS, OLDER_ATHLETE_WEIGHTS].forEach(preset => {
      Object.values(preset).forEach(w => {
        expect(w).toBeGreaterThan(0);
      });
    });
  });
});
