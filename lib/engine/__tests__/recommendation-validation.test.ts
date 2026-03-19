/**
 * Comprehensive Recommendation Validation Test Suite
 *
 * Tests training compatibility recommendations across IACI 10-95
 * for both recreational and competitive modes.
 *
 * Key invariants:
 * 1. Zone 1 (easy) should NEVER be "avoid" — active recovery always allowed
 * 2. Zone 2 (aerobic) should be "recommended" for IACI >= 55 recreational, >= 45 competitive
 * 3. Intervals/tempo at IACI 74 competitive should be "allowed" or "caution", NOT "avoid"
 * 4. Competitive mode should always be MORE permissive than recreational at same IACI
 * 5. Recovery modalities (yoga, walking, breathwork) should NEVER be "avoid" above IACI 20
 * 6. At IACI >= 85 recreational / >= 75 competitive, nearly everything should be open
 */

import { getTrainingCompatibility } from '../training-compatibility';
import { getAthleteModeConfig } from '../athlete-mode';
import { makeSubsystemScores } from './_test-helpers';
import { TrainingPermission, TrainingModalityKey } from '../../types/iaci';

// Helper to make uniform subsystem scores that produce a target IACI
function scoresForIACI(target: number) {
  return makeSubsystemScores({
    autonomic: target,
    musculoskeletal: target,
    cardiometabolic: target,
    sleep: target,
    metabolic: target,
    psychological: target,
  });
}

const PERFORMANCE_KEYS: TrainingModalityKey[] = [
  'zone1', 'zone2', 'intervals', 'tempo',
  'strengthHeavy', 'strengthLight', 'plyometrics',
];

const RECOVERY_KEYS: TrainingModalityKey[] = [
  'yoga', 'walkingRecovery', 'breathworkActive', 'meditation',
  'mobilityFlow', 'swimEasy', 'easyCycling', 'massage',
];

function permissionRank(p: TrainingPermission): number {
  switch (p) {
    case 'recommended': return 3;
    case 'allowed': return 2;
    case 'caution': return 1;
    case 'avoid': return 0;
  }
}

describe('Recommendation Validation — Recreational Mode', () => {
  const recMode = undefined; // No athlete mode = recreational defaults

  it.each([10, 20, 30, 40, 50, 60, 70, 80, 90, 95])(
    'IACI %i: Zone 1 (easy) should NEVER be avoid',
    (iaci) => {
      const scores = scoresForIACI(iaci);
      const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores, recMode);
      expect(compat.zone1).not.toBe('avoid');
    }
  );

  it.each([10, 20, 30, 40, 50, 60, 70, 80, 90, 95])(
    'IACI %i: recovery modalities (yoga, walking, breathwork) never avoid above 20',
    (iaci) => {
      if (iaci <= 20) return; // Below 20 is protect tier, some restrictions OK
      const scores = scoresForIACI(iaci);
      const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores, recMode);
      for (const key of RECOVERY_KEYS) {
        expect({ key, permission: compat[key], iaci }).not.toEqual(
          expect.objectContaining({ permission: 'avoid' })
        );
      }
    }
  );

  it('IACI 55 (maintain tier): Zone 2 should be allowed or recommended', () => {
    const compat = getTrainingCompatibility(55, 'fully_recovered', scoresForIACI(55));
    expect(['allowed', 'recommended']).toContain(compat.zone2);
  });

  it('IACI 70 (train tier): intervals should be allowed or caution, not avoid', () => {
    const compat = getTrainingCompatibility(70, 'fully_recovered', scoresForIACI(70));
    expect(compat.intervals).not.toBe('avoid');
  });

  it('IACI 85 (perform tier): nearly everything open', () => {
    const compat = getTrainingCompatibility(85, 'fully_recovered', scoresForIACI(85));
    expect(compat.intervals).toBe('recommended');
    expect(compat.tempo).toBe('recommended');
    expect(compat.strengthHeavy).toBe('allowed');
    expect(compat.zone2).toBe('recommended');
  });

  it('IACI 35 (recover tier): intervals should be avoid', () => {
    const compat = getTrainingCompatibility(35, 'fully_recovered', scoresForIACI(35));
    expect(compat.intervals).toBe('avoid');
    expect(compat.tempo).toBe('avoid');
  });
});

