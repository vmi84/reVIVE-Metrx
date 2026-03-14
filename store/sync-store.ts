import { create } from 'zustand';

interface SyncState {
  lastWhoopSync: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  pendingOfflineActions: number;

  setSyncInProgress: (val: boolean) => void;
  setLastWhoopSync: (date: string) => void;
  setSyncError: (error: string | null) => void;
  setPendingOfflineActions: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  lastWhoopSync: null,
  syncInProgress: false,
  syncError: null,
  pendingOfflineActions: 0,

  setSyncInProgress: (val) => set({ syncInProgress: val }),
  setLastWhoopSync: (date) => set({ lastWhoopSync: date, syncError: null }),
  setSyncError: (error) => set({ syncError: error, syncInProgress: false }),
  setPendingOfflineActions: (count) => set({ pendingOfflineActions: count }),
}));
