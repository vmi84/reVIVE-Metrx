import { gatherAssistantContext } from '../assistant-context';
import { useDailyStore } from '../../../store/daily-store';
import { usePhysiologyStore } from '../../../store/physiology-store';
import { useWorkoutStore } from '../../../store/workout-store';

describe('gatherAssistantContext', () => {
  beforeEach(() => {
    // Reset stores to default state
    useDailyStore.setState({
      iaci: null,
      checkinCompleted: false,
      deviceSynced: false,
      deviceSource: null,
    });
    useWorkoutStore.setState({
      recentWorkouts: [],
      activeWorkout: null,
    });
  });

  it('returns null fields when no data is available', () => {
    const ctx = gatherAssistantContext();
    expect(ctx.iaciScore).toBeNull();
    expect(ctx.readinessTier).toBeNull();
    expect(ctx.phenotype).toBeNull();
    expect(ctx.subsystems).toBeNull();
    expect(ctx.penalties).toEqual([]);
    expect(ctx.limiters).toEqual([]);
    expect(ctx.protocolClass).toBeNull();
    expect(ctx.checkinCompleted).toBe(false);
    expect(ctx.deviceSynced).toBe(false);
    expect(ctx.deviceSource).toBeNull();
    expect(ctx.recentWorkoutCount).toBe(0);
  });

  it('reads checkin and device status from daily store', () => {
    useDailyStore.setState({
      checkinCompleted: true,
      deviceSynced: true,
      deviceSource: 'whoop',
    });

    const ctx = gatherAssistantContext();
    expect(ctx.checkinCompleted).toBe(true);
    expect(ctx.deviceSynced).toBe(true);
    expect(ctx.deviceSource).toBe('whoop');
  });

  it('reads device-agnostic source labels', () => {
    // Simulate Garmin as source — context should work for any device
    useDailyStore.setState({
      deviceSynced: true,
      deviceSource: 'garmin',
    });

    const ctx = gatherAssistantContext();
    expect(ctx.deviceSource).toBe('garmin');
    expect(ctx.deviceSynced).toBe(true);
  });

  it('reads workout count from workout store', () => {
    useWorkoutStore.setState({
      recentWorkouts: [
        { id: '1', date: '2024-01-15', workoutType: 'running' } as any,
        { id: '2', date: '2024-01-14', workoutType: 'cycling' } as any,
      ],
    });

    const ctx = gatherAssistantContext();
    expect(ctx.recentWorkoutCount).toBe(2);
  });

  it('extracts IACI data when available', () => {
    useDailyStore.setState({
      iaci: {
        score: 72,
        readinessTier: 'train',
        phenotype: {
          key: 'locally_fatigued',
          label: 'Locally Fatigued',
          primaryLimiters: ['musculoskeletal'],
          description: 'test',
        },
        subsystemScores: {
          autonomic: { score: 80 },
          musculoskeletal: { score: 55 },
          cardiometabolic: { score: 75 },
          sleep: { score: 70 },
          metabolic: { score: 85 },
          psychological: { score: 78 },
        },
        penalties: [{ name: 'tissue_risk', points: 5 }],
        protocol: {
          protocolClass: 'B',
          recommendedTraining: [
            { key: 'easyCycling', label: 'Light Cycling' },
            { key: 'yoga', label: 'Yoga' },
            { key: 'walkingRecovery', label: 'Walking' },
          ],
          trainingCompatibility: {},
        },
      } as any,
    });

    const ctx = gatherAssistantContext();
    expect(ctx.iaciScore).toBe(72);
    expect(ctx.readinessTier).toBe('train');
    expect(ctx.phenotype).toBe('Locally Fatigued');
    expect(ctx.subsystems).toEqual({
      autonomic: 80,
      musculoskeletal: 55,
      cardiometabolic: 75,
      sleep: 70,
      metabolic: 85,
      psychological: 78,
    });
    expect(ctx.penalties).toEqual(['tissue_risk']);
    expect(ctx.limiters).toEqual(['musculoskeletal']);
    expect(ctx.protocolClass).toBe('B');
    expect(ctx.topModalities).toEqual(['Light Cycling', 'Yoga', 'Walking']);
  });

  it('returns wearable metrics as null when no physiology data', () => {
    const ctx = gatherAssistantContext();
    expect(ctx.hrv).toBeNull();
    expect(ctx.rhr).toBeNull();
    expect(ctx.recoveryScore).toBeNull();
    expect(ctx.sleepHours).toBeNull();
  });

  it('context fields are device-agnostic (no Whoop-specific references)', () => {
    const ctx = gatherAssistantContext();
    const keys = Object.keys(ctx);
    // Verify no field name contains 'whoop' — context is device-agnostic
    keys.forEach((key) => {
      expect(key.toLowerCase()).not.toContain('whoop');
    });
  });
});