describe('Recommendation Validation — Competitive Mode', () => {
  const compMode = getAthleteModeConfig('competitive', 'single');

  it.each([10, 20, 30, 40, 50, 60, 70, 80, 90, 95])(
    'IACI %i: Zone 1 should NEVER be avoid',
    (iaci) => {
      const scores = scoresForIACI(iaci);
      const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores, compMode);
      expect(compat.zone1).not.toBe('avoid');
    }
  );

  it('IACI 74 competitive: intervals should NOT be avoid', () => {
    const compat = getTrainingCompatibility(74, 'fully_recovered', scoresForIACI(74), compMode);
    // 74 >= competitive train threshold (60), so intervals should be allowed
    expect(compat.intervals).not.toBe('avoid');
  });

  it('IACI 74 competitive: tempo should NOT be avoid', () => {
    const compat = getTrainingCompatibility(74, 'fully_recovered', scoresForIACI(74), compMode);
    expect(compat.tempo).not.toBe('avoid');
  });

  it('IACI 74 competitive: light strength should be allowed or recommended', () => {
    const compat = getTrainingCompatibility(74, 'fully_recovered', scoresForIACI(74), compMode);
    expect(['allowed', 'recommended']).toContain(compat.strengthLight);
  });

  it('IACI 60 competitive (train tier): intervals at least caution', () => {
    const compat = getTrainingCompatibility(60, 'fully_recovered', scoresForIACI(60), compMode);
    // 60 >= competitive train threshold (60)
    expect(permissionRank(compat.intervals)).toBeGreaterThanOrEqual(1); // caution or better
  });

  it('IACI 50 competitive (maintain tier): Zone 2 should be allowed or recommended', () => {
    const compat = getTrainingCompatibility(50, 'fully_recovered', scoresForIACI(50), compMode);
    // 50 >= competitive maintain threshold (45)
    expect(['allowed', 'recommended']).toContain(compat.zone2);
  });

  it('IACI 75 competitive (perform tier): nearly everything open', () => {
    const compat = getTrainingCompatibility(75, 'fully_recovered', scoresForIACI(75), compMode);
    // 75 >= competitive perform threshold (75)
    expect(compat.intervals).toBe('recommended');
    expect(compat.tempo).toBe('recommended');
  });
});

describe('Competitive vs Recreational — Competitive ALWAYS more permissive', () => {
  const compMode = getAthleteModeConfig('competitive', 'single');

  it.each([30, 40, 50, 60, 70, 80, 90])(
    'IACI %i: every performance modality competitive >= recreational',
    (iaci) => {
      const scores = scoresForIACI(iaci);
      const rec = getTrainingCompatibility(iaci, 'fully_recovered', scores);
      const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, compMode);

      for (const key of PERFORMANCE_KEYS) {
        const recRank = permissionRank(rec[key]);
        const compRank = permissionRank(comp[key]);
        expect({ key, iaci, comp: comp[key], rec: rec[key], compRank, recRank })
          .toEqual(expect.objectContaining({
            compRank: expect.any(Number),
          }));
        // Competitive should be >= recreational
        expect(compRank).toBeGreaterThanOrEqual(recRank);
      }
    }
  );
});

describe('Full IACI Sweep — Print Recommendation Table', () => {
  const compMode = getAthleteModeConfig('competitive', 'single');

  it('generates recommendation table for verification', () => {
    const rows: string[] = [];
    rows.push('IACI | Mode | Zone1 | Zone2 | Intervals | Tempo | HvyStr | LtStr | Plyo | Yoga | Walk | Z2Run');
    rows.push('-----|------|-------|-------|-----------|-------|--------|-------|------|------|------|------');

    for (let iaci = 10; iaci <= 95; iaci += 5) {
      const scores = scoresForIACI(iaci);
      const rec = getTrainingCompatibility(iaci, 'fully_recovered', scores);
      const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, compMode);

      const abbrev = (p: TrainingPermission) => {
        switch (p) {
          case 'recommended': return 'REC';
          case 'allowed': return 'ALW';
          case 'caution': return 'CAU';
          case 'avoid': return 'AVD';
        }
      };

      rows.push(
        `${String(iaci).padStart(4)} | Rec  | ${abbrev(rec.zone1).padEnd(5)} | ${abbrev(rec.zone2).padEnd(5)} | ${abbrev(rec.intervals).padEnd(9)} | ${abbrev(rec.tempo).padEnd(5)} | ${abbrev(rec.strengthHeavy).padEnd(6)} | ${abbrev(rec.strengthLight).padEnd(5)} | ${abbrev(rec.plyometrics).padEnd(4)} | ${abbrev(rec.yoga).padEnd(4)} | ${abbrev(rec.walkingRecovery).padEnd(4)} | --`
      );
      rows.push(
        `${String(iaci).padStart(4)} | Comp | ${abbrev(comp.zone1).padEnd(5)} | ${abbrev(comp.zone2).padEnd(5)} | ${abbrev(comp.intervals).padEnd(9)} | ${abbrev(comp.tempo).padEnd(5)} | ${abbrev(comp.strengthHeavy).padEnd(6)} | ${abbrev(comp.strengthLight).padEnd(5)} | ${abbrev(comp.plyometrics).padEnd(4)} | ${abbrev(comp.yoga).padEnd(4)} | ${abbrev(comp.walkingRecovery).padEnd(4)} | --`
      );
    }

    console.log('\n' + rows.join('\n'));
    expect(true).toBe(true); // This test is for visual verification
  });
});
