import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileStorage } from '../lib/utils/file-storage';
import { CanonicalPhysiologyRecord } from '../lib/types/canonical';

/** Merge strategy for upsertRecords. */
export type MergeStrategy = 'overwrite' | 'fill-nulls';

/**
 * Merge a secondary record into an existing primary record,
 * only filling fields that are null in the primary.
 */
function mergeRecordFillNulls(
  primary: CanonicalPhysiologyRecord,
  secondary: CanonicalPhysiologyRecord,
): CanonicalPhysiologyRecord {
  return {
    ...primary,
    // Keep primary source
    sleep: mergeSection(primary.sleep, secondary.sleep),
    cardiovascular: mergeSection(primary.cardiovascular, secondary.cardiovascular),
    recovery: mergeSection(primary.recovery, secondary.recovery),
    workouts: primary.workouts.length > 0 ? primary.workouts : secondary.workouts,
    dayStrain: primary.dayStrain ?? secondary.dayStrain,
  };
}

/** Merge two metric sections: only fill null fields from secondary. */
function mergeSection<T>(primary: T, secondary: T): T {
  const result = { ...primary };
  const keys = Object.keys(secondary as object) as (keyof T)[];
  for (const key of keys) {
    if (result[key] == null && secondary[key] != null) {
      result[key] = secondary[key];
    }
  }
  return result;
}

interface PhysiologyState {
  /** Imported physiology records keyed by date (YYYY-MM-DD) */
  records: Record<string, CanonicalPhysiologyRecord>;
  /** Whether any data has been imported */
  hasData: boolean;
  /** Import metadata */
  lastImport: {
    source: string;
    recordCount: number;
    dateRange: { start: string; end: string } | null;
    importedAt: string;
  } | null;

  /** Upsert records. 'overwrite' replaces; 'fill-nulls' only fills missing fields. */
  upsertRecords: (records: CanonicalPhysiologyRecord[], strategy?: MergeStrategy) => void;
  /** Get record for a specific date */
  getRecord: (date: string) => CanonicalPhysiologyRecord | null;
  /** Get the most recent record */
  getLatest: () => CanonicalPhysiologyRecord | null;
  /** Clear all imported data */
  clear: () => void;
}

export const usePhysiologyStore = create<PhysiologyState>()(
  persist(
    (set, get) => ({
      records: {},
      hasData: false,
      lastImport: null,

      upsertRecords: (newRecords, strategy = 'overwrite') => {
        set((state) => {
          const updated = { ...state.records };
          for (const r of newRecords) {
            if (strategy === 'fill-nulls' && updated[r.date]) {
              // Only fill null fields from the new record — never overwrite existing data
              updated[r.date] = mergeRecordFillNulls(updated[r.date], r);
            } else {
              updated[r.date] = r;
            }
          }
          return { records: updated, hasData: Object.keys(updated).length > 0 };
        });
      },

      getRecord: (date) => get().records[date] ?? null,

      getLatest: () => {
        const dates = Object.keys(get().records).sort();
        if (dates.length === 0) return null;
        return get().records[dates[dates.length - 1]];
      },

      clear: () => set({ records: {}, hasData: false, lastImport: null }),
    }),
    {
      name: 'revive-physiology-store',
      storage: createJSONStorage(() => fileStorage),
      partialize: (state) => ({
        records: state.records,
        hasData: state.hasData,
        lastImport: state.lastImport,
      }),
    },
  ),
);
