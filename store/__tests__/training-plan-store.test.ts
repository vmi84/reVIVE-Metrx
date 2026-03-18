import { useTrainingPlanStore } from '../training-plan-store';

// Reset store before each test
beforeEach(() => {
  useTrainingPlanStore.setState({
    plannedSessions: {},
    weeklyTemplate: null,
  });
});

describe('Training Plan Store', () => {
  it('upserts a session for a date', () => {
    const { upsertSession, getSessionsForDate } = useTrainingPlanStore.getState();
    upsertSession({
      date: '2026-03-17',
      slot: 'am',
      type: 'Tempo Run',
      durationMin: 45,
      intensityZone: 'Threshold',
      source: 'manual',
    });
    const sessions = getSessionsForDate('2026-03-17');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].type).toBe('Tempo Run');
    expect(sessions[0].slot).toBe('am');
  });

  it('upserts multiple sessions for same date', () => {
    const { upsertSession, getSessionsForDate } = useTrainingPlanStore.getState();
    upsertSession({ date: '2026-03-17', slot: 'am', type: 'Intervals', source: 'manual' });
    upsertSession({ date: '2026-03-17', slot: 'pm', type: 'Easy Swim', source: 'manual' });
    expect(getSessionsForDate('2026-03-17')).toHaveLength(2);
  });

  it('replaces session with same slot+type', () => {
    const { upsertSession, getSessionsForDate } = useTrainingPlanStore.getState();
    upsertSession({ date: '2026-03-17', slot: 'am', type: 'Intervals', durationMin: 30, source: 'manual' });
    upsertSession({ date: '2026-03-17', slot: 'am', type: 'Intervals', durationMin: 45, source: 'manual' });
    const sessions = getSessionsForDate('2026-03-17');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].durationMin).toBe(45);
  });

  it('removes a session', () => {
    const { upsertSession, removeSession, getSessionsForDate } = useTrainingPlanStore.getState();
    upsertSession({ date: '2026-03-17', slot: 'am', type: 'Intervals', source: 'manual' });
    upsertSession({ date: '2026-03-17', slot: 'pm', type: 'Easy Swim', source: 'manual' });
    removeSession('2026-03-17', 'am', 'Intervals');
    expect(getSessionsForDate('2026-03-17')).toHaveLength(1);
    expect(getSessionsForDate('2026-03-17')[0].type).toBe('Easy Swim');
  });

  it('returns empty array for date with no sessions', () => {
    expect(useTrainingPlanStore.getState().getSessionsForDate('2026-01-01')).toEqual([]);
  });

  it('sets and clears weekly template', () => {
    const { setTemplate } = useTrainingPlanStore.getState();
    setTemplate({
      name: 'Build Week',
      sessions: [
        { dayOfWeek: 1, slot: 'am', type: 'Intervals', durationMin: 60 },
        { dayOfWeek: 3, slot: 'am', type: 'Tempo Run', durationMin: 45 },
      ],
    });
    expect(useTrainingPlanStore.getState().weeklyTemplate?.name).toBe('Build Week');
    setTemplate(null);
    expect(useTrainingPlanStore.getState().weeklyTemplate).toBeNull();
  });

  it('expands template into planned sessions', () => {
    const { setTemplate, expandTemplate, getSessionsForDate } = useTrainingPlanStore.getState();
    // Set a template with Monday (1) intervals
    setTemplate({
      name: 'Test',
      sessions: [
        { dayOfWeek: 1, slot: 'am', type: 'Intervals', durationMin: 60 },
      ],
    });
    // Expand from a known Monday
    expandTemplate('2026-03-16', 7); // Mar 16 2026 is a Monday
    const mondaySessions = getSessionsForDate('2026-03-16');
    expect(mondaySessions.length).toBeGreaterThanOrEqual(1);
    expect(mondaySessions.some(s => s.type === 'Intervals' && s.source === 'template')).toBe(true);
  });

  it('does not overwrite manual sessions with template', () => {
    const { upsertSession, setTemplate, expandTemplate, getSessionsForDate } = useTrainingPlanStore.getState();
    // Manual session on Monday
    upsertSession({ date: '2026-03-16', slot: 'am', type: 'Custom Workout', source: 'manual' });
    setTemplate({
      name: 'Test',
      sessions: [{ dayOfWeek: 1, slot: 'am', type: 'Intervals' }],
    });
    expandTemplate('2026-03-16', 7);
    const sessions = getSessionsForDate('2026-03-16');
    // Should keep the manual session, not add template
    expect(sessions.some(s => s.type === 'Custom Workout')).toBe(true);
    expect(sessions.some(s => s.source === 'template')).toBe(false);
  });

  it('clearSessions removes all sessions', () => {
    const { upsertSession, clearSessions } = useTrainingPlanStore.getState();
    upsertSession({ date: '2026-03-17', slot: 'am', type: 'Run', source: 'manual' });
    upsertSession({ date: '2026-03-18', slot: 'am', type: 'Swim', source: 'manual' });
    clearSessions();
    expect(Object.keys(useTrainingPlanStore.getState().plannedSessions)).toHaveLength(0);
  });
});
