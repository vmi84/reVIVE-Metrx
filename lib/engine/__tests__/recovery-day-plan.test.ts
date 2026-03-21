import { generateRecoveryDayPlan } from '../recovery-day-plan';
import { makeSubsystemScores, makeMockLoadCapacity, makeStressFactor } from './_test-helpers';
import { SubsystemKey } from '../../types/iaci';

function makeHighStressCapacity(overrides: Partial<Record<SubsystemKey, number>> = {}) {
  const stressValues: Record<SubsystemKey, number> = {
    autonomic: 60, musculoskeletal: 55, cardiometabolic: 50,
    sleep: 45, metabolic: 40, psychological: 35, neurological: 30,
    ...overrides,
  };
  const subsystemStress = Object.fromEntries(
    Object.entries(stressValues).map(([k, v]) => [k, makeStressFactor(k as SubsystemKey, v)])
  ) as any;
  return makeMockLoadCapacity({
    subsystemStress,
    subsystemRanking: Object.keys(stressValues)
      .sort((a, b) => stressValues[b as SubsystemKey] - stressValues[a as SubsystemKey]) as SubsystemKey[],
    systemicStress: 60,
    stressLevel: 'high',
  });
}

describe('generateRecoveryDayPlan', () => {
  it('returns all timeline blocks', () => {
    const lc = makeHighStressCapacity();
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), { quads: 3 }, 75);
    expect(plan.timeline.morning).toBeDefined();
    expect(plan.timeline.midMorning).toBeDefined();
    expect(plan.timeline.afternoon).toBeDefined();
    expect(plan.timeline.evening).toBeDefined();
  });

  it('sets date and overall focus', () => {
    const lc = makeHighStressCapacity();
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    expect(plan.date).toBe('2024-01-15');
    expect(plan.overallFocus).toContain('Multi-systemic recovery');
  });

  it('identifies limiting subsystems (stress > 35)', () => {
    const lc = makeHighStressCapacity({ psychological: 30 }); // below threshold
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    expect(plan.limitingSubsystems).not.toContain('psychological');
    expect(plan.limitingSubsystems).toContain('autonomic');
  });

  it('includes autonomic recovery actions for high autonomic stress', () => {
    const lc = makeHighStressCapacity({ autonomic: 75 });
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    const allModalities = [
      ...plan.timeline.morning.modalities,
      ...plan.timeline.afternoon.modalities,
      ...plan.timeline.evening.modalities,
    ];
    expect(allModalities.some(m => m.protocolSlug === 'coherent-breathing')).toBe(true);
  });

  it('includes musculoskeletal foam rolling for sore areas', () => {
    const lc = makeHighStressCapacity({ musculoskeletal: 60 });
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), { quads: 3, hamstrings: 2 }, 75);
    const midMorning = plan.timeline.midMorning.modalities;
    expect(midMorning.some(m => m.protocolSlug.includes('foam-roll'))).toBe(true);
  });

  it('includes sleep recovery for high sleep stress', () => {
    const lc = makeHighStressCapacity({ sleep: 65 });
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    const allMods = [
      ...plan.timeline.morning.modalities,
      ...plan.timeline.evening.modalities,
    ];
    expect(allMods.some(m => m.protocolSlug === 'sunlight-exposure')).toBe(true);
  });

  it('caps morning to 3 actions', () => {
    const lc = makeHighStressCapacity();
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    expect(plan.timeline.morning.modalities.length).toBeLessThanOrEqual(3);
  });

  it('caps mid-morning to 5 actions', () => {
    const lc = makeHighStressCapacity();
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), { quads: 4, hamstrings: 3, calves: 3, glutes: 2 }, 75);
    expect(plan.timeline.midMorning.modalities.length).toBeLessThanOrEqual(5);
  });

  it('deduplicates modalities across subsystems', () => {
    const lc = makeHighStressCapacity({ autonomic: 60, psychological: 60 });
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    const allSlugs = [
      ...plan.timeline.morning.modalities,
      ...plan.timeline.midMorning.modalities,
      ...plan.timeline.afternoon.modalities,
      ...plan.timeline.evening.modalities,
    ].map(m => m.protocolSlug);
    const uniqueSlugs = [...new Set(allSlugs)];
    expect(allSlugs.length).toBe(uniqueSlugs.length);
  });

  describe('nutrition protocol', () => {
    it('calculates hydration from weight', () => {
      const lc = makeHighStressCapacity();
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
      expect(plan.nutritionProtocol.hydrationTargetMl).toBe(Math.round(75 * 35));
    });

    it('defaults hydration to 2500 when weight unknown', () => {
      const lc = makeHighStressCapacity();
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, null);
      expect(plan.nutritionProtocol.hydrationTargetMl).toBe(2500);
    });

    it('includes 4 protein timings', () => {
      const lc = makeHighStressCapacity();
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
      expect(plan.nutritionProtocol.proteinTimings).toHaveLength(4);
    });
  });

  describe('sleep protocol', () => {
    it('targets 9 hours for high sleep stress', () => {
      const lc = makeHighStressCapacity({ sleep: 70 });
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
      expect(plan.sleepProtocol.targetHours).toBe(9.0);
    });

    it('targets 8 hours for low sleep stress', () => {
      const lc = makeHighStressCapacity({ sleep: 30 });
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
      expect(plan.sleepProtocol.targetHours).toBe(8.0);
    });

    it('includes sleep hygiene items', () => {
      const lc = makeHighStressCapacity();
      const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
      expect(plan.sleepProtocol.sleepHygiene.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('total estimated minutes is sum of all blocks', () => {
    const lc = makeHighStressCapacity();
    const plan = generateRecoveryDayPlan('2024-01-15', lc, makeSubsystemScores(), {}, 75);
    const expected = plan.timeline.morning.totalMinutes +
      plan.timeline.midMorning.totalMinutes +
      plan.timeline.afternoon.totalMinutes +
      plan.timeline.evening.totalMinutes;
    expect(plan.totalEstimatedMinutes).toBe(expected);
  });
});
