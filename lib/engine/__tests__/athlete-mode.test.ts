import { getAthleteModeConfig, isCompetitive, isTwoADay } from '../athlete-mode';

describe('Athlete Mode Config Resolver', () => {
  it('returns recreational defaults when no mode specified', () => {
    const config = getAthleteModeConfig();
    expect(config.mode).toBe('recreational');
    expect(config.tierThresholds.perform).toBe(85);
    expect(config.tierThresholds.train).toBe(70);
    expect(config.acwrDangerMin).toBe(1.3);
    expect(config.penaltyScaling).toBe(1.0);
    expect(config.upgradePerformancePermissions).toBe(false);
  });

  it('returns competitive thresholds for competitive mode', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    expect(config.mode).toBe('competitive');
    expect(config.tierThresholds.perform).toBe(75);
    expect(config.tierThresholds.train).toBe(60);
    expect(config.tierThresholds.maintain).toBe(45);
    expect(config.tierThresholds.recover).toBe(25);
    expect(config.acwrDangerMin).toBe(1.5);
    expect(config.penaltyScaling).toBe(0.6);
    expect(config.upgradePerformancePermissions).toBe(true);
  });

  it('preserves training schedule in config', () => {
    const single = getAthleteModeConfig('competitive', 'single');
    expect(single.trainingSchedule).toBe('single');
    const double = getAthleteModeConfig('competitive', 'double');
    expect(double.trainingSchedule).toBe('double');
  });

  it('isCompetitive returns true for competitive config', () => {
    expect(isCompetitive(getAthleteModeConfig('competitive'))).toBe(true);
    expect(isCompetitive(getAthleteModeConfig('recreational'))).toBe(false);
    expect(isCompetitive(null)).toBe(false);
    expect(isCompetitive(undefined)).toBe(false);
  });

  it('isTwoADay returns true for double schedule', () => {
    expect(isTwoADay(getAthleteModeConfig('competitive', 'double'))).toBe(true);
    expect(isTwoADay(getAthleteModeConfig('competitive', 'single'))).toBe(false);
  });
});
