import { computeWorkoutImpact } from '../workout-impact';
import { makeSubsystemScores, makeMockLoadCapacity, makeStressFactor } from './_test-helpers';
import { WorkoutImpactInputs } from '../../types/load-capacity';

function makeWorkoutInputs(overrides: Partial<WorkoutImpactInputs['workout']> = {}): WorkoutImpactInputs {
  return {
    preIACI: { score: 75, subsystemScores: makeSubsystemScores() },
    preLoadCapacity: makeMockLoadCapacity(),
    workout: {
      type: 'run',
      durationMin: 60,
      strain: 12,
      rpe: 7,
      bodyAreasLoaded: ['quads', 'hamstrings', 'calves'],
      hrZones: { zone1: 10, zone2: 20, zone3: 15, zone4: 10, zone5: 5 },
      ...overrides,
    },
  };
}

describe('computeWorkoutImpact', () => {
  it('produces negative subsystem impacts', () => {
    const result = computeWorkoutImpact(makeWorkoutInputs());
    const impact = result.estimatedSubsystemImpact;
    expect(impact.autonomic).toBeLessThanOrEqual(0);
    expect(impact.musculoskeletal).toBeLessThanOrEqual(0);
    expect(impact.cardiometabolic).toBeLessThanOrEqual(0);
  });

  it('post-IACI is lower than pre-IACI', () => {
    const result = computeWorkoutImpact(makeWorkoutInputs());
    expect(result.estimatedPostIACI).toBeLessThanOrEqual(75);
  });

  it('post-IACI is clamped to 0-100', () => {
    const result = computeWorkoutImpact(makeWorkoutInputs({ strain: 21, rpe: 10, durationMin: 180 }));
    expect(result.estimatedPostIACI).toBeGreaterThanOrEqual(0);
    expect(result.estimatedPostIACI).toBeLessThanOrEqual(100);
  });

  it('higher strain causes more impact', () => {
    const low = computeWorkoutImpact(makeWorkoutInputs({ strain: 5 }));
    const high = computeWorkoutImpact(makeWorkoutInputs({ strain: 18 }));
    expect(high.estimatedSubsystemImpact.autonomic).toBeLessThan(
      low.estimatedSubsystemImpact.autonomic
    );
  });

  it('longer duration causes more impact', () => {
    const short = computeWorkoutImpact(makeWorkoutInputs({ durationMin: 30 }));
    const long = computeWorkoutImpact(makeWorkoutInputs({ durationMin: 120 }));
    expect(long.estimatedSubsystemImpact.musculoskeletal).toBeLessThan(
      short.estimatedSubsystemImpact.musculoskeletal
    );
  });

  it('amplifies autonomic impact when pre-existing stress is high', () => {
    const lowStress = makeMockLoadCapacity({
      subsystemStress: {
        ...makeMockLoadCapacity().subsystemStress,
        autonomic: makeStressFactor('autonomic', 20),
      },
    });
    const highStress = makeMockLoadCapacity({
      subsystemStress: {
        ...makeMockLoadCapacity().subsystemStress,
        autonomic: makeStressFactor('autonomic', 70),
      },
    });

    const r1 = computeWorkoutImpact({ ...makeWorkoutInputs(), preLoadCapacity: lowStress });
    const r2 = computeWorkoutImpact({ ...makeWorkoutInputs(), preLoadCapacity: highStress });
    expect(r2.estimatedSubsystemImpact.autonomic).toBeLessThan(
      r1.estimatedSubsystemImpact.autonomic
    );
  });

  it('sleep impact triggered by high intensity', () => {
    const lowIntensity = computeWorkoutImpact(makeWorkoutInputs({ strain: 5, rpe: 3 }));
    const highIntensity = computeWorkoutImpact(makeWorkoutInputs({ strain: 18, rpe: 9 }));
    expect(highIntensity.estimatedSubsystemImpact.sleep).toBeLessThan(0);
    expect(lowIntensity.estimatedSubsystemImpact.sleep).toBe(0);
  });

  it('psychological impact triggered by high RPE', () => {
    const lowRPE = computeWorkoutImpact(makeWorkoutInputs({ rpe: 4 }));
    const highRPE = computeWorkoutImpact(makeWorkoutInputs({ rpe: 9 }));
    expect(highRPE.estimatedSubsystemImpact.psychological).toBeLessThan(0);
    expect(lowRPE.estimatedSubsystemImpact.psychological).toBe(0);
  });

  it('maps impacted areas from workout body areas', () => {
    const result = computeWorkoutImpact(makeWorkoutInputs({
      bodyAreasLoaded: ['quads', 'hamstrings'],
    }));
    expect(result.impactedAreas).toHaveProperty('quads');
    expect(result.impactedAreas).toHaveProperty('hamstrings');
  });

  it('caps area soreness at 4', () => {
    const result = computeWorkoutImpact(makeWorkoutInputs({
      strain: 21,
      rpe: 10,
      durationMin: 180,
    }));
    Object.values(result.impactedAreas).forEach(s => {
      expect(s).toBeLessThanOrEqual(4);
    });
  });

  describe('recovery time estimate', () => {
    it('returns systemic hours', () => {
      const result = computeWorkoutImpact(makeWorkoutInputs());
      expect(result.recoveryTimeEstimate.systemicHours).toBeGreaterThan(0);
    });

    it('higher strain = longer recovery', () => {
      const low = computeWorkoutImpact(makeWorkoutInputs({ strain: 5 }));
      const high = computeWorkoutImpact(makeWorkoutInputs({ strain: 18 }));
      expect(high.recoveryTimeEstimate.systemicHours).toBeGreaterThanOrEqual(
        low.recoveryTimeEstimate.systemicHours
      );
    });

    it('depleted capacity multiplies recovery time', () => {
      const goodCap = makeMockLoadCapacity({ capacityBand: 'high' });
      const badCap = makeMockLoadCapacity({ capacityBand: 'depleted' });
      const r1 = computeWorkoutImpact({ ...makeWorkoutInputs(), preLoadCapacity: goodCap });
      const r2 = computeWorkoutImpact({ ...makeWorkoutInputs(), preLoadCapacity: badCap });
      expect(r2.recoveryTimeEstimate.systemicHours).toBeGreaterThan(
        r1.recoveryTimeEstimate.systemicHours
      );
    });
  });
});
