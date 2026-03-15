import { useSyncStore } from '../sync-store';

describe('useSyncStore', () => {
  beforeEach(() => {
    useSyncStore.setState({
      lastDeviceSync: null,
      lastSyncSource: null,
      syncInProgress: false,
      syncError: null,
      pendingOfflineActions: 0,
    });
  });

  it('starts with default state', () => {
    const state = useSyncStore.getState();
    expect(state.lastDeviceSync).toBeNull();
    expect(state.lastSyncSource).toBeNull();
    expect(state.syncInProgress).toBe(false);
    expect(state.syncError).toBeNull();
    expect(state.pendingOfflineActions).toBe(0);
  });

  it('setSyncInProgress updates flag', () => {
    useSyncStore.getState().setSyncInProgress(true);
    expect(useSyncStore.getState().syncInProgress).toBe(true);
    useSyncStore.getState().setSyncInProgress(false);
    expect(useSyncStore.getState().syncInProgress).toBe(false);
  });

  it('setLastDeviceSync updates date and source', () => {
    useSyncStore.getState().setLastDeviceSync('2024-01-15T10:00:00Z', 'whoop');
    const state = useSyncStore.getState();
    expect(state.lastDeviceSync).toBe('2024-01-15T10:00:00Z');
    expect(state.lastSyncSource).toBe('whoop');
  });

  it('setLastDeviceSync clears error', () => {
    useSyncStore.getState().setSyncError('some error');
    useSyncStore.getState().setLastDeviceSync('2024-01-15T10:00:00Z', 'whoop');
    expect(useSyncStore.getState().syncError).toBeNull();
  });

  it('setSyncError sets error and clears inProgress', () => {
    useSyncStore.getState().setSyncInProgress(true);
    useSyncStore.getState().setSyncError('Network failed');
    const state = useSyncStore.getState();
    expect(state.syncError).toBe('Network failed');
    expect(state.syncInProgress).toBe(false);
  });

  it('setSyncError with null clears error', () => {
    useSyncStore.getState().setSyncError('some error');
    useSyncStore.getState().setSyncError(null);
    expect(useSyncStore.getState().syncError).toBeNull();
  });

  it('setPendingOfflineActions updates count', () => {
    useSyncStore.getState().setPendingOfflineActions(5);
    expect(useSyncStore.getState().pendingOfflineActions).toBe(5);
  });
});
