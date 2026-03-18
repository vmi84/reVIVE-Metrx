/**
 * Dashboard — Infinite-scrolling daily feed.
 *
 * Today's card sits at top. Past days load as you scroll. Accordion: one card expanded at a time.
 * CheckinPromptCard appears when morning check-in is incomplete.
 */

import { useEffect, useCallback, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFeed } from '../../hooks/use-feed';
import { useIACI } from '../../hooks/use-iaci';
import { useWhoopSync } from '../../hooks/use-whoop-sync';
import { useLoadCapacity } from '../../hooks/use-load-capacity';
import { useDailyStore } from '../../store/daily-store';
import { usePhysiologyStore } from '../../store/physiology-store';
import { useFeedStore } from '../../store/feed-store';
import { useSyncStore } from '../../store/sync-store';
import { DailyCard } from '../../components/feed/DailyCard';
import { CheckinPromptCard } from '../../components/feed/CheckinPromptCard';
import { ThemedText } from '../../components/ui/ThemedText';
import { FeedDay } from '../../lib/types/feed';
import { COLORS } from '../../lib/utils/constants';
import { today } from '../../lib/utils/date';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function Dashboard() {
  const { days, loading, loadingMore, hasMore, loadMore, refresh, carryForwardCheckin } = useFeed();
  const { computeToday, computeDemo } = useIACI();
  const { syncMorningData, syncHistorical, isConnected, syncing, syncProgress } = useWhoopSync();
  const { checkinCompleted, deviceSynced, iaci } = useDailyStore();
  const hasImportedData = usePhysiologyStore((s) => s.hasData);
  const recordCount = usePhysiologyStore((s) => Object.keys(s.records).length);
  const { expandedCardDate, setExpandedCard } = useFeedStore();
  const syncError = useSyncStore((s) => s.syncError);
  const [syncStatus, setSyncStatus] = useState<string>('idle');

  // Trigger load capacity computation when IACI is available
  useLoadCapacity();

  // Auto-sync device data on mount — works in both online and offline mode
  // If no data exists yet, trigger historical backfill (fetches all available data)
  useEffect(() => {
    (async () => {
      setSyncStatus('checking connection…');
      const connected = await isConnected();
      setSyncStatus(connected ? 'connected' : 'not connected');
      if (!connected) return;

      try {
        if (!hasImportedData) {
          setSyncStatus('backfilling historical data…');
          await syncHistorical();
          setSyncStatus(`done — ${usePhysiologyStore.getState().lastImport?.recordCount ?? 0} records`);
        } else {
          setSyncStatus('syncing today…');
          await syncMorningData();
          setSyncStatus('synced');
        }
        refresh();
      } catch (err) {
        setSyncStatus(`error: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, []);

  // Auto-compute IACI after check-in or device sync
  useEffect(() => {
    if (!checkinCompleted) return;

    if (isSupabaseConfigured && deviceSynced) {
      computeToday();
    } else {
      computeDemo();
    }
  }, [checkinCompleted, deviceSynced]);

  // Auto-compute IACI from imported device data (no check-in needed)
  useEffect(() => {
    if (!isSupabaseConfigured && hasImportedData && !iaci && !checkinCompleted) {
      computeDemo();
    }
  }, [hasImportedData]);

  // Auto-expand today's card on first load
  useEffect(() => {
    if (days.length > 0 && expandedCardDate === null) {
      setExpandedCard(today());
    }
  }, [days.length]);

  // Pull-to-refresh: sync device data (last 7 days) then reload feed
  const handleRefresh = useCallback(async () => {
    const connected = await isConnected();
    if (connected) {
      // Sync last 7 days to catch any recent data changes
      await syncHistorical(7);
    }
    await refresh();
  }, [isConnected, syncHistorical, refresh]);

  const handleToggleExpand = useCallback((date: string) => {
    setExpandedCard(expandedCardDate === date ? null : date);
  }, [expandedCardDate]);

  const handleMetricAccept = useCallback((metric: string) => {
    // Metric accept is handled inside MetricRow → feed store
  }, []);

  const handleMetricEdit = useCallback((metric: string, value: number) => {
    // Metric edit triggers IACI recompute for today
    computeToday();
  }, []);

  const renderItem = useCallback(({ item }: { item: FeedDay }) => (
    <DailyCard
      day={item}
      isExpanded={expandedCardDate === item.date}
      onToggleExpand={() => handleToggleExpand(item.date)}
      onMetricAccept={handleMetricAccept}
      onMetricEdit={handleMetricEdit}
    />
  ), [expandedCardDate, handleToggleExpand]);

  const keyExtractor = useCallback((item: FeedDay) => item.date, []);

  const ListHeader = useCallback(() => {
    if (checkinCompleted) return null;
    return (
      <CheckinPromptCard
        syncing={syncing}
        deviceSynced={deviceSynced}
        onUseYesterday={carryForwardCheckin}
      />
    );
  }, [checkinCompleted, syncing, deviceSynced, carryForwardCheckin]);

  const ListFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [loadingMore]);

  const ListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.loadingText}>
            Loading your feed...
          </ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <ThemedText variant="body" color={COLORS.textSecondary}>
          No data yet. Complete your morning check-in to get started.
        </ThemedText>
      </View>
    );
  }, [loading]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  const SyncBanner = useCallback(() => {
    // Always show status banner for debugging sync issues
    const hasError = !!syncError;
    const isActive = syncing && !!syncProgress;
    const bannerColor = hasError ? '#FF444433' : isActive ? COLORS.surface : '#00C48C22';
    const borderCol = hasError ? '#FF4444' : isActive ? COLORS.border : '#00C48C44';

    return (
      <View style={[styles.syncBanner, { backgroundColor: bannerColor, borderColor: borderCol }]}>
        {isActive && <ActivityIndicator size="small" color={COLORS.primary} />}
        <View style={{ flex: 1 }}>
          <ThemedText variant="caption" color={hasError ? '#FF4444' : COLORS.textSecondary} style={styles.syncText}>
            {hasError ? `Sync error: ${syncError}` : isActive ? syncProgress : `Sync: ${syncStatus} · ${recordCount} records stored`}
          </ThemedText>
        </View>
        {!isActive && (
          <TouchableOpacity onPress={handleRefresh}>
            <ThemedText variant="caption" color={COLORS.primary} style={{ fontWeight: '700' }}>
              Sync
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [syncing, syncProgress, syncError, syncStatus, recordCount, handleRefresh]);

  return (
    <FlatList<FeedDay>
      data={days}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={() => (
        <View>
          <SyncBanner />
          <ListHeader />
        </View>
      )}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={(loading && days.length > 0) || syncing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        days.length === 0 && styles.emptyContent,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  syncText: {
    fontSize: 12,
  },
});
