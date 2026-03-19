/**
 * Settings Store — Persisted athlete profile and app settings.
 *
 * Stores onboarding data, athlete mode, training preferences, and equipment.
 * Persisted to file system so it survives app restarts.
 * The daily-store reads from here on initialization.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileStorage } from '../lib/utils/file-storage';
import type { AthleteMode, TrainingSchedule, TrainingPhase, ExperienceLevel } from '../lib/types/athlete-mode';

interface SettingsState {
  // Onboarding completion
  onboardingCompleted: boolean;

  // Athlete profile
  sports: string[];
  experienceLevel: ExperienceLevel;
  athleteMode: AthleteMode;
  trainingSchedule: TrainingSchedule;
  trainingFrequency: number | null;
  trainingHoursWeek: number | null;
  trainingPhase: TrainingPhase;
  primaryGoal: string;
  recoveryPriorities: string[];
  /** User's preferred recovery activities — these get weighted higher in recommendations */
  preferredRecoveryActivities: string[];
  availableEquipment: string[];
  /** Backup of Whoop tokens for recovery after SecureStore wipe */
  whoopTokenBackup: { token: string; refresh: string; expiry: string } | null;
  trainingEnvironment: string[];
  dietaryApproach: string;
  knownConditions: string;

  // Actions
  setOnboardingCompleted: (val: boolean) => void;
  updateProfile: (updates: Partial<Omit<SettingsState,
    'setOnboardingCompleted' | 'updateProfile' | 'reset'>>) => void;
  reset: () => void;
}

const DEFAULTS = {
  onboardingCompleted: false,
  sports: [],
  experienceLevel: 'intermediate' as ExperienceLevel,
  athleteMode: 'recreational' as AthleteMode,
  trainingSchedule: 'single' as TrainingSchedule,
  trainingFrequency: null,
  trainingHoursWeek: null,
  trainingPhase: 'build' as TrainingPhase,
  primaryGoal: '',
  recoveryPriorities: [],
  preferredRecoveryActivities: [],
  availableEquipment: [],
  whoopTokenBackup: null,
  trainingEnvironment: [],
  dietaryApproach: '',
  knownConditions: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),

      updateProfile: (updates) => set((state) => ({ ...state, ...updates })),

      reset: () => set(DEFAULTS),
    }),
    {
      name: 'revive-settings',
      storage: createJSONStorage(() => fileStorage),
      partialize: (state) => {
        // Persist everything except functions
        const { setOnboardingCompleted, updateProfile, reset, ...data } = state;
        return data;
      },
    },
  ),
);
