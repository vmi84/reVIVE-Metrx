import { getTrainingCompatibility } from '../training-compatibility';
import { getAthleteModeConfig } from '../athlete-mode';
import { makeSubsystemScores } from './_test-helpers';

describe('Training Compatibility — Competitive Mode', () => {
  const allGoodScores = makeSubsystemScores({ autonomic: 70, musculoskeletal: 70, cardiometabolic: 70, sleep: 70, metabolic: 70, psychological: 70 });

  it('recreational: IACI 65 puts intervals at caution', () => {
    const compat = getTrainingCompatibility(65, 'fully_recovered', allGoodScores);
    expect(compat.intervals).toBe('caution');
    expect(compat.strengthHeavy).toBe('avoid');
  });

  it('competitive: IACI 65 puts intervals at allowed (shifted thresholds)', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    const compat = getTrainingCompatibility(65, 'fully_recovered', allGoodScores, config);
    // 65 >= competitive train threshold (60), so intervals should be allowed or better
    expect(['allowed', 'recommended']).toContain(compat.intervals);
    // strengthHeavy was caution in train tier, upgraded to allowed for competitive
    expect(['allowed', 'recommended']).toContain(compat.strengthHeavy);
  });

  it('competitive: IACI 50 still allows zone2 (maintain tier at 45)', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    const compat = getTrainingCompatibility(50, 'fully_recovered', allGoodScores, config);
    // 50 >= competitive maintain threshold (45)
    expect(['allowed', 'recommended']).toContain(compat.zone2);
  });

  it('recreational: IACI 50 puts zone2 at caution (maintain tier at 55)', () => {
    const compat = getTrainingCompatibility(50, 'fully_recovered', allGoodScores);
    // 50 < recreational maintain threshold (55), falls to recover tier
    expect(compat.zone2).toBe('caution');
  });

  it('competitive upgrades caution → allowed for performance modalities', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    // IACI 62: in competitive train tier (≥60), base has strengthHeavy=caution, plyometrics=caution
    const compat = getTrainingCompatibility(62, 'fully_recovered', allGoodScores, config);
    // These should be upgraded from caution to allowed
    expect(compat.strengthHeavy).not.toBe('caution');
    expect(compat.plyometrics).not.toBe('caution');
  });

  it('phenotype overrides still apply in competitive mode', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    const suppressedScores = makeSubsystemScores({ autonomic: 35, musculoskeletal: 75, cardiometabolic: 70, sleep: 40, metabolic: 70, psychological: 70 });
    const compat = getTrainingCompatibility(65, 'centrally_suppressed', suppressedScores, config);
    // Phenotype override restricts, but competitive upgrade lifts avoid → caution
    // Competitive athletes with coach oversight get caution, not full avoid
    expect(compat.intervals).toBe('caution');
  });
});
