import { create } from 'zustand';
import { IACIResult, SubsystemScores } from '../lib/types/iaci';
import { RecoveryRecommendation } from '../lib/types/protocols';

/** Check-in data stored for demo mode IACI computation */
export interface CheckinData {
  overallEnergy: number;       // 1-5
  sleepQuality: number;        // 1-5
  soreness: Record<string, number>;
  stiffness: number;           // 1-5
  heavyLegs: boolean;
  motivation: number;          // 1-5
  stress: number;              // 1-5
  mentalFatigue: number;       // 1-5
  hydrationLiters: number;
  electrolytes: boolean;
  proteinAdequate: boolean;
  lateCaffeine: boolean;
  lateAlcohol: boolean;
  isTraveling: boolean;
  giIssues: number;            // 1-5
}

interface DailyState {
  date: string | null;
  iaci: IACIResult | null;
  loading: boolean;
  checkinCompleted: boolean;
  whoopSynced: boolean;
  checkinData: CheckinData | null;

  setDate: (date: string) => void;
  setIACI: (result: IACIResult) => void;
  setCheckinCompleted: (val: boolean) => void;
  setWhoopSynced: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  setCheckinData: (data: CheckinData) => void;
  reset: () => void;
}

export const useDailyStore = create<DailyState>((set) => ({
  date: null,
  iaci: null,
  loading: false,
  checkinCompleted: false,
  whoopSynced: false,
  checkinData: null,

  setDate: (date) => set({ date }),
  setIACI: (result) => set({ iaci: result, loading: false }),
  setCheckinCompleted: (val) => set({ checkinCompleted: val }),
  setWhoopSynced: (val) => set({ whoopSynced: val }),
  setLoading: (val) => set({ loading: val }),
  setCheckinData: (data) => set({ checkinData: data }),
  reset: () => set({
    date: null,
    iaci: null,
    loading: false,
    checkinCompleted: false,
    whoopSynced: false,
    checkinData: null,
  }),
}));
