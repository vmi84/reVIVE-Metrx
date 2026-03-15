import { create } from 'zustand';

interface SyncState {
  /** ISO timestamp of last successful device sync (any source). */
  lastDeviceSync: string | null;
  /** Which device was synced last. */
  lastSyncSource: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  pendingOfflineActions: number;

  setSyncInProgress: (val: boolean) => void;
  setLastDeviceSync: (date: string, source: string) => void;
  setSyncError: (error: string | null) => void;
  setPendingOfflineActions: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  lastDeviceSync: null,
  lastSyncSource: null,
  syncInProgress: false,
  syncError: null,
  pendingOfflineActions: 0,

  setSyncInProgress: (val) => set({ syncInProgress: val }),
  setLastDeviceSync: (date, source) => set({ lastDeviceSync: date, lastSyncSource: source, syncError: null }),
  setSyncError: (error) => set({ syncError: error, syncInProgress: false }),
  setPendingOfflineActions: (count) => set({ pendingOfflineActions: count }),
}));
