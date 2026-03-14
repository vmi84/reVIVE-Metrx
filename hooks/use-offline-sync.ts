import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSyncStore } from '../store/sync-store';

/**
 * Phase 2 stub — will handle offline data caching and sync.
 * For now, monitors app state for sync triggers.
 */
export function useOfflineSync() {
  const { setPendingOfflineActions } = useSyncStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // App came to foreground — trigger sync check
        // Phase 2: Check for pending offline actions and sync
      }
    });

    return () => subscription.remove();
  }, []);

  return { pendingActions: 0 };
}
