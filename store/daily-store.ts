import { create } from 'zustand';
import { IACIResult, SubsystemScores } from '../lib/types/iaci';
import { RecoveryRecommendation } from '../lib/types/protocols';

interface DailyState {
  date: string | null;
  iaci: IACIResult | null;
  loading: boolean;
  checkinCompleted: boolean;
  whoopSynced: boolean;

  setDate: (date: string) => void;
  setIACI: (result: IACIResult) => void;
  setCheckinCompleted: (val: boolean) => void;
  setWhoopSynced: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  reset: () => void;
}

export const useDailyStore = create<DailyState>((set) => ({
  date: null,
  iaci: null,
  loading: false,
  checkinCompleted: false,
  whoopSynced: false,

  setDate: (date) => set({ date }),
  setIACI: (result) => set({ iaci: result, loading: false }),
  setCheckinCompleted: (val) => set({ checkinCompleted: val }),
  setWhoopSynced: (val) => set({ whoopSynced: val }),
  setLoading: (val) => set({ loading: val }),
  reset: () => set({
    date: null,
    iaci: null,
    loading: false,
    checkinCompleted: false,
    whoopSynced: false,
  }),
}));
