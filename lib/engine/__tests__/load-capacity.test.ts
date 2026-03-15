import { computeLoadCapacity } from '../load-capacity';
import { makeLoadCapacityInputs, makeSubsystemScores } from './_test-helpers';

describe('computeLoadCapacity', () => {
  describe('stress level classification', () => {
    it('classifies low stress for high scores', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 90, musculoskeletal: 90, cardiometabolic: 90,
          sleep: 90, metabolic: 90, psychological: 90,
        }),
      });
      const result = computeLoadCapacity(inputs);
      expect(result.stressLevel).toBe('low');
      expect(result.systemicStress).toBeLessThan(30);
    });

    it('classifies high stress for low scores', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 30, musculoskeletal: 25, cardiometabolic: 35,
          sleep: 20, metabolic: 30, psychological: 35,
        }),
      });
      const result = computeLoadCapacity(inputs);
      expect(result.stressLevel).toBe('high');
    });

    it('classifies moderate stress for mid-range scores', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 60, musculoskeletal: 55, cardiometabolic: 65,
          sleep: 60, metabolic: 65, psychological: 70,
        }),
      });
      const result = computeLoadCapacity(inputs);
      expect(result.stressLevel).toBe('moderate');
    });
  });

  describe('Whoop modifiers', () => {
    it('autonomic stress increases with low Whoop recovery', () => {
      const highRecovery = makeLoadCapacityInputs({ whoopRecoveryScore: 80 });
      const lowRecovery = makeLoadCapacityInputs({ whoopRecoveryScore: 25 });
      const r1 = computeLoadCapacity(highRecovery);
      const r2 = computeLoadCapacity(lowRecovery);
      expect(r2.subsystemStress.autonomic.totalStress).toBeGreaterThan(
        r1.subsystemStress.autonomic.totalStress
      );
    });

    it('sleep stress increases with low Whoop sleep score', () => {
      const goodSleep = makeLoadCapacityInputs({ whoopSleepScore: 85 });
      const poorSleep = makeLoadCapacityInputs({ whoopSleepScore: 40 });
      const r1 = computeLoadCapacity(goodSleep);
      const r2 = computeLoadCapacity(poorSleep);
      expect(r2.subsystemStress.sleep.totalStress).toBeGreaterThan(
        r1.subsystemStress.sleep.totalStress
      );
    });
  });

  describe('musculoskeletal modifiers', () => {
    it('increases with high soreness', () => {
      const noSoreness = makeLoadCapacityInputs({ sorenessMap: {} });
      const highSoreness = makeLoadCapacityInputs({
        sorenessMap: { quads: 4, hamstrings: 3 },
      });
      const r1 = computeLoadCapacity(noSoreness);
      const r2 = computeLoadCapacity(highSoreness);
      expect(r2.subsystemStress.musculoskeletal.totalStress).toBeGreaterThan(
        r1.subsystemStress.musculoskeletal.totalStress
      );
    });

    it('increases with heavy legs', () => {
      const noHeavy = makeLoadCapacityInputs({ heavyLegs: false });
      const heavy = makeLoadCapacityInputs({ heavyLegs: true });
      const r1 = computeLoadCapacity(noHeavy);
      const r2 = computeLoadCapacity(heavy);
      expect(r2.subsystemStress.musculoskeletal.totalStress).toBeGreaterThanOrEqual(
        r1.subsystemStress.musculoskeletal.totalStress
      );
    });

    it('increases with pain locations', () => {
      const noPain = makeLoadCapacityInputs({ painLocations: [] });
      const withPain = makeLoadCapacityInputs({ painLocations: ['knee', 'ankle'] });
      const r1 = computeLoadCapacity(noPain);
      const r2 = computeLoadCapacity(withPain);
      expect(r2.subsystemStress.musculoskeletal.totalStress).toBeGreaterThan(
        r1.subsystemStress.musculoskeletal.totalStress
      );
    });
  });

  describe('cardiometabolic modifiers', () => {
    it('increases with high ACWR', () => {
      const normal = makeLoadCapacityInputs({ acwr: 1.0 });
      const high = makeLoadCapacityInputs({ acwr: 1.5 });
      const r1 = computeLoadCapacity(normal);
      const r2 = computeLoadCapacity(high);
      expect(r2.subsystemStress.cardiometabolic.totalStress).toBeGreaterThan(
        r1.subsystemStress.cardiometabolic.totalStress
      );
    });

    it('increases with high cumulative strain', () => {
      const normal = makeLoadCapacityInputs({ cumulativeStrain7d: 50 });
      const high = makeLoadCapacityInputs({ cumulativeStrain7d: 120 });
      const r1 = computeLoadCapacity(normal);
      const r2 = computeLoadCapacity(high);
      expect(r2.subsystemStress.cardiometabolic.totalStress).toBeGreaterThan(
        r1.subsystemStress.cardiometabolic.totalStress
      );
    });
  });

  describe('cross-system amplifiers', () => {
    it('amplifies when 3+ subsystems have high stress', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 30, musculoskeletal: 30, cardiometabolic: 30,
          sleep: 90, metabolic: 90, psychological: 90,
        }),
      });
      const result = computeLoadCapacity(inputs);
      // With amplifier, systemic stress should be higher than simple weighted avg
      const baseWeighted = (70 * 0.25) + (70 * 0.20) + (70 * 0.15) + (10 * 0.15) + (10 * 0.15) + (10 * 0.10);
      expect(result.systemicStress).toBeGreaterThanOrEqual(Math.round(baseWeighted));
    });
  });

  describe('area capacity', () => {
    it('assigns full intensity for no soreness', () => {
      const inputs = makeLoadCapacityInputs({ sorenessMap: { quads: 0 } });
      const result = computeLoadCapacity(inputs);
      expect(result.areaCapacity.quads.maxIntensity).toBe('full');
      expect(result.areaCapacity.quads.loadable).toBe(true);
    });

    it('assigns moderate intensity for soreness 2', () => {
      const inputs = makeLoadCapacityInputs({ sorenessMap: { quads: 2 } });
      const result = computeLoadCapacity(inputs);
      expect(result.areaCapacity.quads.maxIntensity).toBe('moderate');
    });

    it('assigns light intensity for soreness 3', () => {
      const inputs = makeLoadCapacityInputs({ sorenessMap: { quads: 3 } });
      const result = computeLoadCapacity(inputs);
      expect(result.areaCapacity.quads.maxIntensity).toBe('light');
      expect(result.areaCapacity.quads.loadable).toBe(false);
    });

    it('assigns none for soreness 4', () => {
      const inputs = makeLoadCapacityInputs({ sorenessMap: { quads: 4 } });
      const result = computeLoadCapacity(inputs);
      expect(result.areaCapacity.quads.maxIntensity).toBe('none');
    });

    it('overrides to none for pain locations', () => {
      const inputs = makeLoadCapacityInputs({
        sorenessMap: { quads: 1 },
        painLocations: ['quads'],
      });
      const result = computeLoadCapacity(inputs);
      expect(result.areaCapacity.quads.maxIntensity).toBe('none');
      expect(result.areaCapacity.quads.loadable).toBe(false);
    });
  });

  describe('workout focus', () => {
    it('recommends fitness_building for low stress', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 90, musculoskeletal: 90, cardiometabolic: 90,
          sleep: 90, metabolic: 90, psychological: 90,
        }),
      });
      const result = computeLoadCapacity(inputs);
      expect(result.workoutFocus).toBe('fitness_building');
    });

    it('recommends recovery_only for high stress', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 25, musculoskeletal: 30, cardiometabolic: 25,
          sleep: 20, metabolic: 30, psychological: 35,
        }),
      });
      const result = computeLoadCapacity(inputs);
      expect(result.workoutFocus).toBe('recovery_only');
    });

    it('recommends recovery_only when severe soreness present', () => {
      const inputs = makeLoadCapacityInputs({
        sorenessMap: { quads: 4 },
      });
      const result = computeLoadCapacity(inputs);
      expect(result.workoutFocus).toBe('recovery_only');
    });
  });

  describe('capacity band', () => {
    it('high capacity for low stress', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 90, musculoskeletal: 90, cardiometabolic: 90,
          sleep: 90, metabolic: 90, psychological: 90,
        }),
      });
      expect(computeLoadCapacity(inputs).capacityBand).toBe('high');
    });

    it('depleted capacity for very high stress', () => {
      const inputs = makeLoadCapacityInputs({
        subsystemScores: makeSubsystemScores({
          autonomic: 10, musculoskeletal: 10, cardiometabolic: 10,
          sleep: 10, metabolic: 10, psychological: 10,
        }),
      });
      expect(computeLoadCapacity(inputs).capacityBand).toBe('depleted');
    });
  });
});
