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

export type AppTheme = 'dark' | 'light';

interface SettingsState {
  // Onboarding completion
  onboardingCompleted: boolean;

  // App preferences
  /** Light or dark theme */
  theme: AppTheme;

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
  /** User's preferred training modalities, ranked 1-3 (e.g., ['Running', 'Cycling', 'Swimming']) */
  preferredTrainingModalities: string[];
  availableEquipment: string[];
  /** Backup of Whoop tokens for recovery after SecureStore wipe */
  whoopTokenBackup: { token: string; refresh: string; expiry: string } | null;
  trainingEnvironment: string[];
  dietaryApproach: string;
  knownConditions: string;

  // Device settings
  /** Whether HealthKit integration is enabled (user hasn't "disconnected" in-app). */
  healthKitEnabled: boolean;
  /** Primary device for data when multiple sources have data for the same date. */
  primaryDevice: string | null;

  // Actions
  setOnboardingCompleted: (val: boolean) => void;
  updateProfile: (updates: Partial<Omit<SettingsState,
    'setOnboardingCompleted' | 'updateProfile' | 'reset'>>) => void;
  reset: () => void;
}

const DEFAULTS = {
  onboardingCompleted: false,
  theme: 'dark' as AppTheme,
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
  preferredTrainingModalities: [],
  availableEquipment: [],
  whoopTokenBackup: null,
  trainingEnvironment: [],
  dietaryApproach: '',
  knownConditions: '',
  healthKitEnabled: false,
  primaryDevice: null,
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
