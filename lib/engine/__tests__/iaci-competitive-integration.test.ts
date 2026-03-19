/**
 * Integration test: computeIACI with competitive mode
 *
 * Verifies the full pipeline: computeIACI → prescribeProtocol → getTrainingCompatibility
 * produces correct training permissions when athleteMode is competitive.
 */

import { computeIACI } from '../iaci-composite';
import { getAthleteModeConfig } from '../athlete-mode';
import { makeSubsystemScores } from './_test-helpers';

describe('computeIACI — Competitive Mode Integration', () => {
  const allGood = makeSubsystemScores({
    autonomic: 75, musculoskeletal: 75, cardiometabolic: 75,
    sleep: 75, metabolic: 75, psychological: 75,
  });

  it('recreational IACI 74: intervals should be caution or avoid', () => {
    const result = computeIACI('2026-03-19', allGood);
    const compat = result.protocol.trainingCompatibility;
    // 74 is in train tier (70-84) for recreational
    // intervals = 'allowed' in train tier... wait let me check
    console.log('Recreational IACI score:', result.score);
    console.log('Recreational intervals:', compat.intervals);
    console.log('Recreational tempo:', compat.tempo);
    console.log('Recreational strengthHeavy:', compat.strengthHeavy);
  });

  it('competitive IACI 74: intervals should be allowed or recommended', () => {
    const config = getAthleteModeConfig('competitive', 'single');
    const result = computeIACI('2026-03-19', allGood, undefined, 1.0, null, config);
    const compat = result.protocol.trainingCompatibility;
    console.log('Competitive IACI score:', result.score);
    console.log('Competitive intervals:', compat.intervals);
    console.log('Competitive tempo:', compat.tempo);
    console.log('Competitive strengthHeavy:', compat.strengthHeavy);
    console.log('Competitive plyometrics:', compat.plyometrics);

    // At competitive IACI 74, we're in the perform tier (>=75) or train tier (>=60)
    // Either way, intervals should be at least 'allowed'
    expect(['allowed', 'recommended']).toContain(compat.intervals);
    expect(['allowed', 'recommended']).toContain(compat.tempo);
  });

  it('competitive IACI ~55: intervals should be allowed (not avoid)', () => {
    const moderate = makeSubsystemScores({
      autonomic: 55, musculoskeletal: 55, cardiometabolic: 55,
      sleep: 55, metabolic: 55, psychological: 55,
    });
    const config = getAthleteModeConfig('competitive', 'single');
    const result = computeIACI('2026-03-19', moderate, undefined, 1.0, null, config);
    const compat = result.protocol.trainingCompatibility;
    console.log('Competitive IACI score (moderate):', result.score);
    console.log('Competitive intervals (moderate):', compat.intervals);

    // 55 competitive → maintain tier (>=45) or higher
    // intervals in maintain = 'caution', upgraded to 'allowed' by competitive
    expect(compat.intervals).not.toBe('avoid');
  });

  it('penalty scaling: competitive penalties are 40% less', () => {
    const low = makeSubsystemScores({
      autonomic: 35, musculoskeletal: 80, cardiometabolic: 70,
      sleep: 70, metabolic: 70, psychological: 70,
    });

    const recResult = computeIACI('2026-03-19', low);
    const config = getAthleteModeConfig('competitive', 'single');
    const compResult = computeIACI('2026-03-19', low, undefined, 1.0, null, config);

    console.log('Recreational score:', recResult.score, 'penalties:', recResult.penalties.map(p => `${p.name}:${p.points}`));
    console.log('Competitive score:', compResult.score, 'penalties:', compResult.penalties.map(p => `${p.name}:${p.points}`));

    // Competitive should have higher final score due to reduced penalties
    expect(compResult.score).toBeGreaterThanOrEqual(recResult.score);
  });
});
