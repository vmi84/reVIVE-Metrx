import { useWorkoutStore } from '../workout-store';

describe('useWorkoutStore', () => {
  beforeEach(() => {
    useWorkoutStore.setState({ activeWorkout: null, recentWorkouts: [] });
  });

  it('starts with no active workout', () => {
    expect(useWorkoutStore.getState().activeWorkout).toBeNull();
  });

  it('starts with empty recent workouts', () => {
    expect(useWorkoutStore.getState().recentWorkouts).toEqual([]);
  });

  it('startWorkout creates workout with defaults', () => {
    useWorkoutStore.getState().startWorkout({ workoutType: 'run' });
    const workout = useWorkoutStore.getState().activeWorkout;
    expect(workout).not.toBeNull();
    expect(workout!.workoutType).toBe('run');
    expect(workout!.source).toBe('manual');
    expect(workout!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('startWorkout merges overrides with defaults', () => {
    useWorkoutStore.getState().startWorkout({
      workoutType: 'cycle',
      rpe: 7,
      notes: 'hill ride',
    });
    const workout = useWorkoutStore.getState().activeWorkout;
    expect(workout!.workoutType).toBe('cycle');
    expect(workout!.rpe).toBe(7);
    expect(workout!.notes).toBe('hill ride');
  });

  it('endWorkout clears active workout', () => {
    useWorkoutStore.getState().startWorkout({ workoutType: 'run' });
    expect(useWorkoutStore.getState().activeWorkout).not.toBeNull();
    useWorkoutStore.getState().endWorkout();
    expect(useWorkoutStore.getState().activeWorkout).toBeNull();
  });

  it('setRecentWorkouts updates list', () => {
    const workouts = [
      { id: '1', workoutType: 'run' },
      { id: '2', workoutType: 'cycle' },
    ] as any[];
    useWorkoutStore.getState().setRecentWorkouts(workouts);
    expect(useWorkoutStore.getState().recentWorkouts).toHaveLength(2);
  });

  it('full cycle: start → end → recent', () => {
    useWorkoutStore.getState().startWorkout({ workoutType: 'swim' });
    expect(useWorkoutStore.getState().activeWorkout!.workoutType).toBe('swim');
    useWorkoutStore.getState().endWorkout();
    expect(useWorkoutStore.getState().activeWorkout).toBeNull();
    useWorkoutStore.getState().setRecentWorkouts([{ id: '1', workoutType: 'swim' } as any]);
    expect(useWorkoutStore.getState().recentWorkouts).toHaveLength(1);
  });
});
