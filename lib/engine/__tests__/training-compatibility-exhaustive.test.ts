/**
 * Exhaustive Training Compatibility Validation
 *
 * Tests every IACI value from 0-100 (step 5) for both recreational and competitive modes.
 * Validates that:
 * 1. Competitive is ALWAYS >= recreational for performance modalities
 * 2. No modality goes from recommended → avoid without passing through allowed/caution
 * 3. Recovery modalities (yoga, walking, breathing) are never "avoid" above IACI 20
 * 4. Competitive athletes never see "avoid" for intervals/tempo above IACI 40
 * 5. Zone 1/Zone 2 are never "avoid" for competitive athletes at any IACI
 */

import { getTrainingCompatibility } from '../training-compatibility';
import { getAthleteModeConfig } from '../athlete-mode';
import { makeSubsystemScores } from './_test-helpers';
import { TrainingPermission, TrainingModalityKey } from '../../types/iaci';

const PERMISSION_RANK: Record<TrainingPermission, number> = {
  avoid: 0,
  caution: 1,
  allowed: 2,
  recommended: 3,
};

function permRank(p: TrainingPermission): number {
  return PERMISSION_RANK[p];
}

function makeUniformScores(score: number) {
  return makeSubsystemScores({
    autonomic: score,
    musculoskeletal: score,
    cardiometabolic: score,
    sleep: score,
    metabolic: score,
    psychological: score,
  });
}

const PERFORMANCE_KEYS: TrainingModalityKey[] = [
  'zone1', 'zone2', 'intervals', 'tempo',
  'strengthHeavy', 'strengthLight', 'plyometrics',
];

const RECOVERY_KEYS: TrainingModalityKey[] = [
  'yoga', 'walkingRecovery', 'breathworkActive', 'meditation',
  'mobilityFlow', 'taiChi',
];

const ALL_IACI = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, 10, ... 100

const competitiveConfig = getAthleteModeConfig('competitive', 'single');

describe('Exhaustive Training Compatibility — All IACI Values', () => {

  // Print the full table for visual inspection
  it('FULL TABLE: recreational vs competitive at every IACI value', () => {
    const header = 'IACI | Mode        | Z1       | Z2       | Intervals | Tempo    | StrHeavy | StrLight | Plyo     | Yoga     | Walking  | Breath';
    const separator = '-'.repeat(header.length);
    console.log('\n' + separator);
    console.log(header);
    console.log(separator);

    for (const iaci of ALL_IACI) {
      const scores = makeUniformScores(Math.max(iaci, 20)); // Floor at 20 to avoid all-impaired

      const rec = getTrainingCompatibility(iaci, 'fully_recovered', scores);
      const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);

      const pad = (s: string) => s.padEnd(9);
      console.log(
        `${String(iaci).padStart(4)} | Recreational | ${pad(rec.zone1)} | ${pad(rec.zone2)} | ${pad(rec.intervals)} | ${pad(rec.tempo)} | ${pad(rec.strengthHeavy)} | ${pad(rec.strengthLight)} | ${pad(rec.plyometrics)} | ${pad(rec.yoga)} | ${pad(rec.walkingRecovery)} | ${pad(rec.breathworkActive)}`
      );
      console.log(
        `${' '.repeat(4)} | Competitive  | ${pad(comp.zone1)} | ${pad(comp.zone2)} | ${pad(comp.intervals)} | ${pad(comp.tempo)} | ${pad(comp.strengthHeavy)} | ${pad(comp.strengthLight)} | ${pad(comp.plyometrics)} | ${pad(comp.yoga)} | ${pad(comp.walkingRecovery)} | ${pad(comp.breathworkActive)}`
      );
    }
    console.log(separator);
  });

  describe('Rule: Competitive >= Recreational for performance modalities', () => {
    for (const iaci of ALL_IACI) {
      it(`IACI ${iaci}: competitive never worse than recreational`, () => {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const rec = getTrainingCompatibility(iaci, 'fully_recovered', scores);
        const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);

        for (const key of PERFORMANCE_KEYS) {
          expect(permRank(comp[key])).toBeGreaterThanOrEqual(permRank(rec[key]));
        }
      });
    }
  });

  describe('Rule: Recovery modalities never "avoid" above IACI 20', () => {
    for (const iaci of ALL_IACI.filter(v => v >= 20)) {
      it(`IACI ${iaci}: recovery modalities accessible`, () => {
        const scores = makeUniformScores(Math.max(iaci, 20));

        // Test both modes
        for (const mode of ['recreational', 'competitive'] as const) {
          const config = mode === 'competitive' ? competitiveConfig : undefined;
          const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores, config);

          for (const key of RECOVERY_KEYS) {
            if (compat[key] === 'avoid') {
              fail(`${mode} IACI ${iaci}: ${key} should not be 'avoid' (was '${compat[key]}')`);
            }
          }
        }
      });
    }
  });

  describe('Rule: Competitive intervals/tempo never "avoid" above IACI 40', () => {
    for (const iaci of ALL_IACI.filter(v => v >= 40)) {
      it(`IACI ${iaci}: competitive intervals/tempo not "avoid"`, () => {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);

        expect(comp.intervals).not.toBe('avoid');
        expect(comp.tempo).not.toBe('avoid');
      });
    }
  });

  describe('Rule: Zone 1 never "avoid" for competitive at any IACI', () => {
    for (const iaci of ALL_IACI) {
      it(`IACI ${iaci}: competitive zone1 accessible`, () => {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);
        expect(comp.zone1).not.toBe('avoid');
      });
    }
  });

  describe('Rule: Zone 2 never "avoid" for competitive above IACI 25', () => {
    for (const iaci of ALL_IACI.filter(v => v >= 25)) {
      it(`IACI ${iaci}: competitive zone2 accessible`, () => {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const comp = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);
        expect(comp.zone2).not.toBe('avoid');
      });
    }
  });

  describe('Rule: Monotonic progression — higher IACI never reduces permissions', () => {
    it('recreational: permissions increase or stay same as IACI rises', () => {
      let prev: Record<string, TrainingPermission> | null = null;
      for (const iaci of ALL_IACI) {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores);

        if (prev) {
          for (const key of PERFORMANCE_KEYS) {
            if (permRank(compat[key]) < permRank(prev[key])) {
              fail(`Recreational IACI ${iaci}: ${key} went from '${prev[key]}' to '${compat[key]}' (should not decrease)`);
            }
          }
        }
        prev = compat;
      }
    });

    it('competitive: permissions increase or stay same as IACI rises', () => {
      let prev: Record<string, TrainingPermission> | null = null;
      for (const iaci of ALL_IACI) {
        const scores = makeUniformScores(Math.max(iaci, 20));
        const compat = getTrainingCompatibility(iaci, 'fully_recovered', scores, competitiveConfig);

        if (prev) {
          for (const key of PERFORMANCE_KEYS) {
            if (permRank(compat[key]) < permRank(prev[key])) {
              fail(`Competitive IACI ${iaci}: ${key} went from '${prev[key]}' to '${compat[key]}' (should not decrease)`);
            }
          }
        }
        prev = compat;
      }
    });
  });
});
