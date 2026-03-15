import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileStorage } from '../lib/utils/file-storage';
import { CanonicalPhysiologyRecord } from '../lib/types/canonical';

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

  /** Upsert records (newer import wins) */
  upsertRecords: (records: CanonicalPhysiologyRecord[]) => void;
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

      upsertRecords: (newRecords) => {
        set((state) => {
          const updated = { ...state.records };
          for (const r of newRecords) {
            updated[r.date] = r;
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
