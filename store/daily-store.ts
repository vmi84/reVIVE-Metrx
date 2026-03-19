import { create } from 'zustand';
import { IACIResult, SubsystemScores } from '../lib/types/iaci';
import { RecoveryRecommendation } from '../lib/types/protocols';
import { DeviceSourceKey } from '../lib/types/feed';
import type { AthleteMode, TrainingSchedule } from '../lib/types/athlete-mode';

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
  readiness: number;           // 1-5 (Tier 1 quick input)
  quickCheckInOnly: boolean;   // true if only Tier 1 was submitted
  feelingIll: boolean;
  illnessSymptoms: string[];   // e.g. ['Sore throat', 'Fever', 'Congestion']
  illnessSeverityScore: number; // weighted: severe=3, moderate=2, mild=1 per symptom
  additionalSymptoms: string;  // free text
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
  /** Athlete mode: recreational (default) or competitive. */
  athleteMode: AthleteMode;
  /** Training schedule: single or double (2-a-day). */
  trainingSchedule: TrainingSchedule;

  setDate: (date: string) => void;
  setIACI: (result: IACIResult) => void;
  setCheckinCompleted: (val: boolean) => void;
  setDeviceSynced: (val: boolean, source?: DeviceSourceKey) => void;
  setLoading: (val: boolean) => void;
  setCheckinData: (data: CheckinData) => void;
  setAthleteMode: (mode: AthleteMode) => void;
  setTrainingSchedule: (schedule: TrainingSchedule) => void;
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
  athleteMode: 'recreational',
  trainingSchedule: 'single',

  setDate: (date) => set({ date }),
  setIACI: (result) => set({ iaci: result, loading: false }),
  setCheckinCompleted: (val) => set({ checkinCompleted: val }),
  setDeviceSynced: (val, source) => set({ deviceSynced: val, deviceSource: source ?? null }),
  setLoading: (val) => set({ loading: val }),
  setCheckinData: (data) => set({ checkinData: data }),
  setAthleteMode: (mode) => set({ athleteMode: mode }),
  setTrainingSchedule: (schedule) => set({ trainingSchedule: schedule }),
  reset: () => set({
    date: null,
    iaci: null,
    loading: false,
    checkinCompleted: false,
    deviceSynced: false,
    deviceSource: null,
    checkinData: null,
    athleteMode: 'recreational',
    trainingSchedule: 'single',
  }),
}));
