import { generateRecoveryPlan } from '../recovery-plan';
import { makeMockLoadCapacity } from './_test-helpers';
import { WorkoutImpactResult, SubsystemStressFactor } from '../../types/load-capacity';
import { SubsystemKey } from '../../types/iaci';

function makeStressFactor(subsystem: SubsystemKey, totalStress: number): SubsystemStressFactor {
  return { subsystem, baseStress: totalStress, modifiers: 0, totalStress, keyDrivers: [] };
}

function makeImpact(overrides: Partial<WorkoutImpactResult> = {}): WorkoutImpactResult {
  return {
    estimatedSubsystemImpact: {
      autonomic: -10, musculoskeletal: -15, cardiometabolic: -8,
      sleep: -3, metabolic: -5, psychological: -2,
    },
    estimatedPostIACI: 60,
    impactedAreas: { quads: 2, hamstrings: 3, calves: 1 },
    recoveryTimeEstimate: { systemicHours: 24, areaSpecific: { quads: 24, hamstrings: 30 } },
    ...overrides,
  };
}

describe('generateRecoveryPlan', () => {
  it('returns all four time blocks', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.immediate).toBeDefined();
    expect(plan.shortTerm).toBeDefined();
    expect(plan.evening).toBeDefined();
    expect(plan.nextDay).toBeDefined();
  });

  it('sets workoutDate and workoutType', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.workoutDate).toBe('2024-01-15');
    expect(plan.workoutType).toBe('run');
  });

  it('immediate actions include hydration and protein', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.immediate.actions.some(a => a.includes('Hydrate'))).toBe(true);
    expect(plan.immediate.actions.some(a => a.includes('Protein'))).toBe(true);
  });

  it('high intensity adds electrolytes to immediate', () => {
    const highImpact = makeImpact({
      estimatedSubsystemImpact: {
        autonomic: -15, musculoskeletal: -20, cardiometabolic: -12,
        sleep: -5, metabolic: -8, psychological: -5,
      },
    });
    const plan = generateRecoveryPlan('2024-01-15', 'run', highImpact, makeMockLoadCapacity());
    expect(plan.immediate.actions.some(a => a.includes('Electrolyte'))).toBe(true);
    expect(plan.immediate.durationMin).toBe(20);
  });

  it('low intensity has shorter immediate duration', () => {
    const lowImpact = makeImpact({
      estimatedSubsystemImpact: {
        autonomic: -2, musculoskeletal: -3, cardiometabolic: -1,
        sleep: 0, metabolic: -1, psychological: 0,
      },
    });
    const plan = generateRecoveryPlan('2024-01-15', 'walk', lowImpact, makeMockLoadCapacity());
    expect(plan.immediate.durationMin).toBe(10);
  });

  it('short-term targets impacted areas', () => {
    const impact = makeImpact({ impactedAreas: { quads: 3, hamstrings: 2 } });
    const plan = generateRecoveryPlan('2024-01-15', 'run', impact, makeMockLoadCapacity());
    expect(plan.shortTerm.modalities.length).toBeGreaterThan(0);
  });

  it('evening includes caffeine avoidance', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.evening.avoidances.some(a => a.includes('caffeine'))).toBe(true);
  });

  it('sets target sleep hours based on intensity', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.evening.targetSleepHours).toBeGreaterThanOrEqual(7.5);
    expect(plan.evening.targetSleepHours).toBeLessThanOrEqual(8.5);
  });

  it('next day includes dynamic warmup', () => {
    const plan = generateRecoveryPlan('2024-01-15', 'run', makeImpact(), makeMockLoadCapacity());
    expect(plan.nextDay.preWorkoutModalities).toContain('dynamic-warmup-flow');
  });

  it('next day expected focus based on post-IACI', () => {
    const highPostIACI = makeImpact({ estimatedPostIACI: 80 });
    const plan = generateRecoveryPlan('2024-01-15', 'run', highPostIACI, makeMockLoadCapacity());
    expect(plan.nextDay.expectedFocus).toBe('fitness_building');

    const lowPostIACI = makeImpact({ estimatedPostIACI: 30 });
    const plan2 = generateRecoveryPlan('2024-01-15', 'run', lowPostIACI, makeMockLoadCapacity());
    expect(plan2.nextDay.expectedFocus).toBe('recovery_only');
  });

  it('next day identifies critical areas (soreness >= 3)', () => {
    const impact = makeImpact({ impactedAreas: { quads: 3, hamstrings: 1 } });
    const plan = generateRecoveryPlan('2024-01-15', 'run', impact, makeMockLoadCapacity());
    expect(plan.nextDay.criticalAreas).toContain('quads');
    expect(plan.nextDay.criticalAreas).not.toContain('hamstrings');
  });
});
