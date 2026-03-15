import { create } from 'zustand';
import { IACIResult, SubsystemScores } from '../lib/types/iaci';
import { RecoveryRecommendation } from '../lib/types/protocols';
import { DeviceSourceKey } from '../lib/types/feed';

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
  /** Whether device data (from any wearable) has been synced for today. */
  deviceSynced: boolean;
  /** Which device provided today's data (e.g. 'whoop', 'garmin'). */
  deviceSource: DeviceSourceKey | null;
  checkinData: CheckinData | null;

  setDate: (date: string) => void;
  setIACI: (result: IACIResult) => void;
  setCheckinCompleted: (val: boolean) => void;
  setDeviceSynced: (val: boolean, source?: DeviceSourceKey) => void;
  setLoading: (val: boolean) => void;
  setCheckinData: (data: CheckinData) => void;
  reset: () => void;
}

export const useDailyStore = create<DailyState>((set) => ({
  date: null,
  iaci: null,
  loading: false,
  checkinCompleted: false,
  deviceSynced: false,
  deviceSource: null,
  checkinData: null,

  setDate: (date) => set({ date }),
  setIACI: (result) => set({ iaci: result, loading: false }),
  setCheckinCompleted: (val) => set({ checkinCompleted: val }),
  setDeviceSynced: (val, source) => set({ deviceSynced: val, deviceSource: source ?? null }),
  setLoading: (val) => set({ loading: val }),
  setCheckinData: (data) => set({ checkinData: data }),
  reset: () => set({
    date: null,
    iaci: null,
    loading: false,
    checkinCompleted: false,
    deviceSynced: false,
    deviceSource: null,
    checkinData: null,
  }),
}));
