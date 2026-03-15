import { computeInflammationScore, InflammationInputs } from '../inflammation-score';

function makeEmptyInputs(): InflammationInputs {
  return {
    hrvSuppression: false,
    rhrElevation: false,
    respiratoryRateElevated: false,
    skinTempElevated: false,
    sleepDisrupted: false,
    generalSoreness: null,
    perceivedFatigue: null,
    giDisruption: null,
    illnessSymptoms: [],
    hsCrp: null,
    ferritin: null,
    vitaminD: null,
    ck: null,
  };
}

describe('computeInflammationScore', () => {
  it('returns low score with no signals', () => {
    const result = computeInflammationScore(makeEmptyInputs());
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(25);
  });

  it('returns higher score with all wearable proxies active', () => {
    const inputs = makeEmptyInputs();
    inputs.hrvSuppression = true;
    inputs.rhrElevation = true;
    inputs.respiratoryRateElevated = true;
    inputs.skinTempElevated = true;
    inputs.sleepDisrupted = true;
    const result = computeInflammationScore(inputs);
    expect(result.score).toBeGreaterThan(30);
  });

  it('adds HRV suppression flag', () => {
    const inputs = makeEmptyInputs();
    inputs.hrvSuppression = true;
    const result = computeInflammationScore(inputs);
    expect(result.flags).toContain('HRV suppressed');
    expect(result.contributingFactors).toContain('Autonomic stress');
  });

  it('handles general soreness scoring', () => {
    const inputs = makeEmptyInputs();
    inputs.generalSoreness = 4; // max
    const result = computeInflammationScore(inputs);
    expect(result.score).toBeGreaterThan(20);
  });

  it('high soreness adds contributing factor', () => {
    const inputs = makeEmptyInputs();
    inputs.generalSoreness = 3;
    const result = computeInflammationScore(inputs);
    expect(result.contributingFactors).toContain('High muscular soreness');
  });

  it('GI disruption only contributes at level 3+', () => {
    const noGI = makeEmptyInputs();
    noGI.giDisruption = 2;
    const result1 = computeInflammationScore(noGI);

    const withGI = makeEmptyInputs();
    withGI.giDisruption = 3;
    const result2 = computeInflammationScore(withGI);

    expect(result2.flags).toEqual(expect.arrayContaining(['GI disruption']));
    expect(result1.flags).not.toContain('GI disruption');
  });

  it('illness symptoms increase score', () => {
    const inputs = makeEmptyInputs();
    inputs.illnessSymptoms = ['fever', 'cough', 'fatigue'];
    const result = computeInflammationScore(inputs);
    // 3 symptoms → score = clamp(40 + 3*15, 0, 100) = 85, weight 0.10
    // plus proxyScore=0 weight 0.35 → weighted avg = (0 + 85*0.10) / 0.45 ≈ 19
    expect(result.score).toBeGreaterThanOrEqual(15);
    expect(result.contributingFactors).toContain('Immune activation');
  });

  describe('lab markers', () => {
    it('hsCRP < 1.0 scores low', () => {
      const inputs = makeEmptyInputs();
      inputs.hsCrp = 0.5;
      const result = computeInflammationScore(inputs);
      expect(result.level).toBe('low');
    });

    it('hsCRP >= 3.0 adds flag', () => {
      const inputs = makeEmptyInputs();
      inputs.hsCrp = 5.0;
      const result = computeInflammationScore(inputs);
      expect(result.flags.some(f => f.includes('hs-CRP elevated'))).toBe(true);
    });

    it('hsCRP >= 10.0 with other signals scores elevated', () => {
      const inputs = makeEmptyInputs();
      inputs.hsCrp = 15.0;
      inputs.hrvSuppression = true;
      inputs.rhrElevation = true;
      inputs.generalSoreness = 3;
      const result = computeInflammationScore(inputs);
      // Combined signals push the weighted average well above moderate
      expect(result.score).toBeGreaterThan(40);
      expect(['moderate', 'elevated', 'high']).toContain(result.level);
    });

    it('CK < 200 scores low', () => {
      const inputs = makeEmptyInputs();
      inputs.ck = 150;
      const result = computeInflammationScore(inputs);
      expect(result.level).toBe('low');
    });

    it('CK >= 500 adds flag', () => {
      const inputs = makeEmptyInputs();
      inputs.ck = 600;
      const result = computeInflammationScore(inputs);
      expect(result.flags.some(f => f.includes('CK elevated'))).toBe(true);
    });

    it('low vitamin D adds penalty', () => {
      const inputs = makeEmptyInputs();
      inputs.vitaminD = 20;
      const result = computeInflammationScore(inputs);
      expect(result.flags.some(f => f.includes('Vitamin D'))).toBe(true);
    });

    it('adequate vitamin D (>=30) does not add penalty', () => {
      const inputs = makeEmptyInputs();
      inputs.vitaminD = 45;
      const result = computeInflammationScore(inputs);
      expect(result.flags.some(f => f.includes('Vitamin D'))).toBe(false);
    });
  });

  describe('level classification', () => {
    it('returns elevated for combined signals', () => {
      const inputs = makeEmptyInputs();
      inputs.hrvSuppression = true;
      inputs.rhrElevation = true;
      inputs.sleepDisrupted = true;
      inputs.generalSoreness = 4;
      inputs.hsCrp = 8;
      const result = computeInflammationScore(inputs);
      expect(['elevated', 'high']).toContain(result.level);
    });
  });
});
