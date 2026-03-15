/**
 * Feed types for the infinite-scrolling daily card interface.
 *
 * Data source types are generic — not tied to any specific wearable vendor.
 * The `deviceSource` field carries the original source name (e.g. 'whoop',
 * 'garmin', 'oura', 'apple_health', 'manual') so UI can display it.
 */

import { DailyPhysiologyRow, SubjectiveEntryRow, WorkoutRow } from './database';
import { IACIResult } from './iaci';
import { LoadCapacityResult, RecoveryPlan, RecoveryDayPlan } from './load-capacity';

// --- Supported data sources ---

/** Known device/data source identifiers. Extensible — any string is accepted. */
export type DeviceSourceKey = 'whoop' | 'garmin' | 'oura' | 'apple_health' | 'polar' | 'coros' | string;

/** Where a metric value originated. */
export type MetricSource = DeviceSourceKey | 'manual' | 'inherited' | 'computed';

/** Display metadata for a data source. */
export interface DeviceSourceMeta {
  label: string;     // e.g. 'WHOOP', 'Garmin', 'Oura'
  color: string;     // badge accent color
}

/** Registry of known sources → display metadata. Extend as new adapters are added. */
export const DEVICE_SOURCE_REGISTRY: Record<string, DeviceSourceMeta> = {
  whoop:        { label: 'WHOOP',        color: '#44B700' },
  garmin:       { label: 'Garmin',       color: '#007DC3' },
  oura:         { label: 'Oura',         color: '#C4A35A' },
  apple_health: { label: 'Apple Health', color: '#FF3B30' },
  polar:        { label: 'Polar',        color: '#D32F2F' },
  coros:        { label: 'COROS',        color: '#FF6600' },
  manual:       { label: 'Manual',       color: '#6366F1' },
  inherited:    { label: 'Yesterday',    color: '#F59E0B' },
  computed:     { label: 'Computed',     color: '#6B7280' },
};

/** Resolve display metadata for any source key. Falls back gracefully for unknown sources. */
export function getSourceMeta(source: string): DeviceSourceMeta {
  return DEVICE_SOURCE_REGISTRY[source] ?? {
    label: source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    color: '#6366F1',
  };
}

// --- Feed Day ---

export interface FeedDay {
  date: string;
  physiology: DailyPhysiologyRow | null;
  subjective: SubjectiveEntryRow | null;
  iaci: IACIResult | null;
  loadCapacity: LoadCapacityResult | null;
  recoveryPlan: RecoveryPlan | null;
  recoveryDayPlan: RecoveryDayPlan | null;

  /** True if physiology data was synced/imported from a wearable device. */
  deviceSynced: boolean;
  /** Source device key (e.g. 'whoop', 'garmin'). Null if no device data. */
  deviceSource: DeviceSourceKey | null;

  checkinCompleted: boolean;
  workouts: WorkoutRow[];
  metricSources: Record<string, MetricSource>;
  metricValidations: Record<string, MetricValidation>;
}

export interface MetricValidation {
  metric: string;
  originalValue: number;
  currentValue: number;
  status: 'pending' | 'accepted' | 'edited';
  source: MetricSource;
}
