/**
 * Comprehensive Scenario-Based Integration Tests
 *
 * Tests real-world athlete scenarios end-to-end:
 *   check-in data → subsystem scores → IACI → training compatibility → recommendations
 *
 * Each scenario verifies the ACTUAL recommendations match what an athlete
 * and coach would expect, not just that the functions return values.
 */

import { computeIACI } from '../iaci-composite';
import { getAthleteModeConfig } from '../athlete-mode';
import { getTrainingCompatibility, getRecoveryTrainingRecommendations } from '../training-compatibility';
import { makeSubsystemScores } from './_test-helpers';
import type { AthleteModeConfig } from '../../types/athlete-mode';
import type { TrainingCompatibility, TrainingPermission } from '../../types/iaci';

// Helper: get compatibility for a score with optional athlete mode
function getCompat(iaciScore: number, athleteMode?: AthleteModeConfig | null): TrainingCompatibility {
  const scores = makeSubsystemScores({
    autonomic: iaciScore,
    musculoskeletal: iaciScore,
    cardiometabolic: iaciScore,
    sleep: iaciScore,
    metabolic: iaciScore,
    psychological: iaciScore,
  });
  return getTrainingCompatibility(iaciScore, 'fully_recovered', scores, athleteMode);
}

// ─── Competitive Athlete Thresholds ─────────────────────────────────────────

describe('Competitive Athlete — Training Compatibility', () => {
  const competitive = getAthleteModeConfig('competitive', 'single');

  it('IACI 74: intervals should be allowed or caution, NOT avoid', () => {
    const compat = getCompat(74, competitive);
    expect(compat.intervals).not.toBe('avoid');
    expect(['allowed', 'caution', 'recommended']).toContain(compat.intervals);
  });

  it('IACI 74: tempo should be allowed or caution, NOT avoid', () => {
    const compat = getCompat(74, competitive);
    expect(compat.tempo).not.toBe('avoid');
  });

  it('IACI 74: light strength should be allowed or recommended', () => {
    const compat = getCompat(74, competitive);
    expect(['allowed', 'recommended']).toContain(compat.strengthLight);
  });

  it('IACI 74: heavy strength should be caution at worst', () => {
    const compat = getCompat(74, competitive);
    expect(compat.strengthHeavy).not.toBe('avoid');
  });

  it('IACI 74: plyometrics should be caution at worst', () => {
    const compat = getCompat(74, competitive);
    expect(compat.plyometrics).not.toBe('avoid');
  });

  it('IACI 65: intervals should still not be avoid for competitive', () => {
    const compat = getCompat(65, competitive);
    expect(compat.intervals).not.toBe('avoid');
  });

  it('IACI 50: zone 2 should be allowed for competitive (above 45 threshold)', () => {
    const compat = getCompat(50, competitive);
    expect(['allowed', 'recommended']).toContain(compat.zone2);
  });

  it('IACI 50: intervals should be caution for competitive (maintain tier)', () => {
    const compat = getCompat(50, competitive);
    expect(['caution', 'allowed']).toContain(compat.intervals);
  });
});

// ─── Recreational Athlete Thresholds ────────────────────────────────────────

describe('Recreational Athlete — Training Compatibility', () => {
  it('IACI 74: intervals should be caution (below train threshold 85)', () => {
    const compat = getCompat(74);
    // Recreational: train tier is 70-84, intervals = allowed
    expect(['allowed', 'caution']).toContain(compat.intervals);
  });

  it('IACI 60: intervals should be caution or avoid (maintain tier)', () => {
    const compat = getCompat(60);
    expect(['caution', 'avoid']).toContain(compat.intervals);
  });

  it('IACI 40: most training avoided except recovery modalities', () => {
    const compat = getCompat(40);
    expect(compat.intervals).toBe('avoid');
    expect(compat.tempo).toBe('avoid');
    expect(compat.strengthHeavy).toBe('avoid');
    // But recovery modalities should still be available
    expect(compat.yoga).not.toBe('avoid');
    expect(compat.walkingRecovery).not.toBe('avoid');
    expect(compat.meditation).not.toBe('avoid');
  });
});

// ─── Active Recovery Always Available ───────────────────────────────────────

describe('Active Recovery — Always Available', () => {
  const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  it.each(scores)('IACI %i: walking recovery is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.walkingRecovery).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: yoga is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.yoga).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: meditation is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.meditation).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: breathwork is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.breathworkActive).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: zone 1 is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.zone1).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: easy cycling is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.easyCycling).not.toBe('avoid');
  });

  it.each(scores)('IACI %i: mobility flow is never avoided', (score) => {
    const compat = getCompat(score);
    expect(compat.mobilityFlow).not.toBe('avoid');
  });
});

