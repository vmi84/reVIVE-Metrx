/**
 * Feed Store — manages the infinite-scrolling daily card feed state.
 */

import { create } from 'zustand';
import { FeedDay, MetricValidation } from '../lib/types/feed';
import { LoadCapacityResult, RecoveryPlan, RecoveryDayPlan } from '../lib/types/load-capacity';
import { IACIResult } from '../lib/types/iaci';

interface FeedState {
  days: FeedDay[];
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  expandedCardDate: string | null;

  setDays: (days: FeedDay[]) => void;
  appendDays: (days: FeedDay[]) => void;
  setCursor: (cursor: string | null) => void;
  setHasMore: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  setLoadingMore: (val: boolean) => void;
  setExpandedCard: (date: string | null) => void;

  // Update a specific day's data
  updateDay: (date: string, partial: Partial<FeedDay>) => void;
  updateDayIACI: (date: string, iaci: IACIResult) => void;
  updateDayLoadCapacity: (date: string, lc: LoadCapacityResult) => void;
  updateDayRecoveryPlan: (date: string, plan: RecoveryPlan) => void;
  updateDayRecoveryDayPlan: (date: string, plan: RecoveryDayPlan) => void;
  setMetricValidation: (date: string, metric: string, validation: MetricValidation) => void;

  reset: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  days: [],
  cursor: null,
  hasMore: true,
  loading: false,
  loadingMore: false,
  expandedCardDate: null,

  setDays: (days) => set({ days }),
  appendDays: (newDays) => set((state) => ({
    days: [...state.days, ...newDays],
  })),
  setCursor: (cursor) => set({ cursor }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setExpandedCard: (expandedCardDate) => set({ expandedCardDate }),

  updateDay: (date, partial) => set((state) => ({
    days: state.days.map(d =>
      d.date === date ? { ...d, ...partial } : d,
    ),
  })),

  updateDayIACI: (date, iaci) => set((state) => ({
    days: state.days.map(d =>
      d.date === date ? { ...d, iaci } : d,
    ),
  })),

  updateDayLoadCapacity: (date, lc) => set((state) => ({
    days: state.days.map(d =>
      d.date === date ? { ...d, loadCapacity: lc } : d,
    ),
  })),

  updateDayRecoveryPlan: (date, plan) => set((state) => ({
    days: state.days.map(d =>
      d.date === date ? { ...d, recoveryPlan: plan } : d,
    ),
  })),

  updateDayRecoveryDayPlan: (date, plan) => set((state) => ({
    days: state.days.map(d =>
      d.date === date ? { ...d, recoveryDayPlan: plan } : d,
    ),
  })),

  setMetricValidation: (date, metric, validation) => set((state) => ({
    days: state.days.map(d =>
      d.date === date
        ? {
            ...d,
            metricValidations: { ...d.metricValidations, [metric]: validation },
          }
        : d,
    ),
  })),

  reset: () => set({
    days: [],
    cursor: null,
    hasMore: true,
    loading: false,
    loadingMore: false,
    expandedCardDate: null,
  }),
}));
