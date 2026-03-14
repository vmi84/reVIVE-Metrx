/**
 * Feed types for the infinite-scrolling daily card interface.
 */

import { DailyPhysiologyRow, SubjectiveEntryRow, WorkoutRow } from './database';
import { IACIResult } from './iaci';
import { LoadCapacityResult, RecoveryPlan, RecoveryDayPlan } from './load-capacity';

// --- Feed Day ---

export interface FeedDay {
  date: string;
  physiology: DailyPhysiologyRow | null;
  subjective: SubjectiveEntryRow | null;
  iaci: IACIResult | null;
  loadCapacity: LoadCapacityResult | null;
  recoveryPlan: RecoveryPlan | null;
  recoveryDayPlan: RecoveryDayPlan | null;
  whoopSynced: boolean;
  checkinCompleted: boolean;
  workouts: WorkoutRow[];
  metricSources: Record<string, MetricSource>;
  metricValidations: Record<string, MetricValidation>;
}

export type MetricSource = 'whoop' | 'manual' | 'inherited' | 'computed';

export interface MetricValidation {
  metric: string;
  originalValue: number;
  currentValue: number;
  status: 'pending' | 'accepted' | 'edited';
  source: MetricSource;
}
