import { validateWebhookPayload, processWebhookEvent, WhoopWebhookPayload } from '../whoop/webhook-handler';

describe('validateWebhookPayload', () => {
  it('returns error for null payload', () => {
    expect(validateWebhookPayload(null)).toBe('Payload must be a non-null object');
  });

  it('returns error for non-object payload', () => {
    expect(validateWebhookPayload('string')).toBe('Payload must be a non-null object');
  });

  it('returns error for invalid event type', () => {
    expect(validateWebhookPayload({ type: 'invalid', data: {}, user_id: 1 }))
      .toContain('Invalid event type');
  });

  it('returns error for missing data', () => {
    expect(validateWebhookPayload({ type: 'recovery.updated', user_id: 1 }))
      .toBe('Payload must contain a "data" object');
  });

  it('returns error for missing user_id', () => {
    expect(validateWebhookPayload({ type: 'recovery.updated', data: {} }))
      .toBe('Payload must contain a numeric "user_id"');
  });

  it('returns null for valid recovery payload', () => {
    expect(validateWebhookPayload({
      type: 'recovery.updated',
      data: { created_at: '2024-01-15T08:00:00Z', score: {} },
      user_id: 123,
    })).toBeNull();
  });

  it('returns null for valid sleep payload', () => {
    expect(validateWebhookPayload({
      type: 'sleep.updated',
      data: { start: '2024-01-14T22:00:00Z' },
      user_id: 123,
    })).toBeNull();
  });

  it('returns null for valid workout payload', () => {
    expect(validateWebhookPayload({
      type: 'workout.updated',
      data: { start: '2024-01-15T10:00:00Z' },
      user_id: 123,
    })).toBeNull();
  });
});

describe('processWebhookEvent', () => {
  it('processes recovery.updated event', () => {
    const payload: WhoopWebhookPayload = {
      user_id: 123,
      id: 1,
      type: 'recovery.updated',
      trace_id: 'trace-1',
      created_at: '2024-01-15T08:00:00Z',
      data: {
        cycle_id: 1,
        sleep_id: 1,
        user_id: 123,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
        score: {
          user_calibrating: false,
          recovery_score: 85,
          resting_heart_rate: 55,
          hrv_rmssd_milli: 65,
          spo2_percentage: 97,
          skin_temp_celsius: 0.1,
        },
      } as any,
    };

    const record = processWebhookEvent(payload);
    expect(record.date).toBe('2024-01-15');
    expect(record.recovery.hrvRmssd).toBe(65);
    expect(record.recovery.restingHeartRate).toBe(55);
    expect(record.recovery.recoveryScore).toBe(85);
    expect(record.source).toBe('whoop');
  });

  it('processes sleep.updated event', () => {
    const payload: WhoopWebhookPayload = {
      user_id: 123,
      id: 2,
      type: 'sleep.updated',
      trace_id: 'trace-2',
      created_at: '2024-01-15T06:00:00Z',
      data: {
        id: 2,
        user_id: 123,
        start: '2024-01-14T22:00:00Z',
        end: '2024-01-15T06:00:00Z',
        nap: false,
        score: {
          sleep_performance_percentage: 88,
          sleep_consistency_percentage: 92,
          respiratory_rate: 15.2,
          stage_summary: {
            total_light_sleep_time_milli: 14400000,
            total_slow_wave_sleep_time_milli: 5400000,
            total_rem_sleep_time_milli: 7200000,
            total_awake_time_milli: 1800000,
            disturbance_count: 2,
            sleep_cycle_count: 4,
          },
        },
      } as any,
    };

    const record = processWebhookEvent(payload);
    expect(record.date).toBe('2024-01-14');
    expect(record.sleep.totalSleepMs).toBe(14400000 + 5400000 + 7200000);
    expect(record.sleep.sleepPerformancePct).toBe(88);
    expect(record.sleep.remSleepMs).toBe(7200000);
  });

  it('processes workout.updated event', () => {
    const payload: WhoopWebhookPayload = {
      user_id: 123,
      id: 3,
      type: 'workout.updated',
      trace_id: 'trace-3',
      created_at: '2024-01-15T11:00:00Z',
      data: {
        id: 3,
        user_id: 123,
        sport_id: 0,
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
        score: {
          strain: 12.5,
          average_heart_rate: 155,
          max_heart_rate: 178,
          kilojoule: 2500,
          zone_duration: {
            zone_one_milli: 600000,
            zone_two_milli: 1200000,
            zone_three_milli: 900000,
            zone_four_milli: 600000,
            zone_five_milli: 300000,
          },
        },
      } as any,
    };

    const record = processWebhookEvent(payload);
    expect(record.date).toBe('2024-01-15');
    expect(record.workouts).toHaveLength(1);
    expect(record.workouts[0].strainScore).toBe(12.5);
    expect(record.workouts[0].workoutType).toBe('Running');
    expect(record.workouts[0].caloriesBurned).toBe(Math.round(2500 / 4.184));
  });

  it('handles recovery without score', () => {
    const payload: WhoopWebhookPayload = {
      user_id: 123,
      id: 1,
      type: 'recovery.updated',
      trace_id: 'trace-1',
      created_at: '2024-01-15T08:00:00Z',
      data: {
        cycle_id: 1,
        sleep_id: 1,
        user_id: 123,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z',
        score: null,
      } as any,
    };

    const record = processWebhookEvent(payload);
    expect(record.recovery.hrvRmssd).toBeNull();
  });
});