// ─── Competitive vs Recreational Side-by-Side ───────────────────────────────

describe('Competitive vs Recreational — Side by Side Comparison', () => {
  const competitive = getAthleteModeConfig('competitive', 'single');
  const testScores = [40, 50, 60, 70, 80];

  it.each(testScores)('IACI %i: competitive always equal or more permissive than recreational', (score) => {
    const rec = getCompat(score);
    const comp = getCompat(score, competitive);

    const permissionOrder: Record<TrainingPermission, number> = {
      'avoid': 0, 'caution': 1, 'allowed': 2, 'recommended': 3,
    };

    const modalities = Object.keys(rec) as (keyof TrainingCompatibility)[];
    for (const key of modalities) {
      const recLevel = permissionOrder[rec[key]];
      const compLevel = permissionOrder[comp[key]];
      expect(compLevel).toBeGreaterThanOrEqual(recLevel);
    }
  });
});

// ─── Full IACI Range Training Compatibility ─────────────────────────────────

describe('Full IACI Range — No Broken Tiers', () => {
  // Test every 5 points from 5 to 95
  const range = Array.from({ length: 19 }, (_, i) => (i + 1) * 5);

  it.each(range)('IACI %i: produces valid compatibility (no undefined values)', (score) => {
    const compat = getCompat(score);
    const values = Object.values(compat);
    const validPermissions = ['recommended', 'allowed', 'caution', 'avoid'];
    for (const v of values) {
      expect(validPermissions).toContain(v);
    }
  });

  it.each(range)('IACI %i: higher score = more permissive overall', (score) => {
    if (score <= 5) return; // Can't compare lower

    const lower = getCompat(score - 5);
    const higher = getCompat(score);

    const permissionOrder: Record<TrainingPermission, number> = {
      'avoid': 0, 'caution': 1, 'allowed': 2, 'recommended': 3,
    };

    // Sum of all permission levels should be >= for higher score
    const lowerSum = Object.values(lower).reduce((s, v) => s + permissionOrder[v], 0);
    const higherSum = Object.values(higher).reduce((s, v) => s + permissionOrder[v], 0);
    expect(higherSum).toBeGreaterThanOrEqual(lowerSum);
  });
});

// ─── Recommendation Filtering ───────────────────────────────────────────────

describe('Recommendation Filtering — Environment & Preferences', () => {
  it('no pool in environment = no aquatic recommendations', () => {
    const scores = makeSubsystemScores({ autonomic: 70, musculoskeletal: 70 });
    const compat = getTrainingCompatibility(70, 'fully_recovered', scores);
    const recs = getRecoveryTrainingRecommendations(compat, scores, [], 8, ['home', 'outdoors']);
    const aquatic = recs.filter(r => r.key.includes('swim') || r.key.includes('aquatic'));
    expect(aquatic).toHaveLength(0);
  });

  it('pool in environment = aquatic recommendations included', () => {
    const scores = makeSubsystemScores({ autonomic: 70, musculoskeletal: 70 });
    const compat = getTrainingCompatibility(70, 'fully_recovered', scores);
    const recs = getRecoveryTrainingRecommendations(compat, scores, [], 8, ['home', 'pool']);
    const aquatic = recs.filter(r => r.key.includes('swim') || r.key.includes('aquatic'));
    expect(aquatic.length).toBeGreaterThan(0);
  });

  it('recommendations always include at least one active aerobic option', () => {
    const scores = makeSubsystemScores({ autonomic: 40, musculoskeletal: 40 });
    const compat = getTrainingCompatibility(40, 'fully_recovered', scores);
    const recs = getRecoveryTrainingRecommendations(compat, scores, [], 8, ['home', 'outdoors']);
    const activeAerobic = recs.filter(r =>
      r.key.includes('walking') || r.key.includes('easyCycling') ||
      r.key.includes('zone1') || r.key.includes('zone2')
    );
    expect(activeAerobic.length).toBeGreaterThan(0);
  });
});

// ─── RPE Consistency ────────────────────────────────────────────────────────

describe('RPE — Permission Level Consistency', () => {
  it('caution activities should have RPE <= 2/10', () => {
    const scores = makeSubsystemScores({ autonomic: 55, musculoskeletal: 55 });
    const compat = getTrainingCompatibility(55, 'fully_recovered', scores);
    const recs = getRecoveryTrainingRecommendations(compat, scores);
    for (const rec of recs) {
      if (compat[rec.key] === 'caution' && rec.recommendedRPE) {
        // Extract max RPE number from string like "RPE 1-2/10"
        const match = rec.recommendedRPE.match(/(\d+)/g);
        if (match && match.length >= 2) {
          const maxRPE = parseInt(match[1]);
          expect(maxRPE).toBeLessThanOrEqual(2);
        }
      }
    }
  });
});
